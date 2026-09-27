import { Section, type SectionProps } from '@/components/Section/Section';
import { mediaUrl } from '@/mdx/media';
import { notOfType, ofType, textOf } from '@/mdx/nodes';
import { RoadshowSection } from './RoadshowSection';

interface RoadshowProps extends SectionProps {
    cta?: string;
    image: string;
    mobileImage: string;
}

export function Roadshow({ children, cta, image, mobileImage, ...section }: RoadshowProps) {
    return (
        <Section {...section}>
            <RoadshowSection background={{ backgroundColor: section.backgroundColor, landscape: mediaUrl(image), portrait: mediaUrl(mobileImage) }} cta={cta} kicker={textOf(ofType(children, 'h4'))}>
                {notOfType(children, 'h4')}
            </RoadshowSection>
        </Section>
    );
}
