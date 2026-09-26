'use client';

import Image from 'next/image';
import { m } from 'framer-motion';
import { Flip } from '@/components/Flip/Flip';
import { useSiteState } from '@/state/store';
import styles from './QuickFactRow.module.css';

interface QuickFactRowProps {
    icon: string;
    label: string;
    value: string;
}

export function QuickFactRow({ icon, label, value }: QuickFactRowProps) {
    const { motionPaused } = useSiteState();

    return (
        <m.div
            className={styles.item}
            variants={{ hidden: { opacity: 0.1, y: '100%' }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: motionPaused ? 0 : 0.5, ease: [0.165, 0.84, 0.44, 1] }}
        >
            <div className={styles.inner}>
                <div className={styles.icon}>
                    <Image src={icon} alt="" width={40} height={40} className={styles.iconImage} />
                </div>
                <div className={styles.label}>{label}</div>
                <div className={styles.value}>
                    <Flip id={value}><span>{value}</span></Flip>
                </div>
            </div>
        </m.div>
    );
}
