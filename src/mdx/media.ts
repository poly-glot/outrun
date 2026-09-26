import fs from 'node:fs';
import path from 'node:path';
import { mediaRoot } from '@content/site.config';

const publicMedia = path.join(process.cwd(), 'public', mediaRoot);

export const mediaUrl = (file: string) =>
    [mediaRoot, ...file.split('/').map((segment) => encodeURIComponent(segment))].join('/');

const imageFiles = (folder: string) =>
    fs.readdirSync(path.join(publicMedia, folder)).filter((name) => /\.(jpe?g|webp)$/i.test(name)).sort();

export const listFrames = (folder: string) => imageFiles(folder).map((name) => mediaUrl(`${folder}/${name}`));

const webpOf = (name: string) => name.replace(/\.jpe?g$/i, '.webp');

export interface GalleryImage {
    full: string;
    large: string;
    thumbnail: string;
}

export const listGallery = (folder: string): GalleryImage[] =>
    imageFiles(`${folder}/full`).map((name) => ({
        full: mediaUrl(`${folder}/full/${name}`),
        large: mediaUrl(`${folder}/preview/${webpOf(name)}`),
        thumbnail: mediaUrl(`${folder}/thumbnails/${webpOf(name)}`),
    }));
