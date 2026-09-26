import { motionValue, type MotionValue } from 'framer-motion';

const registry = new Map<string, MotionValue<number>>();

export const activeSectionId = motionValue('');

export function sectionProgress(id: string): MotionValue<number> {
    const existing = registry.get(id);

    if (existing) {
        return existing;
    }

    const created = motionValue(0);
    registry.set(id, created);

    return created;
}
