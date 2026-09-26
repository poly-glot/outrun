'use client';

import { m, type MotionValue } from 'framer-motion';
import { useScrub } from '@/lib/useScrub';
import type { Timed } from './timed';
import styles from './Intro.module.css';

function Line({ children, from, progress, to }: Timed & { children: string }) {
    const scrub = useScrub(progress, from, to, '100%');

    return (
        <span className={styles.line}>
            <m.span className={styles.lineInner} style={scrub}>{children}</m.span>
        </span>
    );
}

function Word({ children, from, progress, to }: Timed & { children: string }) {
    const scrub = useScrub(progress, from, to, '-30%');

    return (
        <>
            <m.span className={styles.word} style={scrub}>{children}</m.span>{' '}
        </>
    );
}

interface IntroProps {
    heading: string[];
    progress: MotionValue<number>;
    text: string;
}

export function Intro({ heading, progress, text }: IntroProps) {
    const words = text.trim().split(/\s+/);
    const wordStep = 0.16 / Math.max(words.length, 1);

    return (
        <div className={styles.intro}>
            <h2 className={styles.heading}>
                {heading.map((line, index) => (
                    <Line key={index} progress={progress} from={0.06 + index * 0.03} to={0.14 + index * 0.03}>{line}</Line>
                ))}
            </h2>
            <p className={styles.text}>
                {words.map((word, index) => (
                    <Word key={index} progress={progress} from={0.14 + index * wordStep} to={0.2 + index * wordStep}>{word}</Word>
                ))}
            </p>
        </div>
    );
}
