'use client';

import { m } from 'framer-motion';
import { RichText } from '@/components/RichText/RichText';
import { useSectionProgress } from '@/components/Section/Section';
import { fill } from '@/lib/strings';
import { useRange } from '@/lib/useRange';
import { useStrings } from '@/state/store';
import { useDigits } from './useDigits';
import styles from './SavingFigure.module.css';

interface SavingFigureProps {
    delay: number;
    sticker?: string;
    svg: string;
    unit: string;
    value: number;
}

export function SavingFigure({ delay, sticker, svg, unit, value }: SavingFigureProps) {
    const progress = useSectionProgress();
    const offset = delay * 0.1;
    const reveal = useRange(progress, 0.24 + offset, 0.5 + offset);
    const digits = useDigits(reveal, Math.abs(value));
    const strings = useStrings();
    const marks = unit.match(/\*+$/)?.[0].length ?? 0;
    const spokenUnit = unit.replace(/\*+$/, '');
    const spoken = `${sticker ? `${sticker} ` : ''}${Math.abs(value)} ${spokenUnit}${marks ? `, ${fill(strings.footnote, { n: marks })}` : ''}`;

    return (
        <div className={styles.saving}>
            <div className={styles.icon}>
                <span className={styles.iconInner}>
                    {sticker ? <span className={styles.sticker}>{sticker}</span> : null}
                    <RichText html={svg} />
                </span>
            </div>
            <div className={styles.numbers} aria-hidden="true">
                <m.span>{digits}</m.span>
                <span className={styles.sign}>{unit}</span>
            </div>
            <span className="srOnly">{spoken}</span>
        </div>
    );
}
