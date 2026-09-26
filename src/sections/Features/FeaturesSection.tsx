'use client';

import type { ReactNode } from 'react';
import Image from 'next/image';
import { Reveal } from '@/components/Reveal/Reveal';
import { ShareLinks } from '@/components/ShareLinks/ShareLinks';
import { fill } from '@/lib/strings';
import { useSiteDispatch, useSiteState, useStrings } from '@/state/store';
import styles from './FeaturesSection.module.css';

interface FeatureContent {
    body: ReactNode;
    heading: string;
    image: string;
    models: string[];
    summary: string;
    video?: string;
}

function Thumbnail({ heading, image, video }: FeatureContent) {
    const dispatch = useSiteDispatch();
    const strings = useStrings();
    const picture = <Image src={image} alt="" width={300} height={169} className={styles.thumbnail} />;

    if (!video) {
        return picture;
    }

    return (
        <button type="button" className={styles.videoButton} aria-label={fill(strings.playVideo, { title: heading })} onClick={() => dispatch({ title: heading, type: 'showVideo', videoId: video })}>
            {picture}
        </button>
    );
}

interface FeaturesSectionProps {
    features: FeatureContent[];
    heading: ReactNode;
}

export function FeaturesSection({ features, heading }: FeaturesSectionProps) {
    const { selectedModel } = useSiteState();
    const visible = features.filter((feature) => feature.models.includes(selectedModel));

    return (
        <div className={styles.container}>
            <div className={styles.heading}>{heading}</div>

            <div className={styles.features}>
                {visible.map((feature, index) => (
                    <Reveal key={feature.heading} className={styles.feature} delay={(index % 3) * 0.1}>
                        <Thumbnail {...feature} />
                        {feature.body}
                        <ShareLinks text={feature.summary} image={feature.image} className={styles.share} />
                    </Reveal>
                ))}
            </div>
        </div>
    );
}
