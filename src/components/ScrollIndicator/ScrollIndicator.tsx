'use client';

import styles from './ScrollIndicator.module.css';

interface ScrollIndicatorProps {
    anchor?: string;
    text?: string;
}

export function ScrollIndicator({ anchor, text }: ScrollIndicatorProps) {
    if (!anchor || !text) {
        return null;
    }

    return (
        <a href={`#${anchor}`} className={styles.container}>
            <span className={styles.mousey}>
                <span className={styles.scroller} />
            </span>
            <svg className={styles.arrow} height="24" viewBox="0 0 32 32" width="24" aria-hidden="true">
                <path
                    d="M24.285,11.284L16,19.571l-8.285-8.288c-0.395-0.395-1.034-0.395-1.429,0c-0.394,0.395-0.394,1.035,0,1.43l8.999,9.002l0,0l0,0c0.394,0.395,1.034,0.395,1.428,0l8.999-9.002c0.394-0.395,0.394-1.036,0-1.431C25.319,10.889,24.679,10.889,24.285,11.284z"
                    fill="currentColor"
                />
            </svg>
            <span className={styles.text}>{text}</span>
        </a>
    );
}
