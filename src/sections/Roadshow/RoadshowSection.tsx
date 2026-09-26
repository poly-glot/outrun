'use client';

import type { ReactNode } from 'react';
import { BackgroundImage, type Background } from '@/components/BackgroundImage/BackgroundImage';
import { Reveal } from '@/components/Reveal/Reveal';
import { cx } from '@/lib/cx';
import { useSiteDispatch } from '@/state/store';
import content from '../ContentText.module.css';
import styles from './RoadshowSection.module.css';

interface RoadshowSectionProps {
    background: Background;
    children: ReactNode;
    cta?: string;
    kicker: string;
}

export function RoadshowSection({ background, children, cta, kicker }: RoadshowSectionProps) {
    const dispatch = useSiteDispatch();

    return (
        <div className={cx(content.container, styles.container)}>
            <BackgroundImage background={background} className={styles.background} />

            <div className={styles.contentText}>
                <Reveal className={styles.inner}>
                    {kicker ? <p className={styles.kicker}>{kicker}</p> : null}
                    {children}

                    {cta ? (
                        <div className={styles.cta}>
                            <button type="button" className="btn btn-border" onClick={() => dispatch({ type: 'openContact' })}>
                                <span>{cta}</span>
                            </button>
                        </div>
                    ) : null}
                </Reveal>
            </div>

            <hr className={styles.hr} aria-hidden="true" />
        </div>
    );
}
