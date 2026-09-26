import fs from 'node:fs';
import path from 'node:path';
import type { ReactNode } from 'react';

const contentRoot = path.join(process.cwd(), 'content');
const siteFile = 'site.mdx';

type Content = (props: Record<string, unknown>) => ReactNode;

interface PageModule {
    default: Content;
    meta?: { description: string; title: string };
}

export interface SiteStrings {
    close: string;
    closeMenu: string;
    contact: string;
    footnote: string;
    gallery: string;
    language: string;
    loading: string;
    menu: string;
    models: string;
    motionPlay: string;
    motionStop: string;
    nextImage: string;
    opensInNewTab: string;
    playVideo: string;
    previousImage: string;
    rotateView: string;
    sections: string;
    shareOn: string;
    showImage: string;
    showing: string;
    skipToContent: string;
}

interface SiteModule {
    default: Content;
    strings: SiteStrings;
}

export const listLocales = () =>
    fs.readdirSync(contentRoot, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

export const listPages = (locale: string) =>
    fs.readdirSync(path.join(contentRoot, locale))
        .filter((name) => name.endsWith('.mdx') && name !== siteFile)
        .map((name) => name.replace(/\.mdx$/, ''))
        .sort();

export const pageExists = (locale: string, page: string) => fs.existsSync(path.join(contentRoot, locale, `${page}.mdx`));

export async function loadPage(locale: string, page: string): Promise<PageModule | null> {
    if (!pageExists(locale, page)) {
        return null;
    }

    return (await import(`../../content/${locale}/${page}.mdx`)) as PageModule;
}

export const loadSite = async (locale: string): Promise<SiteModule> =>
    (await import(`../../content/${locale}/site.mdx`)) as SiteModule;
