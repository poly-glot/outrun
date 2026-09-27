import { existsSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core');
const BASE_URL = process.env.A11Y_URL ?? 'http://localhost:3010';

const contentRoot = join(process.cwd(), 'content');
const directories = (parent) => readdirSync(parent, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
const isLocale = (campaign, locale) => existsSync(join(contentRoot, campaign, locale, 'site.mdx')) && existsSync(join(contentRoot, campaign, locale, 'index.mdx'));
const subpagesOf = (campaign, locale) =>
    readdirSync(join(contentRoot, campaign, locale))
        .filter((name) => name.endsWith('.mdx') && name !== 'site.mdx' && name !== 'index.mdx')
        .map((name) => `/${campaign}/${locale}/${name.replace(/\.mdx$/, '')}`)
        .sort();

const CAMPAIGNS = directories(contentRoot)
    .map((campaign) => ({
        locales: directories(join(contentRoot, campaign))
            .filter((locale) => isLocale(campaign, locale))
            .map((locale) => ({ code: locale, index: `/${campaign}/${locale}`, subpages: subpagesOf(campaign, locale) })),
        name: campaign,
    }))
    .filter((campaign) => campaign.locales.length > 0);

const defaultLocaleOf = (campaign) => campaign.locales.find((locale) => locale.code === 'en') ?? campaign.locales[0];

const INDEXES = CAMPAIGNS.flatMap((campaign) => campaign.locales.map((locale) => locale.index));
const SUBPAGES = CAMPAIGNS.flatMap((campaign) => campaign.locales.flatMap((locale) => locale.subpages));
const DEFAULT_INDEXES = CAMPAIGNS.map((campaign) => defaultLocaleOf(campaign).index);
const TRANSLATED_INDEXES = CAMPAIGNS.flatMap((campaign) => campaign.locales.filter((locale) => locale.code !== 'en').map((locale) => locale.index));
const OUTLINE_PAGES = [...INDEXES, ...CAMPAIGNS.flatMap((campaign) => defaultLocaleOf(campaign).subpages)];
const PAGES = [...INDEXES, ...SUBPAGES];
const DESKTOP = { width: 1366, height: 768 };
const PHONE = { width: 390, height: 844 };
const VIEWPORTS = [DESKTOP, PHONE];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const BLOCKING = new Set(['serious', 'critical']);
const ENGLISH_LABELS = ['Menu', 'Close', 'Language', 'Share on', 'Play video', 'Show image', 'Previous image', 'Next image', 'Skip to content', 'Loading', 'Sections', 'Gallery', 'note '];
const TEXT_SPACING = '* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }';
const MINIMUM_TARGET = 24;
const LARGE_TEXT_CONTRAST = 3;
const BODY_TEXT_CONTRAST = 4.5;

function launchBrowser() {
    return process.env.CI ? chromium.launch() : chromium.launch({ channel: 'chrome' });
}

function runAxe(tags) {
    return window.axe.run(document, { runOnly: { type: 'tag', values: tags } });
}

function describe(violation) {
    const firstTarget = violation.nodes[0]?.target.join(' ') ?? '';

    return `${violation.impact} ${violation.id}: ${violation.help} (${violation.nodes.length} nodes) — ${firstTarget}`;
}

async function settleReveals(page) {
    const steps = await page.evaluate(() => Math.ceil(document.documentElement.scrollHeight / window.innerHeight));

    for (let step = 1; step <= steps; step += 1) {
        await page.evaluate((index) => window.scrollTo(0, index * window.innerHeight), step);
        await page.waitForTimeout(150);
    }

    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(700);
}

async function auditPage(browser, path, viewport) {
    const page = await browser.newPage({ viewport });
    const response = await page.goto(BASE_URL + path, { waitUntil: 'networkidle' });

    if (response?.status() === 404) {
        await page.close();
        return null;
    }

    await settleReveals(page);
    await page.addScriptTag({ path: AXE_PATH });
    const { violations } = await page.evaluate(runAxe, TAGS);
    await page.close();

    return violations;
}

function report(label, violations) {
    console.log(`\n${label}: ${violations.length} violations`);

    let blocking = 0;
    for (const violation of violations) {
        const isBlocking = BLOCKING.has(violation.impact);
        blocking += isBlocking ? 1 : 0;
        console.log(`${isBlocking ? 'error' : 'warning'} ${describe(violation)}`);
    }

    return blocking;
}

async function open(browser, path, viewport = DESKTOP, motionPaused = false) {
    const page = await browser.newPage({ viewport });
    await page.goto(BASE_URL + path, { waitUntil: 'networkidle' });

    if (motionPaused) {
        await page.evaluate(() => localStorage.setItem('motion', 'paused/false'));
        await page.reload({ waitUntil: 'networkidle' });
    }

    await page.waitForTimeout(800);

    return page;
}

async function outline(browser) {
    const failures = [];

    for (const path of OUTLINE_PAGES) {
        const page = await open(browser, path);
        const found = await page.evaluate(() => {
            const levels = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter((heading) => heading.closest('dialog') === null).map((heading) => Number(heading.tagName[1]));
            const skipped = levels.filter((level, index) => index > 0 && level > levels[index - 1] + 1);
            const unnamedSections = [...document.querySelectorAll('section')].filter((section) => !section.getAttribute('aria-label')).map((section) => section.id);
            const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
            const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);

            return { h1: levels.filter((level) => level === 1).length, skipped, unnamedSections, duplicateIds };
        });
        await page.close();

        if (found.h1 !== 1) failures.push(`${path}: ${found.h1} h1 headings`);
        if (found.skipped.length) failures.push(`${path}: heading level skipped to h${found.skipped[0]}`);
        if (found.unnamedSections.length) failures.push(`${path}: unnamed sections ${found.unnamedSections.join(', ')}`);
        if (found.duplicateIds.length) failures.push(`${path}: duplicate ids ${[...new Set(found.duplicateIds)].join(', ')}`);
    }

    return failures;
}

async function skipLink(browser) {
    const failures = [];

    for (const path of DEFAULT_INDEXES) {
        const page = await open(browser, path);
        await page.keyboard.press('Tab');
        const first = await page.evaluate(() => document.activeElement?.getAttribute('href'));
        await page.keyboard.press('Enter');
        await page.waitForTimeout(400);
        const hash = await page.evaluate(() => location.hash);
        await page.close();

        if (!(first === '#content' && hash === '#content')) failures.push(`${path}: first Tab reaches ${first}, Enter lands on ${hash}`);
    }

    return failures;
}

async function dialog(browser) {
    const failures = [];

    for (const path of DEFAULT_INDEXES) {
        const page = await open(browser, path);
        const opener = await page.$('header button[aria-haspopup="dialog"]');

        if (!opener) {
            await page.close();
            continue;
        }

        await page.click('header button[aria-haspopup="dialog"]');
        await page.waitForTimeout(600);
        const opened = await page.evaluate(() => document.querySelector('dialog').open && document.querySelector('dialog').contains(document.activeElement));

        const escaped = [];
        for (let press = 0; press < 4; press += 1) {
            await page.keyboard.press('Tab');
            escaped.push(await page.evaluate(() => !document.querySelector('dialog').contains(document.activeElement)));
        }

        await page.keyboard.press('Escape');
        await page.waitForTimeout(600);
        const closedOnOpener = await page.evaluate(() => !document.querySelector('dialog').open && document.activeElement?.getAttribute('aria-haspopup') === 'dialog');
        await page.close();

        if (!opened) failures.push(`${path}: dialog did not open with focus inside`);
        if (escaped.some(Boolean)) failures.push(`${path}: Tab left the open dialog`);
        if (!closedOnOpener) failures.push(`${path}: Escape did not close the dialog and return focus to its opener`);
    }

    return failures;
}

async function menu(browser) {
    const failures = [];

    for (const path of DEFAULT_INDEXES) {
        const page = await open(browser, path);
        await page.click('header button[aria-controls="mainmenu"]');
        await page.waitForTimeout(500);
        const focusedFirstLink = await page.evaluate(() => document.activeElement === document.querySelector('#mainmenu a'));
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        const closedOnButton = await page.evaluate(() => document.querySelector('[aria-controls="mainmenu"]').getAttribute('aria-expanded') === 'false' && document.activeElement === document.querySelector('[aria-controls="mainmenu"]'));
        await page.close();

        if (!focusedFirstLink) failures.push(`${path}: opening the menu did not focus its first link`);
        if (!closedOnButton) failures.push(`${path}: Escape did not close the menu and return focus to the Menu button`);
    }

    return failures;
}

async function closedMenu(browser) {
    const failures = [];

    for (const path of DEFAULT_INDEXES) for (const viewport of [DESKTOP, PHONE]) {
        const page = await open(browser, path, viewport);
        const { deadRings, labelsTakingPointer } = await page.evaluate(() => {
            const takesPointer = (element) => {
                const box = element.getBoundingClientRect();
                return Boolean(document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)?.closest('#mainmenu'));
            };
            const links = [...document.querySelectorAll('#mainmenu a')];

            return {
                deadRings: links.filter((link) => !takesPointer(link.querySelector('svg'))).map((link) => link.textContent),
                labelsTakingPointer: links.filter((link) => takesPointer(link.querySelector('span'))).map((link) => link.textContent),
            };
        });
        await page.close();

        if (labelsTakingPointer.length) failures.push(`${path} @ ${viewport.width}px: closed menu labels take the pointer from the page beneath: ${labelsTakingPointer.join(', ')}`);
        if (viewport === DESKTOP && deadRings.length) failures.push(`${path} @ ${viewport.width}px: closed menu rings do not take the pointer: ${deadRings.join(', ')}`);
    }

    return failures;
}

async function spokenValues(browser) {
    const failures = [];

    for (const path of DEFAULT_INDEXES) {
        const page = await open(browser, path);
        const found = await page.evaluate(() => {
            const counters = [...document.querySelectorAll('#strength .srOnly')].map((span) => span.textContent);
            const miles = document.getElementById('miles');
            const headingFirst = miles.querySelector('h2').compareDocumentPosition(miles.querySelector('h3')) & Node.DOCUMENT_POSITION_FOLLOWING;
            const pressed = document.querySelectorAll('#ways [role="group"] button[aria-pressed]').length;
            const status = document.querySelector('#ways [aria-live]')?.textContent ?? '';

            return { counters, headingFirst: Boolean(headingFirst), tabs: document.querySelectorAll('[role="tab"]').length, pressed, status };
        });
        await page.close();

        if (found.counters.length === 0 || found.counters.some((text) => !/[1-9]/.test(text))) failures.push(`${path}: counters read ${found.counters.join(' | ')}`);
        if (!found.headingFirst) failures.push(`${path}: the Raising heading follows its facts`);
        if (found.tabs > 0 || found.pressed < 2 || !found.status) failures.push(`${path}: the model bar is not a group of pressed buttons with a status line`);
    }

    return failures;
}

async function localisedLabels(browser) {
    const failures = [];

    for (const path of TRANSLATED_INDEXES) {
        const page = await open(browser, path);
        const english = await page.evaluate((terms) => {
            const texts = [
                ...[...document.querySelectorAll('[aria-label]')].map((element) => element.getAttribute('aria-label')),
                ...[...document.querySelectorAll('.srOnly, [aria-live]')].map((element) => element.textContent),
            ];

            return texts.filter((text) => terms.some((term) => text.includes(term)));
        }, ENGLISH_LABELS);
        await page.close();

        if (english.length) failures.push(`English on ${path}: ${[...new Set(english)].join(' | ')}`);
    }

    return failures;
}

const inspectTargets = (minimum) => {
    const visible = (element) => {
        const box = element.getBoundingClientRect();
        return box.width > 0 && box.height > 0 && !element.closest('[inert]') && getComputedStyle(element).visibility !== 'hidden' && getComputedStyle(element).display !== 'inline';
    };
    const takesPointer = (element) => getComputedStyle(element).pointerEvents !== 'none';
    const targets = [...document.querySelectorAll('a[href], button, input, select, [tabindex="0"]')].filter(visible).filter(takesPointer).map((element) => ({ element, box: element.getBoundingClientRect(), name: element.getAttribute('aria-label') ?? element.textContent.trim().slice(0, 20) }));
    const radius = minimum / 2;
    const centre = ({ box }) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
    const small = (target) => target.box.width < minimum || target.box.height < minimum;
    const circleMeetsBox = (c, box) => Math.hypot(c.x - Math.max(box.left, Math.min(c.x, box.right)), c.y - Math.max(box.top, Math.min(c.y, box.bottom))) < radius;
    const circlesMeet = (a, b) => Math.hypot(a.x - b.x, a.y - b.y) < minimum;
    const covered = (target) => {
        const { x, y } = centre(target);
        const hit = document.elementFromPoint(x, y);
        return hit !== null && !target.element.contains(hit);
    };

    return {
        covered: targets.filter(covered).map((target) => target.name),
        crowded: targets.filter(small).filter((target) => targets.some((other) => other !== target && (small(other) ? circlesMeet(centre(target), centre(other)) : circleMeetsBox(centre(target), other.box)))).map((target) => target.name),
    };
};

async function targetSize(browser) {
    const failures = [];

    for (const path of INDEXES) {
        for (const viewport of [DESKTOP, PHONE]) {
            const page = await open(browser, path, viewport);
            const { covered, crowded } = await page.evaluate(inspectTargets, MINIMUM_TARGET);
            await page.close();

            if (crowded.length) failures.push(`${path} @ ${viewport.width}px: undersized targets without clear space: ${crowded.join(', ')}`);
            if (covered.length) failures.push(`${path} @ ${viewport.width}px: targets under another element at their centre: ${covered.join(', ')}`);
        }
    }

    return failures;
}

async function headingOnTop(browser) {
    const failures = [];

    for (const path of SUBPAGES) {
        const page = await open(browser, path);
        const cover = await page.evaluate(() => {
            const heading = document.querySelector('main h1');
            heading.scrollIntoView({ behavior: 'instant', block: 'center' });

            const box = heading.getBoundingClientRect();
            const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);

            return hit === null || heading.contains(hit) ? null : `${hit.tagName.toLowerCase()}.${hit.getAttribute('class') ?? ''}`;
        });
        await page.close();

        if (cover) failures.push(`${path}: the page heading is under ${cover}`);
    }

    return failures;
}

async function textSpacing(browser) {
    const failures = [];

    for (const path of DEFAULT_INDEXES) {
        const page = await open(browser, path, DESKTOP, true);
        await page.addStyleTag({ content: TEXT_SPACING });
        const ids = await page.evaluate(() => [...document.querySelectorAll('section')].filter((section) => section.querySelector('[class*="contentText"]')).map((section) => section.id));
        const overflowing = [];

        for (const id of ids) {
            await page.evaluate((target) => document.getElementById(target).scrollIntoView({ behavior: 'instant' }), id);
            await page.waitForTimeout(400);
            const overflows = await page.evaluate((target) => {
                const section = document.getElementById(target);
                return section.querySelector('[class*="contentText"]').scrollHeight > section.getBoundingClientRect().height + 1;
            }, id);

            if (overflows) overflowing.push(id);
        }
        await page.close();

        if (overflowing.length) failures.push(`${path}: text spacing overflows ${overflowing.join(', ')}`);
    }

    return failures;
}

async function contrastBehind(page, selector) {
    const element = page.locator(selector).first();
    const box = await element.boundingBox();
    await element.evaluate((node) => { node.style.visibility = 'hidden'; });
    const shot = await page.screenshot({ clip: box });
    await element.evaluate((node) => { node.style.visibility = ''; });

    return page.evaluate(async (encoded) => {
        const image = new Image();
        image.src = `data:image/png;base64,${encoded}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');
        context.drawImage(image, 0, 0);
        const data = context.getImageData(0, 0, canvas.width, canvas.height).data;
        const channel = (value) => { const v = value / 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
        const luminances = [];
        for (let i = 0; i < data.length; i += 8) luminances.push(0.2126 * channel(data[i]) + 0.7152 * channel(data[i + 1]) + 0.0722 * channel(data[i + 2]));
        luminances.sort((a, b) => a - b);
        const brightest = luminances[Math.floor(luminances.length * 0.95)];

        return 1.05 / (brightest + 0.05);
    }, shot.toString('base64'));
}

async function heroContrast(browser) {
    const failures = [];

    for (const path of DEFAULT_INDEXES) {
        const page = await open(browser, path, DESKTOP, true);
        await page.waitForTimeout(1500);
        const heading = await contrastBehind(page, '#home h1');
        const prompt = await contrastBehind(page, '#home a[href^="#"] span:last-child');
        await page.close();

        if (heading < LARGE_TEXT_CONTRAST) failures.push(`${path}: hero heading contrast ${heading.toFixed(2)}`);
        if (prompt < BODY_TEXT_CONTRAST) failures.push(`${path}: scroll prompt contrast ${prompt.toFixed(2)}`);
    }

    return failures;
}

async function motionControl(browser) {
    const failures = [];

    for (const path of DEFAULT_INDEXES) {
        const page = await open(browser, path);
        await page.click('header button[class*="motion"]');
        await page.waitForTimeout(400);
        const paused = await page.evaluate(() => document.body.hasAttribute('data-motion-paused'));
        await page.click('header button[class*="motion"]');
        await page.waitForTimeout(400);
        const resumed = await page.evaluate(() => !document.body.hasAttribute('data-motion-paused'));
        await page.close();

        if (!(paused && resumed)) failures.push(`${path}: the motion control did not toggle data-motion-paused`);
    }

    return failures;
}

const CHECKS = { outline, skipLink, dialog, menu, closedMenu, spokenValues, localisedLabels, targetSize, headingOnTop, textSpacing, heroContrast, motionControl };

async function audit(browser) {
    let blocking = 0;

    for (const path of PAGES) {
        for (const viewport of VIEWPORTS) {
            const label = `${path} @ ${viewport.width}x${viewport.height}`;
            const violations = await auditPage(browser, path, viewport);

            if (violations === null) {
                console.log(`\n${label}: 404, skipped`);
                continue;
            }

            blocking += report(label, violations);
        }
    }

    console.log(`\n${blocking} serious or critical violations\n`);

    return blocking;
}

async function journeys(browser) {
    let failed = 0;

    for (const [name, check] of Object.entries(CHECKS)) {
        const failures = await check(browser);
        failed += failures.length;
        console.log(`${failures.length ? 'FAIL' : 'ok  '} ${name}${failures.map((failure) => `\n     ${failure}`).join('')}`);
    }

    console.log(`\n${failed} journey failures`);

    return failed;
}

const browser = await launchBrowser();
const failed = (await audit(browser)) + (await journeys(browser));
await browser.close();
process.exitCode = failed > 0 ? 1 : 0;
