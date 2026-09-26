import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const sourceRoot = import.meta.dirname;
const brandLabel = 'aria-label="Outrun Extinction"';
const externalLinkFile = path.join('components', 'ExternalLink', 'ExternalLink.tsx');

const files = (extension: string) =>
    (fs.readdirSync(sourceRoot, { recursive: true }) as string[]).filter((file) => file.endsWith(extension)).map((file) => [file, fs.readFileSync(path.join(sourceRoot, file), 'utf8')] as const);

const offending = (extension: string, pattern: RegExp, allowed: (file: string, line: string) => boolean = () => false) =>
    files(extension).flatMap(([file, source]) =>
        source.split('\n').flatMap((line, index) => (pattern.test(line) && !allowed(file, line) ? [`${file}:${index + 1} ${line.trim()}`] : [])),
    );

test('every label a screen reader hears comes from the locale strings', () => {
    assert.deepEqual(offending('.tsx', /aria-label=["']/, (_, line) => line.includes(brandLabel)), []);
});

test('a link opens a new tab only through ExternalLink, which says so', () => {
    assert.deepEqual(offending('.tsx', /target=["']_blank/, (file) => file === externalLinkFile), []);
});

test('an overlay is a native dialog, never a div with a role', () => {
    assert.deepEqual(offending('.tsx', /role=["']dialog|aria-modal/), []);
});

test('no stylesheet hides the focus ring', () => {
    assert.deepEqual(offending('.css', /outline:\s*(none|0)\b/), []);
});

test('font sizes are rem so the browser setting scales the page', () => {
    assert.deepEqual(offending('.css', /font-size:\s*\d+(\.\d+)?px/), []);
});
