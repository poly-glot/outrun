'use client';

import { useEffect, useRef } from 'react';
import { loadYouTubeApi, type YouTubePlayer as Player } from '@/lib/youtube';
import styles from './YouTubePlayer.module.css';

export function YouTubePlayer({ videoId }: { videoId: string }) {
    const mount = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const host = mount.current;

        if (!host) {
            return;
        }

        let cancelled = false;
        let player: Player | null = null;
        const target = document.createElement('div');
        host.append(target);

        loadYouTubeApi().then((YT) => {
            if (cancelled) {
                return;
            }

            player = new YT.Player(target, {
                height: '100%',
                host: 'https://www.youtube-nocookie.com',
                playerVars: { autoplay: 1, cc_lang_pref: document.documentElement.lang, cc_load_policy: 1, playsinline: 1, rel: 0 },
                videoId,
                width: '100%',
            });
        });

        return () => {
            cancelled = true;
            player?.destroy();
            target.remove();
        };
    }, [videoId]);

    return <div ref={mount} className={styles.player} />;
}
