'use client';

import type { ReactNode } from 'react';
import { m, useTransform, type MotionStyle } from 'framer-motion';
import { BackgroundImage, type Background } from '@/components/BackgroundImage/BackgroundImage';
import { Reveal } from '@/components/Reveal/Reveal';
import { useSectionProgress } from '@/components/Section/Section';
import { cx } from '@/lib/cx';
import { useRange } from '@/lib/useRange';
import content from '../ContentText.module.css';
import styles from './WelcomeSection.module.css';

interface WelcomeSectionProps {
    background: Background;
    children: ReactNode;
}

export function WelcomeSection({ background, children }: WelcomeSectionProps) {
    const progress = useSectionProgress();
    const moreLine = useTransform(useRange(progress, 0.3, 0.7), (value) => `${value * 100}%`);
    const style = { '--more-line': moreLine } as unknown as MotionStyle;

    return (
        <div className={cx(content.container, content.paperOnTablet, styles.container)}>
            <BackgroundImage background={background} className={styles.background} />

            <m.div className={content.contentText} style={style}>
                <Reveal className={content.inner}>{children}</Reveal>
            </m.div>
        </div>
    );
}
