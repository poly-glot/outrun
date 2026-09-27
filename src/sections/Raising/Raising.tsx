import type { ReactNode } from 'react';
import { Section, type SectionProps } from '@/components/Section/Section';
import { mediaUrl } from '@/mdx/media';
import { linesOf, notOfType, ofType, textOf } from '@/mdx/nodes';
import { icons } from '@content/icons';
import { RaisingSection } from './RaisingSection';

interface FactProps {
    children: ReactNode;
    icon: string;
}

export function Fact({ children }: FactProps) {
    return children;
}

interface RaisingProps extends SectionProps {
    mobileImage: string;
    video: string;
}

export function Raising({ children, mobileImage, video, ...section }: RaisingProps) {
    const facts = ofType<FactProps>(children, Fact).map((fact) => ({ body: fact.props.children, svg: icons[fact.props.icon] ?? '' }));
    const intro = notOfType(children, Fact);
    const headingLines = linesOf(ofType(intro, 'h2'));
    const introText = textOf(ofType(intro, 'p'));

    return (
        <Section {...section}>
            <RaisingSection
                facts={facts}
                headingLines={headingLines}
                intro={intro}
                introText={introText}
                mobileImage={mediaUrl(mobileImage)}
                video={mediaUrl(video)}
            />
        </Section>
    );
}
