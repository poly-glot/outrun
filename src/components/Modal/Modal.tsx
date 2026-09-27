'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { fill } from '@/lib/strings';
import { useSiteDispatch, useSiteState, useStrings } from '@/state/store';
import { HeaderBar, type HeaderLogo } from '@/components/Header/Header';
import { YouTubePlayer } from '@/components/YouTubePlayer/YouTubePlayer';
import styles from './Modal.module.css';

const fade = {
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    initial: { opacity: 0 },
};

interface ModalProps {
    brand: string;
    contact: ReactNode;
    homeHref: string;
    locale: string;
    logo: HeaderLogo;
}

export function Modal({ brand, contact, homeHref, locale, logo }: ModalProps) {
    const { modal, motionPaused } = useSiteState();
    const dispatch = useSiteDispatch();
    const strings = useStrings();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const open = modal.type !== '';
    const videoTitle = modal.type === 'youtube' ? fill(strings.playVideo, { title: modal.title }) : '';

    useEffect(() => {
        const dialog = dialogRef.current;

        if (open && !dialog?.open) {
            dialog?.showModal();
        }

        if (!open && dialog?.open) {
            dialog.close();
        }
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            id="mainmodal"
            className={styles.modal}
            aria-label={videoTitle || strings.contact}
            onClose={() => dispatch({ type: 'closeModal' })}
        >
            <HeaderBar inverse brand={brand} homeHref={homeHref} locale={locale} logo={logo} />
            <div className={styles.scroller}>
                <AnimatePresence>
                    {modal.type === 'contact' && contact ? (
                        <m.div key="contact" {...fade} transition={{ duration: motionPaused ? 0 : 0.3 }}>
                            {contact}
                        </m.div>
                    ) : null}
                    {modal.type === 'youtube' ? (
                        <m.div key="video" className={styles.video} {...fade} transition={{ duration: motionPaused ? 0 : 0.3 }}>
                            <div className={styles.videoFrame}>
                                <YouTubePlayer locale={locale} title={videoTitle} videoId={modal.videoId} />
                            </div>
                        </m.div>
                    ) : null}
                </AnimatePresence>
            </div>
        </dialog>
    );
}
