'use client';

import { useId, useState, type ReactNode } from 'react';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cx } from '@/lib/cx';
import { useMediaQuery } from '@/lib/useMediaQuery';
import styles from './Footer.module.css';

interface FooterColumnProps {
    children: ReactNode;
    hasLinks: boolean;
    heading: string;
    href?: string;
}

function Heading({ href, text }: { href?: string; text: string }) {
    return href ? <ExternalLink href={href} className={styles.link}><h2>{text}</h2></ExternalLink> : <h2>{text}</h2>;
}

export function FooterColumn({ children, hasLinks, heading, href }: FooterColumnProps) {
    const [opened, setOpened] = useState(false);
    const listId = useId();
    const stacked = useMediaQuery('(max-width: 767px)');
    const toggles = hasLinks && !href && stacked;

    return (
        <div className={cx(styles.group, (opened || !toggles) && styles.groupOpened)}>
            <div className={cx(styles.groupHeading, hasLinks && styles.hasLinks)}>
                {toggles ? (
                    <h2>
                        <button type="button" className={styles.toggle} aria-expanded={opened} aria-controls={listId} onClick={() => setOpened((value) => !value)}>
                            {heading}
                        </button>
                    </h2>
                ) : (
                    <Heading href={href} text={heading} />
                )}
            </div>
            {hasLinks ? <ul id={listId} className={styles.subLinks}>{children}</ul> : null}
        </div>
    );
}
