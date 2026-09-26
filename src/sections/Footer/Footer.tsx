import type { ReactNode } from 'react';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { cx } from '@/lib/cx';
import { elementsOf, ofType, textOf } from '@/mdx/nodes';
import { FooterColumn } from './FooterColumn';
import styles from './Footer.module.css';

interface FooterLink {
    href?: string;
    icon?: string;
    text: string;
}

interface FooterGroup {
    heading: FooterLink;
    links: FooterLink[];
}

interface ColumnProps {
    children: ReactNode;
}

export function Column({ children }: ColumnProps) {
    return children;
}

export function Legal({ children }: ColumnProps) {
    return children;
}

function linksOf(list: ReactNode): FooterLink[] {
    return ofType(list, 'ul').flatMap((ul) =>
        ofType(ul.props.children, 'li').map((item) => {
            const link = ofType(item.props.children, 'a')[0];

            return link
                ? { href: link.props.href, icon: link.props.title, text: textOf(link) }
                : { text: textOf(item.props.children) };
        }),
    );
}

function groupsOf(column: ReactNode): FooterGroup[] {
    const groups: FooterGroup[] = [];

    for (const element of elementsOf(column)) {
        if (element.type === 'h3') {
            const link = ofType(element.props.children, 'a')[0];
            groups.push({ heading: { href: link?.props.href, text: textOf(element) }, links: [] });
        } else if (element.type === 'ul' && groups.length > 0) {
            groups[groups.length - 1].links.push(...linksOf(element));
        }
    }

    return groups;
}

function Link({ className, href, icon, text }: FooterLink & { className?: string }) {
    if (!href) {
        return <span className={className}>{text}</span>;
    }

    const linkClass = cx(className, styles.link, icon && 'social-icon', icon);

    if (href.startsWith('/')) {
        return <a href={href} className={linkClass}>{text}</a>;
    }

    return <ExternalLink href={href} className={linkClass}>{text}</ExternalLink>;
}

interface FooterProps {
    children: ReactNode;
    copyright: string;
    location: string;
    locationHref: string;
}

export function Footer({ children, copyright, location, locationHref }: FooterProps) {
    const columns = ofType<ColumnProps>(children, Column).map((column) => groupsOf(column.props.children));
    const legal = ofType<ColumnProps>(children, Legal).flatMap((block) => linksOf(block.props.children));

    return (
        <footer className={styles.section}>
            <div className={styles.container}>
                <div className={styles.columns}>
                    {columns.map((groups, index) => (
                        <div key={index} className={styles.column}>
                            {groups.map((group, groupIndex) => (
                                <FooterColumn key={groupIndex} hasLinks={group.links.length > 0} heading={group.heading.text} href={group.heading.href}>
                                    {group.links.map((link, linkIndex) => (
                                        <li key={linkIndex} className={link.href ? undefined : styles.subheading}>
                                            {link.href ? <Link {...link} /> : link.text}
                                        </li>
                                    ))}
                                </FooterColumn>
                            ))}
                        </div>
                    ))}
                </div>

                <div className={styles.copyright}>
                    <ul className={styles.links}>
                        {legal.map((link, index) => (
                            <li key={index}>{link.href ? <Link {...link} /> : <span>{link.text}</span>}</li>
                        ))}
                    </ul>
                    <div className={styles.copyrightText}>
                        <span>{copyright}</span>
                        <Link href={locationHref} text={location} className={styles.location} />
                    </div>
                </div>
            </div>
        </footer>
    );
}
