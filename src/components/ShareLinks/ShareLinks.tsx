'use client';

import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { useBrowserValue } from '@/lib/browserStore';
import { cx } from '@/lib/cx';
import { fill } from '@/lib/strings';
import { useSiteState, useStrings } from '@/state/store';
import styles from './ShareLinks.module.css';

interface ShareLinksProps {
    className?: string;
    image?: string;
    text?: string;
}

export function ShareLinks({ className, image, text }: ShareLinksProps) {
    const origin = useBrowserValue(() => window.location.origin, '');
    const pageTitle = useBrowserValue(() => document.title, '');
    const strings = useStrings();
    const { shareImage } = useSiteState();

    const url = encodeURIComponent(origin || '/');
    const title = encodeURIComponent((text || pageTitle).slice(0, 139));
    const media = encodeURIComponent(origin + (image ?? shareImage));

    return (
        <div className={cx(styles.share, className)}>
            <ExternalLink href={`https://www.facebook.com/sharer.php?u=${url}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" /></svg>
                <span className="srOnly">{fill(strings.shareOn, { network: 'Facebook' })}</span>
            </ExternalLink>
            <ExternalLink href={`https://twitter.com/intent/tweet?url=${url}&text=${title}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.2 2h3.4l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.4l7.9-9.1L1 2h7l4.8 6.4L18.2 2zm-1.2 18h1.9L7.1 3.9H5.1L17 20z" /></svg>
                <span className="srOnly">{fill(strings.shareOn, { network: 'X' })}</span>
            </ExternalLink>
            <ExternalLink href={`https://pinterest.com/pin/create/button/?url=${url}&description=${title}&media=${media}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.6 19.3c-.1-.8-.2-2 0-2.9l1.2-5s-.3-.6-.3-1.5c0-1.4.8-2.4 1.8-2.4.9 0 1.3.6 1.3 1.4 0 .9-.5 2.1-.8 3.3-.2 1 .5 1.8 1.5 1.8 1.8 0 3.1-1.9 3.1-4.6 0-2.4-1.7-4.1-4.2-4.1-2.8 0-4.5 2.1-4.5 4.3 0 .9.3 1.8.7 2.3.1.1.1.2.1.3l-.3 1.1c0 .2-.1.2-.3.1-1.3-.6-2-2.4-2-3.9 0-3.2 2.3-6.1 6.6-6.1 3.5 0 6.2 2.5 6.2 5.8 0 3.4-2.2 6.2-5.2 6.2-1 0-2-.5-2.3-1.2l-.6 2.4c-.2.9-.8 2-1.2 2.6A10 10 0 1 0 12 2z" /></svg>
                <span className="srOnly">{fill(strings.shareOn, { network: 'Pinterest' })}</span>
            </ExternalLink>
        </div>
    );
}
