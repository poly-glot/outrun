import type { ReactNode } from 'react';
import { Section } from '@/components/Section/Section';
import { mediaUrl } from '@/mdx/media';
import type { SectionProps } from '../section';
import { WelcomeSection } from './WelcomeSection';

interface WelcomeProps extends SectionProps {
    mobileImage: string;
}

export function Welcome({ backgroundColor, children, id, layout = '', menu, mobileImage, theme = '' }: WelcomeProps) {
    return (
        <Section id={id} theme={theme} layout={layout} backgroundColor={backgroundColor} menu={menu}>
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
