'use client';

import type { ReactNode } from 'react';
import { m, useTransform } from 'framer-motion';
import { useSectionProgress } from '@/components/Section/Section';
import { useRange } from '@/lib/useRange';
import { archPath, circlePath } from './circlePath';
import { useDigits } from './useDigits';
import styles from './ChartFigure.module.css';

interface ChartFigureProps {
    children: ReactNode;
    delay: number;
    value: number;
}

export function ChartFigure({ children, delay, value }: ChartFigureProps) {
    const progress = useSectionProgress();
    const offset = delay * 0.1;
    const fill = useRange(progress, 0.12 + offset, 0.3 + offset);
    const reveal = useRange(progress, 0.26 + offset, 0.5 + offset);
    const magnitude = Math.abs(value);
    const positive = value > 0;
    const fraction = magnitude / 100;

    const arch = useTransform(fill, (v) => archPath(v * 100));
    const pathLength = useTransform(reveal, (v) => v * fraction);
    const pathOffset = useTransform(reveal, (v) => (positive ? 1 - v * fraction : 0));
    const rotate = useTransform(reveal, (v) => v * magnitude * 3.6 * (positive ? 1 : -1));
    const opacity = useTransform(reveal, [0, 0.15], [0, 1]);
    const digits = useDigits(reveal, magnitude);

    const spoken = `${positive ? '+' : '-'}${magnitude}%`;

    return (
        <div className={styles.chart}>
            <h3>{children}</h3>
            <div className={styles.figure}>
                <svg className={styles.svg} viewBox="0 0 170 170" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <m.path d={arch} fill="#fff" fillOpacity={0.3} transform="translate(85, 85)" />
                    <path d={circlePath} fill="none" stroke="#000" strokeOpacity={0.7} strokeWidth={24} strokeMiterlimit={10} />
                    <m.path
                        d={circlePath}
                        fill="none"
                        stroke="#FDC529"
                        strokeWidth={24}
                        strokeMiterlimit={10}
                        style={{ opacity, pathLength, pathOffset }}
                    />
                    <m.g style={{ opacity }}>
                        {positive ? (
                            <g>
                                <rect x="84.1" y="-0.5" width="2" height="24" />
                                <polygon points="91.4,11.8 86.1,17 86.1,6.5" />
                            </g>
                        ) : (
                            <g>
                                <rect x="83.98" y="-0.25" width="2" height="24" />
                                <polygon points="78.75 11.5 83.98 6.27 83.98 16.73 78.75 11.5" />
                            </g>
                        )}
                    </m.g>
                    <m.g style={{ opacity, originX: '85px', originY: '85px', rotate }}>
                        <path
                            fill="#000"
                            d={positive ? 'M83.93,6.41h2.2v3.9h3.34V12.5H86.13v3.89h-2.2V12.5H80.57V10.31h3.36Z' : 'M89.57,10.15v2.2H80.68v-2.2Z'}
                        />
                    </m.g>
                </svg>

                <m.div className={styles.numbers} style={{ opacity }} aria-hidden="true">
                    <span>{positive ? '+' : '-'}</span>
                    <m.span>{digits}</m.span>
                    <span className={styles.sign}>%</span>
                </m.div>
                <span className="srOnly">{spoken}</span>
            </div>
        </div>
    );
}
