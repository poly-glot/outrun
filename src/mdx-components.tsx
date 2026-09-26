import type { MDXComponents } from 'mdx/types';
import { Decision, Option, Question } from '@/sections/Decision/Decision';
import { Country, Events } from '@/sections/Events/Events';
import { Feature, Features } from '@/sections/Features/Features';
import { Column, Footer, Legal } from '@/sections/Footer/Footer';
import { Hero } from '@/sections/Hero/Hero';
import { Media } from '@/sections/Media/Media';
import { Fact, Raising } from '@/sections/Raising/Raising';
import { Roadshow } from '@/sections/Roadshow/Roadshow';
import { Statement } from '@/sections/Statement/Statement';
import { Chart, Charts, Note, Saving, Savings, Strength } from '@/sections/Strength/Strength';
import { ModelText, QuickFact, Technical } from '@/sections/Technical/Technical';
import { More, Welcome } from '@/sections/Welcome/Welcome';

export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        Chart,
        Charts,
        Column,
        Country,
        Decision,
        Events,
        Fact,
        Feature,
        Features,
        Footer,
        Hero,
        Legal,
        Media,
        ModelText,
        More,
        Note,
        Option,
        Question,
        QuickFact,
        Raising,
        Roadshow,
        Saving,
        Savings,
        Statement,
        Strength,
        Technical,
        Welcome,
        ...components,
    };
}
