import type { ReactNode } from 'react';
import { ExternalLink } from '@/components/ExternalLink/ExternalLink';
import { elementsOf, notOfType, ofType, textOf } from '@/mdx/nodes';
import styles from './Events.module.css';

interface CountryProps {
    children: ReactNode;
    name: string;
}

export function Country({ children }: CountryProps) {
    return children;
}

interface Event {
    city: string;
    date: string;
    href: string;
}

function eventsOf(list: ReactNode): Event[] {
    return ofType(list, 'ul').flatMap((ul) =>
        ofType(ul.props.children, 'li').map((item) => {
            const link = ofType(item.props.children, 'a')[0];

            return {
                city: textOf(link),
                date: textOf(notOfType(item.props.children, 'a')).trim(),
                href: link?.props.href ?? '',
            };
        }),
    );
}

interface EventsProps {
    children: ReactNode;
    eventsHeading: string;
    title: string;
}

export function Events({ children, eventsHeading, title }: EventsProps) {
    const groups = ofType<CountryProps>(children, Country).map((country) => ({
        events: eventsOf(elementsOf(country.props.children)),
        name: country.props.name,
    }));

    return (
        <div className={styles.container}>
            <div className={styles.inner}>
                <div className={styles.content}>
                    <h1 className={styles.title}>{title}</h1>
                    {notOfType(children, Country)}
                </div>

                <div className={styles.listContainer}>
                    <h2 className={styles.eventsTitle}>{eventsHeading}</h2>
                    {groups.map((group, index) => (
                        <div key={index} className={styles.list}>
                            <h3>{group.name}</h3>
                            <div className={styles.columns}>
                                {group.events.map((event, eventIndex) => (
                                    <ExternalLink key={eventIndex} className={styles.link} href={event.href}>
                                        <span className={styles.label}>{event.city}</span>
                                        <span className={styles.date}>{event.date}</span>
                                    </ExternalLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <hr className={styles.hr} aria-hidden="true" />
        </div>
    );
}
