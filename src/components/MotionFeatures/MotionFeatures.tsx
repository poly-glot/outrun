'use client';

import type { ReactNode } from 'react';
import { LazyMotion, domAnimation } from 'framer-motion';

export function MotionFeatures({ children }: { children: ReactNode }) {
    return (
        <LazyMotion features={domAnimation} strict>
            {children}
        </LazyMotion>
    );
}
