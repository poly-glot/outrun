import fs from 'node:fs';
import path from 'node:path';
import { campaignConfig, currentCampaign } from './campaign';

const mediaManifest = (): Record<string, string[]> =>
    JSON.parse(fs.readFileSync(path.join(process.cwd(), 'content', currentCampaign(), 'media.manifest.json'), 'utf8')) as Record<string, string[]>;

export const mediaUrl = (file: string) =>
    [campaignConfig().mediaBase, ...file.split('/').map((segment) => encodeURIComponent(segment))].join('/');

function imageFiles(folder: string) {
    const names = mediaManifest()[folder];

    if (!names) {
        throw new Error(`${currentCampaign()} media.manifest.json lists no folder ${folder}; rerun scripts/media-manifest.mjs`);
    }

    return names;
}

const webpOf = (name: string) => name.replace(/\.jpe?g$/i, '.webp');

export interface GalleryImage {
    full: string;
    large: string;
    thumbnail: string;
}

export const listFrames = (folder: string) => imageFiles(folder).map((name) => mediaUrl(`${folder}/${name}`));

export const listGallery = (folder: string): GalleryImage[] =>
    imageFiles(`${folder}/full`).map((name) => ({
        full: mediaUrl(`${folder}/full/${name}`),
        large: mediaUrl(`${folder}/preview/${webpOf(name)}`),
        thumbnail: mediaUrl(`${folder}/thumbnails/${webpOf(name)}`),
    }));
