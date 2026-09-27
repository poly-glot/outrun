import type { ReactNode } from 'react';
import { Section, type SectionProps } from '@/components/Section/Section';
import { mediaUrl } from '@/mdx/media';
import { modelCatalogue } from '@/mdx/models';
import { ofType } from '@/mdx/nodes';
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

export function Technical({ children, defaultLabel, factsHeading, ...section }: TechnicalProps) {
    const texts = Object.fromEntries(ofType<ModelTextProps>(children, ModelText).map((text) => [text.props.model, text.props.children]));
    const facts = ofType<QuickFactProps>(children, QuickFact).map((fact) => ({ ...fact.props, icon: mediaUrl(fact.props.icon) }));

    return (
        <Section {...section}>
            <TechnicalSection defaultLabel={defaultLabel} facts={facts} factsHeading={factsHeading} heading={section.menu} id={section.id} models={modelCatalogue()} texts={texts} />
        </Section>
    );
}
