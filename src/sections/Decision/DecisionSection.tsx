'use client';

import type { ReactNode } from 'react';
import { View360 } from '@/components/View360/View360';
import type { ModelCatalogue } from '@/mdx/models';
import { cx } from '@/lib/cx';
import { useSiteState } from '@/state/store';
import frame from '../ModelFrame.module.css';
import { QuestionRow, type QuestionContent } from './QuestionRow';
import { RecommendInfo } from './RecommendInfo';
import styles from './DecisionSection.module.css';

interface DecisionSectionProps {
    defaultLabel: string;
    heading: ReactNode;
    intro: ReactNode;
    models: ModelCatalogue;
    questions: QuestionContent[];
    recommendLabel: string;
}

export function DecisionSection({ defaultLabel, heading, intro, models, questions, recommendLabel }: DecisionSectionProps) {
    const { answers, recommendedModel, selectedModel } = useSiteState();
    const frames = models.frames[selectedModel] ?? [];

    return (
        <div className={styles.contentContainer}>
            <div className={styles.heading}>{heading}</div>

            <div className={styles.row}>
                <div className={styles.questions}>
                    <div className={styles.text}>{intro}</div>
                    {questions.map((question, index) => {
                        const previous = questions[index - 1];
                        const faded = index > 0 && !answers[previous.id];

                        return <QuestionRow key={question.id} {...question} faded={faded} selected={answers[question.id] ?? ''} />;
                    })}
                </div>

                <div className={styles.three60}>
                    <div className={cx(frame.frame, styles.frame)}>
                        <div className={frame.frameHeading}>
                            <RecommendInfo recommendText={recommendLabel} recommended={recommendedModel} recommendedDefault={defaultLabel} />
                        </div>
                        <View360 key={selectedModel} images={frames} />
                    </div>
                </div>
            </div>
        </div>
    );
}
