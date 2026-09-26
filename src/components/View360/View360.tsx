'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { useInView } from 'framer-motion';
import { FrameStack } from '@/components/FrameStack/FrameStack';
import { Loading } from '@/components/Loading/Loading';
import { usePreloaded } from '@/lib/usePreloaded';
import { useStrings } from '@/state/store';
import styles from './View360.module.css';

const wrap = (frame: number, total: number) => ((frame % total) + total) % total;

export function View360({ images }: { images: string[] }) {
    const container = useRef<HTMLDivElement>(null);
    const drag = useRef<{ frame: number; x: number } | null>(null);
    const inView = useInView(container, { margin: '200px', once: true });
    const loaded = usePreloaded(images, inView);
    const [frame, setFrame] = useState(0);
    const strings = useStrings();
    const total = images.length;

    const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
        drag.current = { frame, x: event.clientX };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
        if (!drag.current) {
            return;
        }

        const width = event.currentTarget.offsetWidth || 1;
        const delta = Math.round(((event.clientX - drag.current.x) / width) * total);
        setFrame(wrap(drag.current.frame - delta, total));
    };

    const onPointerUp = () => {
        drag.current = null;
    };

    return (
        <div ref={container} className={styles.container}>
            <div
                className={styles.stage}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
            >
                {loaded ? <FrameStack frames={images} active={frame} width={800} height={600} /> : <Loading />}
            </div>

            <input
                type="range"
                className={styles.slider}
                min={0}
                max={Math.max(total - 1, 0)}
                step={1}
                value={frame}
                disabled={!loaded}
                aria-label={strings.rotateView}
                autoComplete="off"
                suppressHydrationWarning
                onChange={(event) => setFrame(Number(event.target.value))}
            />
        </div>
    );
}
