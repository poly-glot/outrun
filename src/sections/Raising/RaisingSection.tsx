'use client';

import type { ReactNode } from 'react';
import { BackgroundImage } from '@/components/BackgroundImage/BackgroundImage';
import { Reveal } from '@/components/Reveal/Reveal';
import { useSectionProgress } from '@/components/Section/Section';
import { useMediaQuery } from '@/lib/useMediaQuery';
import { Clip } from './Clip';
import { ScrubbedFacts, StackedFacts, type FactContent } from './Facts';
import { Intro } from './Intro';
import styles from './RaisingSection.module.css';

const sceneMedia = '(min-width: 1024px)';

interface RaisingSectionProps {
    facts: FactContent[];
    headingLines: string[];
    intro: ReactNode;
    introText: string;
    mobileImage: string;
    video: string;
}

export function RaisingSection({ facts, headingLines, intro, introText, mobileImage, video }: RaisingSectionProps) {
    const progress = useSectionProgress();
    const scene = useMediaQuery(sceneMedia);

    return (
        <div className={styles.container}>
            <div className={styles.scene}>
                <div className={styles.pane}>
                    {scene ? <Clip poster={mobileImage} progress={progress} src={video} /> : null}
                    <Intro heading={headingLines} text={introText} progress={progress} />
                    <ScrubbedFacts facts={facts} progress={progress} />
                </div>
            </div>

            <div className={styles.stack}>
                <Reveal className={styles.stackIntro}>{intro}</Reveal>
                <div className={styles.stackImage}>
                    <BackgroundImage background={{ portrait: mobileImage }} />
                </div>
                <StackedFacts facts={facts} />
            </div>
        </div>
    );
}
