'use client';

import { m } from 'framer-motion';
import type { ReactNode } from 'react';
import { useSiteState } from '@/state/store';

interface RevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
}

export function Reveal({ children, className, delay = 0 }: RevealProps) {
    const { motionPaused } = useSiteState();

    return (
        <m.div
            className={className}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ amount: 0.25, once: true }}
            transition={motionPaused ? { duration: 0 } : { delay, duration: 0.8, ease: [0.165, 0.84, 0.44, 1] }}
        >
            {children}
        </m.div>
    );
}
