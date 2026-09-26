import type { ReactNode } from 'react';
import { Section } from '@/components/Section/Section';
import { modelCatalogue } from '@/mdx/models';
import { notOfType, ofType, textOf } from '@/mdx/nodes';
import type { SectionProps } from '../section';
import { DecisionSection } from './DecisionSection';

interface OptionProps {
    children: ReactNode;
    id: string;
}

export function Option({ children }: OptionProps) {
    return children;
}

interface QuestionProps {
    children: ReactNode;
    id: string;
    text: string;
}

export function Question({ children }: QuestionProps) {
    return children;
}

interface DecisionProps extends SectionProps {
    defaultLabel: string;
    recommendLabel: string;
}

export function Decision({ backgroundColor, children, defaultLabel, id, layout = '', menu, recommendLabel, theme = '' }: DecisionProps) {
    const questions = ofType<QuestionProps>(children, Question).map((question) => ({
        id: question.props.id,
        options: ofType<OptionProps>(question.props.children, Option).map((option) => ({ id: option.props.id, label: textOf(option.props.children) })),
        text: question.props.text,
    }));
    const rest = notOfType(children, Question);

    return (
        <Section id={id} theme={theme} layout={layout} backgroundColor={backgroundColor} menu={menu}>
            <DecisionSection
                defaultLabel={defaultLabel}
                heading={ofType(rest, 'h2')}
                intro={notOfType(rest, 'h2')}
                models={modelCatalogue()}
                questions={questions}
                recommendLabel={recommendLabel}
            />
        </Section>
    );
}
