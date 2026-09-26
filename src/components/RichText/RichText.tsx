interface RichTextProps {
    className?: string;
    html: string;
}

export function RichText({ className, html }: RichTextProps) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
