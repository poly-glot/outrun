import { Section } from '@/components/Section/Section';
import { listGallery, mediaUrl } from '@/mdx/media';
import type { SectionProps } from '../section';
import { MediaSection } from './MediaSection';

interface MediaProps extends SectionProps {
    downloadAll: string;
    downloadAllText: string;
    downloadText: string;
    folder: string;
}

export function Media({ backgroundColor, children, downloadAll, downloadAllText, downloadText, folder, id, layout = '', menu, theme = '' }: MediaProps) {
    return (
        <Section id={id} theme={theme} layout={layout} backgroundColor={backgroundColor} menu={menu}>
            <MediaSection downloadAll={mediaUrl(downloadAll)} downloadAllText={downloadAllText} downloadText={downloadText} gallery={listGallery(folder)}>
                {children}
            </MediaSection>
        </Section>
    );
}
