'use client';

import { useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import { ShareLinks } from '@/components/ShareLinks/ShareLinks';
import type { GalleryImage } from '@/mdx/media';
import { cx } from '@/lib/cx';
import { fill } from '@/lib/strings';
import { useStrings } from '@/state/store';
import styles from './MediaSection.module.css';

const arrow = (
    <svg width="27" height="44" viewBox="0 0 27 44" aria-hidden="true">
        <path fill="currentColor" d="M0 22 22 0l2.1 2.1L4.2 22l19.9 19.9L22 44z" />
    </svg>
);

interface MediaSectionProps {
    children: ReactNode;
    downloadText: string;
    gallery: GalleryImage[];
}

export function MediaSection({ children, downloadText, gallery }: MediaSectionProps) {
    const track = useRef<HTMLDivElement>(null);
    const [active, setActive] = useState(0);
    const strings = useStrings();
    const current = gallery[active];

    const goTo = (index: number) => {
        const element = track.current;

        if (!element) {
            return;
        }

        const clamped = Math.max(0, Math.min(index, gallery.length - 1));
        element.scrollTo({ left: clamped * element.clientWidth });
    };

    const onScroll = () => {
        const element = track.current;

        if (element) {
            setActive(Math.round(element.scrollLeft / element.clientWidth));
        }
    };

    return (
        <div className={cx('contentContainer', styles.container)}>
            {children}

            <div className={styles.preview}>
                <div className={styles.carousel}>
                    <div ref={track} className={styles.track} role="region" aria-label={strings.gallery} tabIndex={0} onScroll={onScroll}>
                        {gallery.map((image, index) => (
                            <div key={image.large} className={styles.slide}>
                                <Image
                                    src={image.large}
                                    alt=""
                                    width={640}
                                    height={360}
                                    className={styles.slideImage}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                />
                            </div>
                        ))}
                    </div>
                    <button type="button" className={cx(styles.nav, styles.prev)} aria-label={strings.previousImage} onClick={() => goTo(active - 1)}>{arrow}</button>
                    <button type="button" className={cx(styles.nav, styles.next)} aria-label={strings.nextImage} onClick={() => goTo(active + 1)}>{arrow}</button>
                </div>

                <div className={styles.download}>
                    <a className={cx('btn', 'btn-primary', styles.downloadButton)} href={current?.full} download>
                        <span>{downloadText}</span>
                    </a>
                    <ShareLinks image={current?.large} className={styles.share} />
                </div>
            </div>

            <div className={styles.thumbnails}>
                {gallery.map((image, index) => (
                    <button
                        key={image.thumbnail}
                        type="button"
                        className={cx(styles.thumbnail, index === active && styles.thumbnailActive)}
                        aria-label={fill(strings.showImage, { n: index + 1 })}
                        aria-current={index === active || undefined}
                        onClick={() => goTo(index)}
                    >
                        <Image src={image.thumbnail} alt="" width={100} height={56} />
                    </button>
                ))}
            </div>
        </div>
    );
}
