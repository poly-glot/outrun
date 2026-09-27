import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { background, siteUrl, social } from '@content/site.config';
import { BodyState } from '@/components/BodyState/BodyState';
import { FixedBackground } from '@/components/FixedBackground/FixedBackground';
import { Header } from '@/components/Header/Header';
import { Modal } from '@/components/Modal/Modal';
import { SideMenu } from '@/components/SideMenu/SideMenu';
import { SkipLink } from '@/components/SkipLink/SkipLink';
import { mediaUrl } from '@/mdx/media';
import { collectSections } from '@/mdx/nodes';
import { listLocales, listPages, loadPage, loadSite, pageExists } from '@/mdx/pages';

const indexPage = 'index';
const contactPage = 'roadshow';

interface PageProps {
    params: Promise<{ locale: string; slug?: string[] }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
    return listLocales().flatMap((locale) =>
        listPages(locale).map((page) => ({ locale, slug: page === indexPage ? [] : [page] })),
    );
}

const pageOf = (slug?: string[]) => slug?.join('/') || indexPage;
const hrefOf = (locale: string, page: string) => (page === indexPage ? `/${locale}` : `/${locale}/${page}`);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { locale, slug } = await params;
    const page = await loadPage(locale, pageOf(slug));
    const title = page?.meta?.title ?? '';
    const description = page?.meta?.description ?? '';

    return {
        alternates: { languages: Object.fromEntries(listLocales().filter((code) => pageExists(code, pageOf(slug))).map((code) => [code, hrefOf(code, pageOf(slug))])) },
        description,
        icons: { icon: '/favicon.ico' },
        manifest: '/manifest.json',
        metadataBase: new URL(siteUrl),
        openGraph: {
            description,
            images: [{ height: 630, type: 'image/jpeg', url: social.image, width: 1200 }],
            locale,
            title,
            type: 'website',
            url: `/${locale}`,
        },
        title,
        twitter: { card: 'summary_large_image', description, images: [social.image], title },
    };
}

export default async function LocalePage({ params }: PageProps) {
    const { locale, slug } = await params;
    const pageName = pageOf(slug);
    const page = await loadPage(locale, pageName);

    if (!page) {
        notFound();
    }

    const site = await loadSite(locale);
    const contact = pageName === contactPage ? null : await loadPage(locale, contactPage);
    const Content = page.default;
    const SiteContent = site.default;
    const locales = listLocales().filter((code) => pageExists(code, pageName)).map((code) => ({ code, href: hrefOf(code, pageName) }));
    const sections = collectSections(Content({}));

    return (
        <>
            <SkipLink />
            <FixedBackground background={{ landscape: mediaUrl(background.landscape), portrait: mediaUrl(background.portrait) }} />
            <Header hasContact={contact !== null} locale={locale} locales={locales} />

            {sections.length > 0 ? <SideMenu items={sections} /> : null}

            <main id="content">
                <Content />
            </main>

            <SiteContent />
            <Modal contact={contact ? <contact.default /> : null} locale={locale} />
            <BodyState />
        </>
    );
}
