import type { ReactNode } from 'react';
import { campaigns } from '@campaigns';
import { MotionFeatures } from '@/components/MotionFeatures/MotionFeatures';
import { campaignConfig, setCampaign } from '@/mdx/campaign';
import { mediaUrl } from '@/mdx/media';
import { listCampaigns, listLocales, loadSite } from '@/mdx/pages';
import { SiteStateProvider } from '@/state/store';
import '../../tokens.css';

export const dynamicParams = false;

export function generateStaticParams() {
    return listCampaigns().flatMap((campaign) => listLocales(campaign).map((locale) => ({ campaign, locale })));
}

interface LocaleLayoutProps {
    children: ReactNode;
    params: Promise<{ campaign: string; locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { campaign, locale } = await params;
    setCampaign(campaign);

    const { strings } = await loadSite(campaign, locale);
    const config = campaignConfig();

    return (
        <html lang={locale} className={campaigns[campaign]?.fontClassName} data-campaign={campaign} data-scroll-behavior="smooth">
            <body>
                <SiteStateProvider campaign={campaign} initialModel={config.defaultModel} shareImage={mediaUrl(config.social.image)} strings={strings}>
                    <MotionFeatures>{children}</MotionFeatures>
                </SiteStateProvider>
            </body>
        </html>
    );
}
