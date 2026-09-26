import { useTransform, type MotionValue } from 'framer-motion';
import { motionPaused } from './motion';

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export const useRange = (progress: MotionValue<number>, from: number, to: number) =>
    useTransform([progress, motionPaused], ([value, paused]: number[]) => (paused ? 1 : clamp((value - from) / (to - from))));
