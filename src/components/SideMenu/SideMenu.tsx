'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { m, useMotionValueEvent, useTransform } from 'framer-motion';
import type { MenuItem } from '@/mdx/nodes';
import { cx } from '@/lib/cx';
import { activeSectionId, sectionProgress } from '@/state/sectionProgress';
import { useSiteDispatch, useSiteState, useStrings } from '@/state/store';
import styles from './SideMenu.module.css';

const radius = 38;
const circumference = 2 * Math.PI * radius;

function ProgressRing({ id }: { id: string }) {
    const dashOffset = useTransform(sectionProgress(id), (value) => circumference * (1 - value));

    return (
        <svg className={styles.ring} viewBox="0 0 100 100" aria-hidden="true">
            <circle className={styles.ringTrack} cx="50" cy="50" r={radius} />
            <m.circle
                className={styles.ringValue}
                cx="50"
                cy="50"
                r={radius}
                strokeDasharray={circumference}
                style={{ strokeDashoffset: dashOffset }}
            />
        </svg>
    );
}

export function SideMenu({ items }: { items: MenuItem[] }) {
    const { menuOpen } = useSiteState();
    const dispatch = useSiteDispatch();
    const strings = useStrings();
    const [activeId, setActiveId] = useState(items[0]?.id ?? '');
    const firstLinkRef = useRef<HTMLAnchorElement>(null);
    const restoreFocusOnClose = useRef(false);

    useMotionValueEvent(activeSectionId, 'change', setActiveId);

    useEffect(() => {
        if (menuOpen) {
            firstLinkRef.current?.focus();
            restoreFocusOnClose.current = true;
            return;
        }

        if (restoreFocusOnClose.current) {
            document.querySelector<HTMLElement>('[aria-controls="mainmenu"]')?.focus();
        }

        restoreFocusOnClose.current = false;
    }, [menuOpen]);

    const followLink = () => {
        restoreFocusOnClose.current = false;
        dispatch({ type: 'closeMenu' });
    };

    return (
        <>
            <nav id="mainmenu" className={cx(styles.container, menuOpen && styles.open)} aria-label={strings.sections}>
                <div className={styles.background} />
                <ul className={styles.items}>
                    {items.map((item, index) => (
                        <li
                            key={item.id}
                            className={cx(styles.item, item.id === activeId && styles.itemActive)}
                            style={{ '--i': index } as CSSProperties}
                        >
                            <a
                                ref={index === 0 ? firstLinkRef : undefined}
                                href={`#${item.id}`}
                                className={styles.link}
                                aria-current={item.id === activeId ? 'location' : undefined}
                                onClick={followLink}
                            >
                                <ProgressRing id={item.id} />
                                <span className={styles.itemText}>{item.text}</span>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
            <button
                type="button"
                className={styles.overlay}
                aria-hidden={!menuOpen}
                aria-label={strings.closeMenu}
                tabIndex={menuOpen ? 0 : -1}
                onClick={() => dispatch({ type: 'closeMenu' })}
            />
        </>
    );
}
