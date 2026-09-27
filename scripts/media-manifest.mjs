import { readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const campaign = process.argv[2];
const mediaRoot = 'public/media';

if (!campaign) {
    throw new Error('usage: node scripts/media-manifest.mjs <campaign>');
}

const image = /\.(jpe?g|webp)$/i;
const manifest = {};

const walk = (folder) => {
    const entries = readdirSync(join(mediaRoot, folder), { withFileTypes: true });
    const names = entries.filter((entry) => entry.isFile() && image.test(entry.name)).map((entry) => entry.name).sort();

    if (folder && names.length > 0) {
        manifest[folder] = names;
    }

    for (const entry of entries.filter((child) => child.isDirectory())) {
        walk(folder ? `${folder}/${entry.name}` : entry.name);
    }
};

walk('');
writeFileSync(`content/${campaign}/media.manifest.json`, `${JSON.stringify(manifest, null, 4)}\n`);
console.log(`content/${campaign}/media.manifest.json: ${Object.keys(manifest).length} folders`);
