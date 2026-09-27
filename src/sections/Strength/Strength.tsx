import type { ReactNode } from 'react';
import { Section, type SectionProps } from '@/components/Section/Section';
import { icons } from '@content/icons';
import { ChartFigure } from './ChartFigure';
import { SavingFigure } from './SavingFigure';
import { StrengthSection } from './StrengthSection';
import styles from './StrengthSection.module.css';

export function Strength({ children, ...section }: SectionProps) {
    return (
        <Section {...section}>
            <StrengthSection>{children}</StrengthSection>
        </Section>
    );
}

export function Charts({ children }: { children: ReactNode }) {
    return <div className={styles.charts}>{children}</div>;
}

interface ChartProps {
    children: ReactNode;
    delay?: number;
    value: number;
}

export function Chart({ children, delay = 0, value }: ChartProps) {
    return <ChartFigure delay={delay} value={value}>{children}</ChartFigure>;
}

export function Savings({ children, heading }: { children: ReactNode; heading: string }) {
    return (
        <div className={styles.savings}>
            <h3>{heading}</h3>
            <div className={styles.savingsRow}>{children}</div>
        </div>
    );
}

interface SavingProps {
    delay?: number;
    icon: string;
    sticker?: string;
    unit: string;
    value: number;
}

export function Saving({ delay = 0, icon, sticker, unit, value }: SavingProps) {
    return <SavingFigure delay={delay} svg={icons[icon] ?? ''} sticker={sticker} unit={unit} value={value} />;
}

export function Note({ children }: { children: ReactNode }) {
    return <p className={styles.note}>{children}</p>;
}
