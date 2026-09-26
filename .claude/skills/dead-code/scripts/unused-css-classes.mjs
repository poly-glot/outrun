import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));

const resolveModule = (from, specifier) => (specifier.startsWith('@/') ? resolve('src', specifier.slice(2)) : resolve(dirname(from), specifier));
const stripNoise = (css) =>
    css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/url\([^)]*\)/g, '')
        .replace(/:global\([^)]*\)/g, '')
        .replace(/:global\s+[^\s{,]+/g, '');
const classesOf = (css) => new Set([...css.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)].map((match) => match[1]));

const files = walk('src');
const modules = files.filter((file) => file.endsWith('.module.css')).map((file) => resolve(file));
const usage = new Map(modules.map((file) => [file, { dynamic: false, importers: 0, used: new Set() }]));

for (const file of files.filter((name) => /\.tsx?$/.test(name))) {
    const code = readFileSync(file, 'utf8');

    for (const [, binding, specifier] of code.matchAll(/import (\w+) from '([^']+\.module\.css)'/g)) {
        const entry = usage.get(resolveModule(file, specifier));
        if (!entry) {
            continue;
        }

        entry.importers += 1;
        entry.dynamic ||= new RegExp(`\\b${binding}\\[(?!['"])`).test(code);
        for (const [, dotted, quoted] of code.matchAll(new RegExp(`\\b${binding}(?:\\.([\\w]+)|\\[['"]([\\w-]+)['"]\\])`, 'g'))) {
            entry.used.add(dotted ?? quoted);
        }
    }
}

for (const file of modules) {
    const css = stripNoise(readFileSync(file, 'utf8'));

    for (const [, names, specifier] of css.matchAll(/composes:\s*([^;]+?)(?:\s+from\s+['"]([^'"]+)['"])?\s*;/g)) {
        const target = usage.get(specifier ? resolveModule(file, specifier) : file);
        for (const name of names.trim().split(/\s+/)) {
            target?.used.add(name);
        }
    }
}

const report = [];
for (const file of modules) {
    const entry = usage.get(file);
    const unused = [...classesOf(stripNoise(readFileSync(file, 'utf8')))].filter((name) => !entry.used.has(name));
    const label = relative(process.cwd(), file);

    if (entry.importers === 0) {
        report.push(`${label}: no component imports it`);
    } else if (unused.length > 0) {
        report.push(`${label}: ${unused.map((name) => `.${name}`).join(' ')}${entry.dynamic ? '  (read dynamically, check by hand)' : ''}`);
    }
}

console.log(report.length ? report.join('\n') : 'No unused CSS module classes.');
