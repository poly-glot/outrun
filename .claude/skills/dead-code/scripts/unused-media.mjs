import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) => (entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]));

if (!existsSync('out')) {
    console.error('No out/ folder: run npm run build first, so dynamic folder listings are resolved.');
    process.exit(1);
}

const published = walk('out')
    .filter((file) => /\.(html|txt|js|css)$/.test(file))
    .map((file) => readFileSync(file, 'utf8'))
    .join('\n');

const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');
const isHidden = (file) => file.split('/').some((part) => part.startsWith('.'));
const referenced = (url) => published.includes(url) || published.includes(encodePath(url));

const unused = walk('public')
    .filter((file) => !isHidden(file))
    .map((file) => ({ file, url: `/${relative('public', file)}` }))
    .filter(({ url }) => !referenced(url));

for (const { file } of unused) {
    console.log(`${(statSync(file).size / 1024).toFixed(0).padStart(6)} KB  ${file}`);
}

console.log(unused.length ? `${unused.length} files under public/ that no built page references.` : 'Every file under public/ is referenced by the build.');
