import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { campaigns } from '@campaigns';
import { BodyState } from '@/components/BodyState/BodyState';
import { FixedBackground } from '@/components/FixedBackground/FixedBackground';
import { Header, type HeaderLogo } from '@/components/Header/Header';
import { Modal } from '@/components/Modal/Modal';
import { SideMenu } from '@/components/SideMenu/SideMenu';
import { SkipLink } from '@/components/SkipLink/SkipLink';
import { campaignConfig, setCampaign, type CampaignConfig } from '@/mdx/campaign';
import { mediaUrl } from '@/mdx/media';
import { collectSections } from '@/mdx/nodes';
import { listCampaigns, listLocales, listPages, loadPage, loadSite, pageExists } from '@/mdx/pages';

const indexPage = 'index';
const contactPage = 'roadshow';

interface PageProps {
    params: Promise<{ campaign: string; locale: string; slug?: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
    return listCampaigns().flatMap((campaign) =>
        listLocales(campaign).flatMap((locale) =>
            listPages(campaign, locale).map((page) => ({ campaign, locale, slug: page === indexPage ? [] : [page] })),
        ),
    );
}

const pageOf = (slug?: string[]) => slug?.join('/') || indexPage;
const hrefOf = (campaign: string, locale: string, page: string) =>
    (page === indexPage ? `/${campaign}/${locale}` : `/${campaign}/${locale}/${page}`);

function logoOf(campaign: string, config: CampaignConfig): HeaderLogo {
    if (config.logo.kind !== 'component') {
        return config.logo;
    }

    const Component = campaigns[campaign]?.Logo;

    if (!Component) {
        throw new Error(`${campaign} declares a component logo but campaigns/index.ts registers none`);
    }

    return { Component, kind: 'component' };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { campaign, locale, slug } = await params;
    setCampaign(campaign);

    const config = campaignConfig();
    const page = await loadPage(campaign, locale, pageOf(slug));
    const title = page?.meta?.title ?? '';
    const description = page?.meta?.description ?? '';
    const socialImage = mediaUrl(config.social.image);

    return {
        alternates: { languages: Object.fromEntries(listLocales(campaign).filter((code) => pageExists(campaign, code, pageOf(slug))).map((code) => [code, hrefOf(campaign, code, pageOf(slug))])) },
        description,
        icons: { icon: '/favicon.ico' },
        manifest: `/${campaign}/manifest.json`,
        metadataBase: new URL(config.siteUrl),
        openGraph: {
            description,
            images: [{ height: 630, type: 'image/jpeg', url: socialImage, width: 1200 }],
            locale,
            title,
            type: 'website',
            url: `/${campaign}/${locale}`,
        },
        title,
        twitter: { card: 'summary_large_image', description, images: [socialImage], title },
    };
}

export default async function LocalePage({ params }: PageProps) {
    const { campaign, locale, slug } = await params;
    setCampaign(campaign);

    const pageName = pageOf(slug);
    const page = await loadPage(campaign, locale, pageName);

    if (!page) {
        notFound();
    }

    const config = campaignConfig();
    const site = await loadSite(campaign, locale);
    const contact = pageName === contactPage ? null : await loadPage(campaign, locale, contactPage);
    const Content = page.default;
    const SiteContent = site.default;
    const locales = listLocales(campaign).filter((code) => pageExists(campaign, code, pageName)).map((code) => ({ code, href: hrefOf(campaign, code, pageName) }));
    const sections = collectSections(Content({}));
    const homeHref = `/${campaign}/${locale}#home`;
    const logo = logoOf(campaign, config);

    return (
        <>
            <SkipLink />
            <FixedBackground background={{ landscape: mediaUrl(config.background.landscape), portrait: mediaUrl(config.background.portrait) }} />
            <Header brand={config.brand} hasContact={contact !== null} homeHref={homeHref} locale={locale} locales={locales} logo={logo} />

            {sections.length > 0 ? <SideMenu items={sections} /> : null}

            <main id="content">
                <Content />
            </main>

            <SiteContent />
            <Modal brand={config.brand} contact={contact ? <contact.default /> : null} homeHref={homeHref} locale={locale} logo={logo} />
            <BodyState />
        </>
    );
}
