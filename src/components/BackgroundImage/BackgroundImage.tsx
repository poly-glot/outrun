import { getImageProps } from 'next/image';
import { cx } from '@/lib/cx';
import styles from './BackgroundImage.module.css';

export interface Background {
    backgroundColor?: string;
    landscape?: string;
    portrait?: string;
    shadow?: boolean;
}

interface BackgroundImageProps {
    background: Background;
    className?: string;
    landscapeMedia?: string;
    priority?: boolean;
}

export function BackgroundImage({
    background,
    className,
    landscapeMedia = '(min-width: 980px)',
    priority = false,
}: BackgroundImageProps) {
    const { backgroundColor, landscape, portrait } = background;
    const fallback = portrait ?? landscape;

    if (!fallback) {
        return null;
    }

    const { props: fallbackProps } = getImageProps({ alt: '', fill: true, priority, src: fallback });
    const artDirected = landscape && portrait;

    return (
        <picture className={cx(styles.container, className)} style={backgroundColor ? { backgroundColor } : undefined}>
            {artDirected ? <source media={landscapeMedia} srcSet={landscape} /> : null}
            <img {...fallbackProps} alt="" className={styles.image} />
        </picture>
    );
}
