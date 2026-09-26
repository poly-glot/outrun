import type { ReactNode } from 'react';
import { defaultModel } from '@content/site.config';
import { MotionFeatures } from '@/components/MotionFeatures/MotionFeatures';
import { listLocales, loadSite } from '@/mdx/pages';
import { SiteStateProvider } from '@/state/store';
import { momoTrustDisplay } from '../fonts';
import '../tokens.css';

export const dynamicParams = false;

export function generateStaticParams() {
    return listLocales().map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
    children: ReactNode;
    params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params;
    const { strings } = await loadSite(locale);

    return (
        <html lang={locale} className={momoTrustDisplay.variable} data-scroll-behavior="smooth">
            <body>
                <SiteStateProvider initialModel={defaultModel} strings={strings}>
                    <MotionFeatures>{children}</MotionFeatures>
                </SiteStateProvider>
            </body>
        </html>
    );
}
