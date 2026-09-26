import { Section } from '@/components/Section/Section';
import { mediaUrl } from '@/mdx/media';
import { notOfType, ofType, textOf } from '@/mdx/nodes';
import type { SectionProps } from '../section';
import { RoadshowSection } from './RoadshowSection';

interface RoadshowProps extends SectionProps {
    cta?: string;
    image: string;
    mobileImage: string;
}

export function Roadshow({ backgroundColor, children, cta, id, image, layout = '', menu, mobileImage, theme = '' }: RoadshowProps) {
    return (
        <Section id={id} theme={theme} layout={layout} backgroundColor={backgroundColor} menu={menu}>
            <RoadshowSection background={{ backgroundColor, landscape: mediaUrl(image), portrait: mediaUrl(mobileImage) }} cta={cta} kicker={textOf(ofType(children, 'h4'))}>
                {notOfType(children, 'h4')}
            </RoadshowSection>
        </Section>
    );
}
