import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, rmSync, utimesSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import sharp from 'sharp';

const key = process.env.PIXABAY_KEY;

if (!key) {
    throw new Error('PIXABAY_KEY is not set');
}

const tableHeader = '| Used for | File | Subject | By | Source |';
const tableHeaderPattern = /^\| *Used for *\| *File *\| *Subject *\| *By *\| *Source *\|/m;

const creditsTableRange = (readme) => {
    const start = readme.search(tableHeaderPattern);

    if (start < 0) {
        throw new Error('README.MD has no credits table to refresh');
    }

    return [start, start + readme.slice(start).search(/\n(?!\|)|$/)];
};

creditsTableRange(readFileSync('README.MD', 'utf8'));

const manifest =JSON.parse(readFileSync(new URL('./pixabay.json', import.meta.url), 'utf8'));
const media = 'public/media';
const credits = [];

const hit = async (path, id) => {
    const response = await fetch(`https://pixabay.com/api/${path}?key=${key}&id=${id}`);
    const { hits } = await response.json();

    if (!hits?.length) {
        throw new Error(`Pixabay ${path}${id}: no hit`);
    }

    return hits[0];
};

const download = async (url) => Buffer.from(await (await fetch(url)).arrayBuffer());
const cover = (input, width, height) => sharp(input).resize(width, height, { fit: 'cover' }).webp({ quality: 75 }).toBuffer();
const write = (file, buffer) => {
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, buffer);
};
const credit = (use, file, item) => credits.push({ file, id: item.id, page: item.pageURL, tags: item.tags, use, user: item.user });

for (const { file, height = 675, id, use, width = 1200 } of manifest.stills) {
    const image = await hit('', id);
    write(`${media}/${file}`, await cover(await download(image.largeImageURL), width, height));
    credit(use, file, image);
}

for (const folder of ['full', 'preview', 'thumbnails']) {
    mkdirSync(`${media}/gallery/${folder}`, { recursive: true });
    for (const name of readdirSync(`${media}/gallery/${folder}`)) {
        rmSync(`${media}/gallery/${folder}/${name}`);
    }
}

for (const id of manifest.gallery) {
    const image = await hit('', id);
    const original = await download(image.largeImageURL);
    const name = `cheetah-${id}`;
    write(`${media}/gallery/full/${name}.jpg`, original);
    write(`${media}/gallery/preview/${name}.webp`, await cover(original, 1280, 720));
    write(`${media}/gallery/thumbnails/${name}.webp`, await cover(original, 400, 225));
    credit('Spread the word, the gallery and its download', `gallery/*/${name}.*`, image);
}

const pinned = new Date('2026-01-01T00:00:00Z');
for (const name of readdirSync(`${media}/gallery/full`)) {
    utimesSync(`${media}/gallery/full/${name}`, pinned, pinned);
}

rmSync(`${media}/gallery/gallery.zip`, { force: true });

for (const { crop, folder, frames, id, seconds, start, use } of manifest.turntables) {
    const video = await hit('videos/', id);
    const clip = `${media}/${folder}.mp4`;
    write(clip, await download(video.videos.medium.url));
    mkdirSync(`${media}/${folder}`, { recursive: true });
    for (const name of readdirSync(`${media}/${folder}`)) {
        rmSync(`${media}/${folder}/${name}`);
    }
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-ss', String(start), '-i', clip, '-t', String(seconds), '-vf', `fps=${frames}/${seconds},${crop},scale=1024:768`, '-frames:v', String(frames), '-c:v', 'libwebp', '-quality', '75', `${media}/${folder}/frame-%02d.webp`]);
    rmSync(clip);
    credit(use, `${folder}/frame-*.webp`, video);
}
execFileSync('zip', ['-j', '-q', '-X', `${media}/gallery/gallery.zip`, ...readdirSync(`${media}/gallery/full`).map((name) => `${media}/gallery/full/${name}`)]);

for (const { id, use } of manifest.videos) {
    const video = await hit('videos/', id);
    credits.push({ file: `Pixabay video ${id}`, id, page: video.pageURL, tags: video.tags, use, user: video.user });
}

const row = ({ file, page, tags, use, user }) => `| ${use} | \`${file}\` | ${tags.split(',').slice(0, 3).join(',').trim()} | ${user} | [${page.replace('https://', '')}](${page}) |`;
const table = [tableHeader, '| --- | --- | --- | --- | --- |', ...credits.map(row)].join('\n');
const readme = readFileSync('README.MD', 'utf8');
const [start, end] = creditsTableRange(readme);

writeFileSync('README.MD', `${readme.slice(0, start)}${table}${readme.slice(end)}`);
console.log(`${credits.length} credits written`);
