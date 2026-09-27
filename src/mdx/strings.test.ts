import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const contentRoot = path.join(import.meta.dirname, '../../content');

const directories = (parent: string) =>
    fs.readdirSync(parent, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);

function stringKeys(campaign: string, locale: string) {
    const source = fs.readFileSync(path.join(contentRoot, campaign, locale, 'site.mdx'), 'utf8');
    const block = source.split('export const strings = {')[1]?.split('\n};')[0] ?? '';

    return [...block.matchAll(/^\s*(\w+):/gm)].map((match) => match[1]).sort();
}

for (const campaign of directories(contentRoot)) {
    test(`${campaign}: every locale defines exactly the strings the first locale defines`, () => {
        const locales = directories(path.join(contentRoot, campaign)).sort();
        const expected = stringKeys(campaign, locales[0]);

        assert.ok(expected.length > 0);

        for (const locale of locales) {
            assert.deepEqual(stringKeys(campaign, locale), expected, locale);
        }
    });
}
