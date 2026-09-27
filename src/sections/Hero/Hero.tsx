import { Section, type SectionProps } from '@/components/Section/Section';
import { mediaUrl } from '@/mdx/media';
import { HeroSection, type VideoSource } from './HeroSection';

const videoTypes: Record<string, string> = {
    av1: 'video/mp4; codecs="av01.0.08M.08"',
    h264: 'video/mp4; codecs="avc1.640028"',
};

const sourcesOf = (list?: string): VideoSource[] | undefined =>
    list
        ?.split(',')
        .map((name) => name.trim())
        .filter(Boolean)
        .map((name) => ({ src: mediaUrl(name), type: videoTypes[name.split('.').at(-2) ?? ''] ?? 'video/mp4' }));

const posterOf = (list?: string): string | undefined => {
    const first = list?.split(',')[0]?.trim();

    return first ? mediaUrl(`${first.split('.')[0]}.poster.webp`) : undefined;
};

interface HeroProps extends SectionProps {
    image: string;
    mobileImage?: string;
    mobileVideo?: string;
    scrollText?: string;
    scrollTo?: string;
    video?: string;
}

export function Hero({ children, image, mobileImage, mobileVideo, scrollText, scrollTo, video, ...section }: HeroProps) {
    return (
        <Section {...section}>
            <HeroSection
                background={{ landscape: mediaUrl(image), portrait: mobileImage ? mediaUrl(mobileImage) : undefined }}
                heading={children}
                mobilePoster={posterOf(mobileVideo)}
                mobileVideo={sourcesOf(mobileVideo)}
                poster={posterOf(video)}
                scrollAnchor={scrollTo}
                scrollText={scrollText}
                video={sourcesOf(video)}
            />
        </Section>
    );
}
