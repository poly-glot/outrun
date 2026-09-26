declare module '*.mdx' {
    import type { ComponentType } from 'react';
    import type { SiteStrings } from '@/mdx/pages';

    const Content: ComponentType<Record<string, unknown>>;
    export default Content;
    export const meta: { description: string; title: string } | undefined;
    export const strings: SiteStrings;
}
