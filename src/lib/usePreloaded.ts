import { useEffect, useState } from 'react';

const preload = (src: string) =>
    new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;
    });

export function usePreloaded(images: string[], enabled: boolean) {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!enabled) {
            return;
        }

        let cancelled = false;
        Promise.all(images.map(preload)).then(() => {
            if (!cancelled) {
                setLoaded(true);
            }
        });

        return () => {
            cancelled = true;
        };
    }, [images, enabled]);

    return loaded;
}
