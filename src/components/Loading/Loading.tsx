'use client';

import { useStrings } from '@/state/store';
import styles from './Loading.module.css';

export function Loading() {
    const strings = useStrings();

    return (
        <div className={styles.container} role="status">
            <span className={styles.dots}>
                <span className={styles.dot1} />
                <span className={styles.dot2} />
                <span className={styles.dot3} />
                <span className={styles.dot4} />
            </span>
            <span className={styles.text}>{strings.loading}</span>
        </div>
    );
}
