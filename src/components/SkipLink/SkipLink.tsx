'use client';

import { useStrings } from '@/state/store';
import styles from './SkipLink.module.css';

export function SkipLink() {
    const strings = useStrings();

    return (
        <a href="#content" className={styles.link}>
            {strings.skipToContent}
        </a>
    );
}
