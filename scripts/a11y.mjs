import { createRequire } from 'node:module';
import { chromium } from 'playwright-core';

const require = createRequire(import.meta.url);
const AXE_PATH = require.resolve('axe-core');
const BASE_URL = process.env.A11Y_URL ?? 'http://localhost:3010';
const PAGES = ['/en', '/de', '/en/roadshow', '/de/roadshow', '/en/accessibility', '/de/accessibility'];
const VIEWPORTS = [{ width: 1366, height: 768 }, { width: 390, height: 844 }];
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];
const BLOCKING = new Set(['serious', 'critical']);

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

async function main() {
    const browser = await launchBrowser();

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

    await browser.close();

    console.log(`\n${blocking} serious or critical violations`);
    process.exitCode = blocking > 0 ? 1 : 0;
}

await main();
