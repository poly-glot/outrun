'use client';

import { cx } from '@/lib/cx';
import { scrollToSection } from '@/lib/scrollTo';
import { fill } from '@/lib/strings';
import { useSiteDispatch, useSiteState, useStrings } from '@/state/store';
import styles from './ModelBar.module.css';

interface ModelBarProps {
    list: { id: string; label: string }[];
    sectionId: string;
}

export function ModelBar({ list, sectionId }: ModelBarProps) {
    const { selectedModel } = useSiteState();
    const dispatch = useSiteDispatch();
    const strings = useStrings();
    const selectedLabel = list.find((model) => model.id === selectedModel)?.label ?? '';

    const select = (model: string) => {
        dispatch({ model, type: 'selectModel' });
        scrollToSection(sectionId);
    };

    return (
        <div className={styles.bar} role="group" aria-label={strings.models}>
            {list.map((model) => (
                <button
                    key={model.id}
                    type="button"
                    aria-pressed={model.id === selectedModel}
                    className={cx('btn', styles.button, model.id === selectedModel && styles.buttonActive)}
                    onClick={() => select(model.id)}
                >
                    {model.label}
                </button>
            ))}
            <span className="srOnly" aria-live="polite">{fill(strings.showing, { model: selectedLabel })}</span>
        </div>
    );
}
