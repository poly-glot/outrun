'use client';

import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import content from '../ContentText.module.css';
import styles from './StrengthSection.module.css';

export function StrengthSection({ children }: { children: ReactNode }) {
    return (
        <div className={cx(content.container, content.paperOnTablet)}>
            <div className={content.contentText}>
                <div className={styles.inner}>{children}</div>
            </div>
        </div>
    );
}
