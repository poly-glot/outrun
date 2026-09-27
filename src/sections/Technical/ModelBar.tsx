'use client';

import { cx } from '@/lib/cx';
import { scrollToSection } from '@/lib/scrollTo';
import { fill } from '@/lib/strings';
import { useSiteDispatch, useSiteState, useStrings } from '@/state/store';
import styles from './ModelBar.module.css';

interface ModelBarProps {
    ids: string[];
    sectionId: string;
}

export function ModelBar({ ids, sectionId }: ModelBarProps) {
    const { selectedModel } = useSiteState();
    const dispatch = useSiteDispatch();
    const strings = useStrings();

    const select = (model: string) => {
        dispatch({ model, type: 'selectModel' });
        scrollToSection(sectionId);
    };

    return (
        <div className={styles.bar} role="group" aria-label={strings.models}>
            {ids.map((model) => (
                <button
                    key={model}
                    type="button"
                    aria-pressed={model === selectedModel}
                    className={cx('btn', styles.button, model === selectedModel && styles.buttonActive)}
                    onClick={() => select(model)}
                >
                    {model}
                </button>
            ))}
            <span className="srOnly" aria-live="polite">{fill(strings.showing, { model: selectedModel })}</span>
        </div>
    );
}
