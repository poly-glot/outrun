import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const contentRoot = path.join(import.meta.dirname, '../../content');
const kickerLevel = 4;

const directories = (parent: string) =>
    fs.readdirSync(parent, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);

const campaigns = directories(contentRoot);

const idsOf = (source: string) => [...source.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);

const mediaOf = (source: string) =>
    [...source.matchAll(/\b(?:image|mobileImage|video|mobileVideo|downloadAll|icon)="([^"]+)"/g)]
        .flatMap((match) => match[1].split(','))
        .map((name) => name.trim())
        .filter((name) => path.extname(name) !== '');

const headingsOf = (source: string) =>
    [...source.matchAll(/^(#{1,6}) (.+)$/gm)].map((match) => ({ level: match[1].length, text: match[2] })).filter((heading) => heading.level !== kickerLevel);

const labelsOf = (source: string) => [
    ...[...source.matchAll(/\b(?:menu|label)="([^"]+)"/g)].map((match) => match[1]),
    ...[...source.matchAll(/<Chart[^>]*>(.+?)<\/Chart>/g)].map((match) => match[1]),
];

function shouted(text: string) {
    const letters = text.replace(/<[^>]+>/g, '').replace(/[^\p{L}]/gu, '');

    return letters.length > 3 && letters === letters.toUpperCase();
}

for (const campaign of campaigns) {
    const campaignRoot = path.join(contentRoot, campaign);
    const config = (await import(`../../content/${campaign}/campaign.config.ts`)) as {
        background: { landscape: string; portrait: string };
    };
    const locales = directories(campaignRoot);
    const pagesOf = (locale: string) => fs.readdirSync(path.join(campaignRoot, locale)).filter((file) => file.endsWith('.mdx') && file !== 'site.mdx');
    const read = (locale: string, file: string) => fs.readFileSync(path.join(campaignRoot, locale, file), 'utf8');
    const publicMedia = path.join(import.meta.dirname, '../../public/media');
    const mediaExists = (file: string) => fs.existsSync(path.join(publicMedia, file));
    const stagingMissing = !fs.existsSync(publicMedia);

    for (const locale of locales) {
        for (const file of pagesOf(locale)) {
            const source = read(locale, file);
            const headings = headingsOf(source);

            test(`${campaign}/${locale}/${file} has one page heading and no skipped level`, () => {
                if (headings.length === 0) {
                    return;
                }

                assert.equal(headings.filter((heading) => heading.level === 1).length, 1);

                let previous = 0;
                for (const heading of headings) {
                    assert.ok(heading.level <= previous + 1, `${'#'.repeat(heading.level)} ${heading.text} follows level ${previous}`);
                    previous = heading.level;
                }
            });

            test(`${campaign}/${locale}/${file} names only media that exists`, { skip: stagingMissing }, () => {
                for (const media of mediaOf(source)) {
                    assert.ok(mediaExists(media), media);
                }
            });

            test(`${campaign}/${locale}/${file} writes headings and labels in sentence case`, () => {
                for (const text of [...headings.map((heading) => heading.text), ...labelsOf(source)]) {
                    assert.ok(!shouted(text), text);
                }
            });
        }
    }

    for (const page of new Set(locales.flatMap(pagesOf))) {
        const translations = locales.filter((locale) => pagesOf(locale).includes(page)).map((locale) => ({ ids: idsOf(read(locale, page)), locale }));

        test(`${campaign}/${page} uses the same section, question and option ids in every locale`, () => {
            for (const { ids, locale } of translations) {
                assert.deepEqual(ids, translations[0].ids, locale);
            }
        });
    }

    test(`${campaign} site background exists in both orientations`, { skip: stagingMissing }, () => {
        for (const media of [config.background.landscape, config.background.portrait]) {
            assert.ok(mediaExists(media), media);
        }
    });

    test(`${campaign} media manifest lists only files that exist`, { skip: stagingMissing }, () => {
        const manifest = JSON.parse(fs.readFileSync(path.join(campaignRoot, 'media.manifest.json'), 'utf8')) as Record<string, string[]>;

        for (const [folder, names] of Object.entries(manifest)) {
            for (const name of names) {
                assert.ok(mediaExists(path.join(folder, name)), `${folder}/${name}`);
            }
        }
    });
}

test('every inline icon carries ids prefixed with its own name, none shared', () => {
    const source = fs.readFileSync(path.join(contentRoot, 'icons.ts'), 'utf8');
    const seen = new Set<string>();

    for (const [, name, svg] of source.matchAll(/^\s*"(\w+)": "(.*)"/gm)) {
        for (const [, id] of svg.matchAll(/id=\\"([^"\\]+)\\"/g)) {
            assert.ok(id.startsWith(`${name}-`), `${name}: ${id}`);
            assert.ok(!seen.has(id), `duplicate id ${id}`);
            seen.add(id);
        }
    }

    assert.ok(seen.size > 0);
});
