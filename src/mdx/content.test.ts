import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { background, mediaRoot } from '../../content/site.config.ts';

const contentRoot = path.join(import.meta.dirname, '../../content');
const kickerLevel = 4;

const locales = fs.readdirSync(contentRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);
const pagesOf = (locale: string) => fs.readdirSync(path.join(contentRoot, locale)).filter((file) => file.endsWith('.mdx') && file !== 'site.mdx');
const read = (locale: string, file: string) => fs.readFileSync(path.join(contentRoot, locale, file), 'utf8');
const publicMedia = path.join(import.meta.dirname, '../../public', mediaRoot);
const mediaExists = (file: string) => fs.existsSync(path.join(publicMedia, file));

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

for (const locale of locales) {
    for (const file of pagesOf(locale)) {
        const source = read(locale, file);
        const headings = headingsOf(source);

        test(`${locale}/${file} has one page heading and no skipped level`, () => {
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

        test(`${locale}/${file} names only media that exists`, () => {
            for (const media of mediaOf(source)) {
                assert.ok(mediaExists(media), media);
            }
        });

        test(`${locale}/${file} writes headings and labels in sentence case`, () => {
            for (const text of [...headings.map((heading) => heading.text), ...labelsOf(source)]) {
                assert.ok(!shouted(text), text);
            }
        });
    }
}

for (const page of new Set(locales.flatMap(pagesOf))) {
    const translations = locales.filter((locale) => pagesOf(locale).includes(page)).map((locale) => ({ ids: idsOf(read(locale, page)), locale }));

    test(`${page} uses the same section, question and option ids in every locale`, () => {
        for (const { ids, locale } of translations) {
            assert.deepEqual(ids, translations[0].ids, locale);
        }
    });
}

test('the site background exists in both orientations', () => {
    for (const media of [background.landscape, background.portrait]) {
        assert.ok(mediaExists(media), media);
    }
});

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
