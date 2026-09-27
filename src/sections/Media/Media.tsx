import { Section, type SectionProps } from '@/components/Section/Section';
import { listGallery } from '@/mdx/media';
import { MediaSection } from './MediaSection';

interface MediaProps extends SectionProps {
    downloadText: string;
    folder: string;
}

export function Media({ children, downloadText, folder, ...section }: MediaProps) {
    return (
        <Section {...section}>
            <MediaSection downloadText={downloadText} gallery={listGallery(folder)}>
                {children}
            </MediaSection>
        </Section>
    );
}
