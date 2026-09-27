'use client';

import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { Flip } from '@/components/Flip/Flip';
import { View360 } from '@/components/View360/View360';
import type { ModelCatalogue } from '@/mdx/models';
import { cx } from '@/lib/cx';
import { useSiteState } from '@/state/store';
import frame from '../ModelFrame.module.css';
import { ModelBar } from './ModelBar';
import { QuickFactRow } from './QuickFactRow';
import styles from './TechnicalSection.module.css';

interface TechnicalSectionProps {
    defaultLabel: string;
    facts: { icon: string; label: string; values: Record<string, string> }[];
    factsHeading?: string;
    heading: string;
    id: string;
    models: ModelCatalogue;
    texts: Record<string, ReactNode>;
}

export function TechnicalSection({ defaultLabel, facts, factsHeading, heading, id, models, texts }: TechnicalSectionProps) {
    const { motionPaused, selectedModel } = useSiteState();
    const frames = models.frames[selectedModel] ?? [];

    return (
        <div className={styles.container}>
            <h2 className="srOnly">{heading}</h2>
            <ModelBar ids={models.ids} sectionId={id} />

            <div className={cx('contentContainerNarrow', styles.content)}>
                <div className={styles.text}>
                    <Flip id={selectedModel}>{texts[selectedModel]}</Flip>
                </div>

                {factsHeading ? <div className={styles.itemHeading}>{factsHeading}</div> : null}

                <div className={styles.listContainer}>
                    <m.div
                        className={styles.list}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ amount: 0.3, once: true }}
                        transition={{ staggerChildren: motionPaused ? 0 : 0.1 }}
                    >
                        {facts.map((fact) => <QuickFactRow key={fact.label} icon={fact.icon} label={fact.label} value={fact.values[selectedModel] ?? ''} />)}
                    </m.div>

                    <div className={styles.three60}>
                        <div className={frame.frame}>
                            <div className={frame.frameHeading}>{defaultLabel}</div>
                            <View360 key={selectedModel} images={frames} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
