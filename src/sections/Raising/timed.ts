import type { MotionValue } from 'framer-motion';

export interface Timed {
    from: number;
    progress: MotionValue<number>;
    to: number;
}
