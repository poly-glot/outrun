import { Section, type SectionProps } from '@/components/Section/Section';
import { listGallery, mediaUrl } from '@/mdx/media';
import { MediaSection } from './MediaSection';

interface MediaProps extends SectionProps {
    downloadAll: string;
    downloadAllText: string;
    downloadText: string;
    folder: string;
}

export function Media({ children, downloadAll, downloadAllText, downloadText, folder, ...section }: MediaProps) {
    return (
        <Section {...section}>
            <MediaSection downloadAll={mediaUrl(downloadAll)} downloadAllText={downloadAllText} downloadText={downloadText} gallery={listGallery(folder)}>
                {children}
            </MediaSection>
        </Section>
    );
}
