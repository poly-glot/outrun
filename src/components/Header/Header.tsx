'use client';

import type { ComponentType } from 'react';
import { useSiteDispatch, useSiteState, useStrings } from '@/state/store';
import { cx } from '@/lib/cx';
import { storeMotionPreference } from '@/lib/motion';
import styles from './Header.module.css';

export type HeaderLogo =
    | { Component: ComponentType<{ className?: string }>; kind: 'component' }
    | { kind: 'image'; src: string }
    | { kind: 'svg'; markup: string };

interface LocaleLink {
    code: string;
    href: string;
}

interface HeaderProps {
    brand: string;
    hasContact: boolean;
    homeHref: string;
    locale: string;
    locales: LocaleLink[];
    logo: HeaderLogo;
}

type HeaderBarProps =
    | ({ inverse?: false } & HeaderProps)
    | ({ inverse: true } & Pick<HeaderProps, 'brand' | 'homeHref' | 'locale' | 'logo'>);

function LocaleSwitcher({ locale, locales }: Pick<HeaderProps, 'locale' | 'locales'>) {
    const strings = useStrings();

    if (locales.length < 2) {
        return null;
    }

    return (
        <nav className={styles.locales} aria-label={strings.language}>
            {locales.map((link) => (
                <a
                    key={link.code}
                    href={link.href}
                    hrefLang={link.code}
                    lang={link.code}
                    aria-current={link.code === locale ? 'page' : undefined}
                    className={cx(styles.locale, link.code === locale && styles.localeCurrent)}
                >
                    {link.code.toUpperCase()}
                </a>
            ))}
        </nav>
    );
}

function Logo({ logo }: { logo: HeaderLogo }) {
    if (logo.kind === 'component') {
        return <logo.Component className={styles.logoSvg} />;
    }

    if (logo.kind === 'image') {
        return <img alt="" className={styles.logoSvg} src={logo.src} />;
    }

    return <span className={styles.logoSvg} dangerouslySetInnerHTML={{ __html: logo.markup }} />;
}

export function HeaderBar(props: HeaderBarProps) {
    const { inverse } = props;
    const { menuOpen, motionPaused } = useSiteState();
    const dispatch = useSiteDispatch();
    const strings = useStrings();
    const burgerActive = inverse || menuOpen;
    const motionText = motionPaused ? strings.motionPlay : strings.motionStop;

    const toggleMotion = () => {
        storeMotionPreference(!motionPaused);
        dispatch({ paused: !motionPaused, type: 'setMotion' });
    };

    return (
        <div className={cx(styles.bar, inverse && styles.barInverse)}>
            <div className={styles.panelLeft}>
                <button
                    type="button"
                    className={styles.burger}
                    aria-controls={inverse ? undefined : 'mainmenu'}
                    aria-expanded={inverse ? undefined : menuOpen}
                    aria-label={inverse ? strings.close : strings.menu}
                    onClick={() => dispatch({ type: inverse ? 'closeModal' : 'toggleMenu' })}
                >
                    <span className={cx(styles.burgerBox, burgerActive && styles.burgerActive)}>
                        <span className={styles.burgerInner} />
                    </span>
                    {inverse ? null : <span className={styles.burgerText}>{strings.menu}</span>}
                </button>
            </div>

            <div className={styles.panelCenter}>
                <a href={props.homeHref} className={styles.logo} aria-label={props.brand}>
                    <Logo logo={props.logo} />
                </a>
            </div>

            <div className={styles.panelRight}>
                <button type="button" className={styles.motion} aria-label={motionText} onClick={toggleMotion}>
                    <svg className={styles.motionIcon} viewBox="0 0 16 16" aria-hidden="true">
                        {motionPaused ? <path fill="currentColor" d="M4 2l10 6-10 6z" /> : <path fill="currentColor" d="M3 2h4v12H3zm6 0h4v12H9z" />}
                    </svg>
                    <span className={styles.motionText}>{motionText}</span>
                </button>
                {props.inverse ? null : <LocaleSwitcher locale={props.locale} locales={props.locales} />}
                {inverse || props.hasContact ? (
                    <button
                        type="button"
                        className={cx('btn', 'btn-primary', styles.contact, inverse && styles.contactInverse)}
                        aria-haspopup={inverse ? undefined : 'dialog'}
                        onClick={() => dispatch({ type: inverse ? 'closeModal' : 'openContact' })}
                    >
                        <span>{inverse ? strings.close : strings.contact}</span>
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export function Header(props: HeaderProps) {
    return (
        <header className={styles.container}>
            <HeaderBar {...props} />
        </header>
    );
}
