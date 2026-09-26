import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const contentRoot = path.join(import.meta.dirname, '../../content');

function stringKeys(locale: string) {
    const source = fs.readFileSync(path.join(contentRoot, locale, 'site.mdx'), 'utf8');
    const block = source.split('export const strings = {')[1]?.split('\n};')[0] ?? '';

    return [...block.matchAll(/^\s*(\w+):/gm)].map((match) => match[1]).sort();
}

const locales = fs.readdirSync(contentRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name);

test('every locale defines exactly the strings en defines', () => {
    const expected = stringKeys('en');

    assert.ok(expected.length > 0);

    for (const locale of locales) {
        assert.deepEqual(stringKeys(locale), expected, locale);
    }
});
