'use client';

import type { ReactNode } from 'react';
import { m, type MotionValue } from 'framer-motion';
import { Reveal } from '@/components/Reveal/Reveal';
import { RichText } from '@/components/RichText/RichText';
import { useScrub } from '@/lib/useScrub';
import type { Timed } from './timed';
import styles from './Facts.module.css';

export interface FactContent {
    body: ReactNode;
    svg: string;
}

function ScrubbedFact({ fact, from, progress, to }: Timed & { fact: FactContent }) {
    const scrub = useScrub(progress, from, to, '-30%');

    return (
        <m.div className={styles.fact} style={scrub}>
            <RichText html={fact.svg} className={styles.icon} />
            {fact.body}
        </m.div>
    );
}

export function ScrubbedFacts({ facts, progress }: { facts: FactContent[]; progress: MotionValue<number> }) {
    return (
        <div className={styles.keyfacts}>
            {facts.map((fact, index) => (
                <ScrubbedFact key={index} fact={fact} progress={progress} from={0.5 + index * 0.05} to={0.58 + index * 0.05} />
            ))}
        </div>
    );
}

export function StackedFacts({ facts }: { facts: FactContent[] }) {
    return (
        <div className={styles.stacked}>
            {facts.map((fact, index) => (
                <Reveal key={index} className={styles.fact}>
                    <RichText html={fact.svg} className={styles.icon} />
                    {fact.body}
                </Reveal>
            ))}
        </div>
    );
}
