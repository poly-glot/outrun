'use client';

import { useEffect, useRef } from 'react';
import { useMotionValueEvent, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { motionPaused } from '@/lib/motion';
import styles from './Clip.module.css';

const FRAME = 1 / 30;

interface ClipProps {
    poster: string;
    progress: MotionValue<number>;
    src: string;
}

export function Clip({ poster, progress, src }: ClipProps) {
    const ref = useRef<HTMLVideoElement>(null);
    const pending = useRef<number | null>(null);
    const shown = useRef(-1);
    const target = useTransform(progress, [0.24, 0.74], [0, 1], { clamp: true });
    const position = useSpring(target, { damping: 30, mass: 1, restDelta: 0.0005, stiffness: 120 });

    useEffect(() => {
        const video = ref.current;

        if (!video) {
            return;
        }

        const flush = () => {
            if (pending.current === null) {
                return;
            }

            shown.current = pending.current;
            video.currentTime = pending.current;
            pending.current = null;
        };

        video.addEventListener('seeked', flush);

        return () => video.removeEventListener('seeked', flush);
    }, []);

    useMotionValueEvent(position, 'change', (value) => {
        const video = ref.current;

        if (!video?.duration || motionPaused.get()) {
            return;
        }

        const time = Math.round((value * video.duration) / FRAME) * FRAME;

        if (Math.abs(time - (pending.current ?? shown.current)) < FRAME / 2) {
            return;
        }

        if (video.seeking) {
            pending.current = time;

            return;
        }

        shown.current = time;
        video.currentTime = time;
    });

    return <video ref={ref} className={styles.clip} poster={poster} src={src} muted playsInline preload="auto" aria-hidden="true" />;
}
