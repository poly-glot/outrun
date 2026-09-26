import type { ReactNode } from 'react';
import type { Layout, Theme } from '@/components/Section/Section';

export interface SectionProps {
    backgroundColor?: string;
    children?: ReactNode;
    id: string;
    layout?: Layout;
    menu: string;
    theme?: Theme;
}
