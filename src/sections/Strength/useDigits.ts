import { useTransform, type MotionValue } from 'framer-motion';

export function useDigits(reveal: MotionValue<number>, value: number) {
    const length = String(value).length;

    return useTransform(reveal, (v) => Math.round(v * value).toString().padStart(length, '0'));
}
