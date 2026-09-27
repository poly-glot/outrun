import type { ReactNode } from 'react';
import { Section, type SectionProps } from '@/components/Section/Section';
import { mediaUrl } from '@/mdx/media';
import { WelcomeSection } from './WelcomeSection';

interface WelcomeProps extends SectionProps {
    mobileImage: string;
}

export function Welcome({ children, mobileImage, ...section }: WelcomeProps) {
    return (
        <Section {...section}>
            <WelcomeSection background={{ portrait: mediaUrl(mobileImage) }}>{children}</WelcomeSection>
        </Section>
    );
}

export function More({ children }: { children: ReactNode }) {
    return (
        <span className="more">
            {children}
            <span className="moreLine" />
        </span>
    );
}
