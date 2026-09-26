import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));

const declaration = readFileSync('src/mdx/pages.ts', 'utf8').match(/interface SiteStrings \{([^}]*)\}/)?.[1];
if (!declaration) {
    console.error('SiteStrings not found in src/mdx/pages.ts');
    process.exit(1);
}

const keys = [...declaration.matchAll(/^\s*(\w+):/gm)].map((match) => match[1]);
const code = walk('src')
    .filter((file) => /\.tsx?$/.test(file) && !file.endsWith('.test.ts'))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');
const read = new Set([...code.matchAll(/\bstrings\.(\w+)/g)].map((match) => match[1]));
const unused = keys.filter((key) => !read.has(key));

console.log(unused.length ? `Strings no component reads: ${unused.join(', ')}` : `All ${keys.length} strings are read.`);
