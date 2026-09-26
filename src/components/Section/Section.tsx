'use client';

import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react';
import { useInView, useMotionValueEvent, useScroll, type MotionValue } from 'framer-motion';
import { cx } from '@/lib/cx';
import { activeSectionId, sectionProgress } from '@/state/sectionProgress';
import styles from './Section.module.css';

export type Theme = '' | 'white' | 'black';
export type Layout = '' | 'normalPage';

const ProgressContext = createContext<MotionValue<number> | null>(null);

export function useSectionProgress(): MotionValue<number> {
    const progress = useContext(ProgressContext);

    if (!progress) {
        throw new Error('useSectionProgress must be used inside a Section');
    }

    return progress;
}

interface SectionProps {
    backgroundColor?: string;
    children: ReactNode;
    id: string;
    layout: Layout;
    menu: string;
    theme: Theme;
}

export function Section({ backgroundColor, children, id, layout, menu, theme }: SectionProps) {
    const ref = useRef<HTMLElement>(null);
    const progress = sectionProgress(id);
    const { scrollYProgress } = useScroll({ offset: ['start end', 'end start'], target: ref });
    const centered = useInView(ref, { margin: '-50% 0px -50% 0px' });

    useMotionValueEvent(scrollYProgress, 'change', (value) => progress.set(value));

    useEffect(() => {
        if (centered) {
            activeSectionId.set(id);
        }
    }, [centered, id]);

    return (
        <section
            ref={ref}
            aria-label={menu}
            id={id}
            className={cx(styles.page, theme && styles[theme], layout && styles[layout])}
            style={backgroundColor ? { backgroundColor } : undefined}
        >
            <ProgressContext.Provider value={progress}>{children}</ProgressContext.Provider>
        </section>
    );
}
