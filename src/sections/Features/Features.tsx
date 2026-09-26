import type { ReactNode } from 'react';
import { Section } from '@/components/Section/Section';
import { mediaUrl } from '@/mdx/media';
import { notOfType, ofType, textOf } from '@/mdx/nodes';
import type { SectionProps } from '../section';
import { FeaturesSection } from './FeaturesSection';

interface FeatureProps {
    children: ReactNode;
    image: string;
    models: string;
    video?: string;
}

export function Feature({ children }: FeatureProps) {
    return children;
}

export function Features({ backgroundColor, children, id, layout = '', menu, theme = '' }: SectionProps) {
    const features = ofType<FeatureProps>(children, Feature).map((feature) => ({
        body: feature.props.children,
        heading: textOf(ofType(feature.props.children, 'h3')),
        image: mediaUrl(feature.props.image),
        models: feature.props.models.split(',').map((model) => model.trim()),
        summary: textOf(ofType(feature.props.children, 'p')),
        video: feature.props.video,
    }));

    return (
        <Section id={id} theme={theme} layout={layout} backgroundColor={backgroundColor} menu={menu}>
            <FeaturesSection features={features} heading={notOfType(children, Feature)} />
        </Section>
    );
}
