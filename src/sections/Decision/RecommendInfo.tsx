'use client';

import { Flip } from '@/components/Flip/Flip';
import styles from './RecommendInfo.module.css';

interface RecommendInfoProps {
    recommendText: string;
    recommended: string;
    recommendedDefault: string;
}

export function RecommendInfo({ recommendText, recommended, recommendedDefault }: RecommendInfoProps) {
    return (
        <div className={styles.recommend} aria-live="polite" aria-atomic="true">
            <Flip id={recommended} className={styles.recommendText}>
                <span className={styles.recommendLabel}>{recommended ? recommendText : recommendedDefault}</span>
                {recommended ? (
                    <span className={styles.modelContainer}>
                        <svg className={styles.ribbon} width="21" height="28" viewBox="0 0 47 61" aria-hidden="true">
                            <polygon points="47.1,61.5 30.5,61.5 0,30.8 0,0 47.1,0" />
                            <polygon fill="#EB0029" points="30.5,61.5 0,30.8 0,47.6 13.6,61.5" />
                        </svg>
                        <span className={styles.modelName}>{recommended}</span>
                    </span>
                ) : null}
            </Flip>
        </div>
    );
}
