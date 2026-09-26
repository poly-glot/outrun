'use client';

import type { ReactNode } from 'react';
import { useStrings } from '@/state/store';

interface ExternalLinkProps {
    children: ReactNode;
    className?: string;
    href: string;
}

export function ExternalLink({ children, className, href }: ExternalLinkProps) {
    const strings = useStrings();

    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
            {children}
            <span className="srOnly"> {strings.opensInNewTab}</span>
        </a>
    );
}
