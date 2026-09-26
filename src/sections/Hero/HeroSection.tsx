'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useInView } from 'framer-motion';
import { BackgroundImage, type Background } from '@/components/BackgroundImage/BackgroundImage';
import { Shadow } from '@/components/FixedBackground/FixedBackground';
import { Reveal } from '@/components/Reveal/Reveal';
import { ScrollIndicator } from '@/components/ScrollIndicator/ScrollIndicator';
import { cx } from '@/lib/cx';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { useSiteState } from '@/state/store';
import content from '../ContentText.module.css';
import styles from './HeroSection.module.css';

const desktopMedia = '(min-width: 768px)';

export interface VideoSource {
    src: string;
    type: string;
}

function useIdle(): boolean {
    const [idle, setIdle] = useState(false);

    useEffect(() => {
        const timer = window.setTimeout(() => setIdle(true), 1500);

        return () => window.clearTimeout(timer);
    }, []);

    return idle;
}

interface HeroSectionProps {
    background: Background;
    heading?: ReactNode;
    mobilePoster?: string;
    mobileVideo?: VideoSource[];
    poster?: string;
    scrollAnchor?: string;
    scrollText?: string;
    video?: VideoSource[];
}

export function HeroSection({ background, heading, mobilePoster, mobileVideo, poster, scrollAnchor, scrollText, video }: HeroSectionProps) {
    const ref = useRef<HTMLDivElement>(null);
    const player = useRef<HTMLVideoElement>(null);
    const inView = useInView(ref, { amount: 0.2 });
    const isDesktop = useMediaQuery(desktopMedia);
    const idle = useIdle();
    const { motionPaused } = useSiteState();
    const sources = isDesktop ? video : (mobileVideo ?? video);
    const still = isDesktop ? poster : (mobilePoster ?? poster);

    useEffect(() => {
        const element = player.current;

        if (!element) {
            return;
        }

        if (inView && !motionPaused) {
            element.play().catch(() => undefined);
        } else {
            element.pause();
        }
    }, [idle, inView, motionPaused]);

    return (
        <div ref={ref} className={styles.container}>
            <BackgroundImage background={background} priority landscapeMedia={desktopMedia} />

            {idle && sources?.length ? (
                <video
                    key={isDesktop ? 'desktop' : 'mobile'}
                    ref={player}
                    className={styles.video}
                    poster={still}
                    autoPlay={!motionPaused}
                    loop
                    muted
                    playsInline
                    preload="auto"
                    aria-hidden="true"
                >
                    {sources.map((source) => <source key={source.src} src={source.src} type={source.type} />)}
                </video>
            ) : null}

            <Shadow name="hero" />

            {heading ? (
                <div className={cx(content.contentText, styles.heading)}>
                    <Reveal className={content.inner}>{heading}</Reveal>
                </div>
            ) : null}

            <ScrollIndicator text={scrollText} anchor={scrollAnchor} />
        </div>
    );
}
