import { useTransform, type MotionValue } from 'framer-motion';
import { useRange } from './useRange';

export function useScrub(progress: MotionValue<number>, from: number, to: number, fromY: string) {
    const opacity = useRange(progress, from, to);
    const y = useTransform(opacity, [0, 1], [fromY, '0%']);

    return { opacity, y };
}
