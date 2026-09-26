'use§ client';

import { useId } from 'react';
import { cx } from '@/lib/cx';
import { useSiteDispatch } from '@/state/store';
import styles from './QuestionRow.module.css';

export interface QuestionContent {
    id: string;
    options: { id: string; label: string }[];
    text: string;
}

interface QuestionRowProps extends QuestionContent {
    faded: boolean;
    selected: string;
}

export function QuestionRow({ faded, id, options, selected, text }: QuestionRowProps) {
    const dispatch = useSiteDispatch();
    const questionId = useId();

    return (
        <div className={cx(styles.question, faded && styles.questionFaded)} role="group" aria-labelledby={questionId}>
            <div className={styles.questionText} id={questionId}>{text}</div>
            <div className={styles.options}>
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        disabled={faded}
                        className={cx('btn', styles.option, option.id === selected && styles.optionActive)}
                        aria-pressed={option.id === selected}
                        onClick={() => dispatch({ optionId: option.id, questionId: id, type: 'answer' })}
                    >
                        <span className={styles.optionLabel}>{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
