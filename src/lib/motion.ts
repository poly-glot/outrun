import { motionValue } from 'framer-motion';

const key = 'motion';
const query = '(prefers-reduced-motion: reduce)';

export const motionPaused = motionValue(0);

function resolve(reduced: boolean): boolean {
    try {
        const stored = localStorage.getItem(key);
        const [choice, system] = stored?.split('/') ?? [];
        const current = system === String(reduced);

        if (stored && !current) {
            localStorage.removeItem(key);
        }

        return current ? choice === 'paused' : reduced;
    } catch {
        return reduced;
    }
}

export function followMotionPreference(onChange: (paused: boolean) => void): () => void {
    const media = matchMedia(query);
    const apply = () => onChange(resolve(media.matches));

    apply();
    media.addEventListener('change', apply);

    return () => media.removeEventListener('change', apply);
}

export function storeMotionPreference(paused: boolean) {
    try {
        localStorage.setItem(key, `${paused ? 'paused' : 'playing'}/${matchMedia(query).matches}`);
    } catch {
        return;
    }
}
