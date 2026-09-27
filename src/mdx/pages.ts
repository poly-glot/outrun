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

const directories = (parent: string) =>
    fs.readdirSync(parent, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

export const listCampaigns = () => directories(contentRoot);

export const listLocales = (campaign: string) => directories(path.join(contentRoot, campaign));

export const listPages = (campaign: string, locale: string) =>
    fs.readdirSync(path.join(contentRoot, campaign, locale))
        .filter((name) => name.endsWith('.mdx') && name !== siteFile)
        .map((name) => name.replace(/\.mdx$/, ''))
        .sort();

export const pageExists = (campaign: string, locale: string, page: string) =>
    fs.existsSync(path.join(contentRoot, campaign, locale, `${page}.mdx`));

export async function loadPage(campaign: string, locale: string, page: string): Promise<PageModule | null> {
    if (!pageExists(campaign, locale, page)) {
        return null;
    }

    return (await import(`../../content/${campaign}/${locale}/${page}.mdx`)) as PageModule;
}

export const loadSite = async (campaign: string, locale: string): Promise<SiteModule> =>
    (await import(`../../content/${campaign}/${locale}/site.mdx`)) as SiteModule;
