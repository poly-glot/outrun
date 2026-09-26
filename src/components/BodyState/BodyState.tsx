'use client';

import { useEffect } from 'react';
import { followMotionPreference, motionPaused } from '@/lib/motion';
import { useSiteDispatch, useSiteState } from '@/state/store';

export function BodyState() {
    const { menuOpen, modal, motionPaused: paused } = useSiteState();
    const dispatch = useSiteDispatch();
    const locked = menuOpen || modal.type !== '';

    useEffect(() => followMotionPreference((next) => dispatch({ paused: next, type: 'setMotion' })), [dispatch]);

    useEffect(() => {
        document.body.toggleAttribute('data-locked', locked);
        document.body.toggleAttribute('data-menu-open', menuOpen);
    }, [locked, menuOpen]);

    useEffect(() => {
        document.body.toggleAttribute('data-motion-paused', paused);
        motionPaused.set(paused ? 1 : 0);
    }, [paused]);

    useEffect(() => {
        if (!menuOpen) {
            return;
        }

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                dispatch({ type: 'closeMenu' });
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return () => window.removeEventListener('keydown', onKeyDown);
    }, [menuOpen, dispatch]);

    return null;
}
