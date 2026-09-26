'use client';

import { AnimatePresence, m } from 'framer-motion';
import type { ReactNode } from 'react';
import { useSiteState } from '@/state/store';

interface FlipProps {
    children: ReactNode;
    className?: string;
    id: string;
}

export function Flip({ children, className, id }: FlipProps) {
    const { motionPaused } = useSiteState();

    return (
        <AnimatePresence initial={false} mode="popLayout">
            <m.div
                key={id}
                className={className}
                initial={{ opacity: 0, rotateX: -45, y: '25%' }}
                animate={{ opacity: 1, rotateX: 0, y: 0 }}
                exit={{ opacity: 0, rotateX: 45, y: '-50%' }}
                transition={{ duration: motionPaused ? 0 : 0.3, ease: 'easeOut' }}
            >
                {children}
            </m.div>
        </AnimatePresence>
    );
}
