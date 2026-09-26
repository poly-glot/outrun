import type { ReactNode } from 'react';
import { Section } from '@/components/Section/Section';
import { mediaUrl } from '@/mdx/media';
import { modelCatalogue } from '@/mdx/models';
import { ofType } from '@/mdx/nodes';
import type { SectionProps } from '../section';
import { TechnicalSection } from './TechnicalSection';

interface ModelTextProps {
    children: ReactNode;
    model: string;
}

export function ModelText({ children }: ModelTextProps) {
    return children;
}

interface QuickFactProps {
    icon: string;
    label: string;
    values: Record<string, string>;
}

export function QuickFact() {
    return null;
}

interface TechnicalProps extends SectionProps {
    defaultLabel: string;
    factsHeading?: string;
}

export function Technical({ backgroundColor, children, defaultLabel, factsHeading, id, layout = '', menu, theme = '' }: TechnicalProps) {
    const texts = Object.fromEntries(ofType<ModelTextProps>(children, ModelText).map((text) => [text.props.model, text.props.children]));
    const facts = ofType<QuickFactProps>(children, QuickFact).map((fact) => ({ ...fact.props, icon: mediaUrl(fact.props.icon) }));

    return (
        <Section id={id} theme={theme} layout={layout} backgroundColor={backgroundColor} menu={menu}>
            <TechnicalSection defaultLabel={defaultLabel} facts={facts} factsHeading={factsHeading} heading={menu} id={id} models={modelCatalogue()} texts={texts} />
        </Section>
    );
}
