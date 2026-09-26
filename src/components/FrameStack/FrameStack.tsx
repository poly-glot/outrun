import { cx } from '@/lib/cx';
import styles from './FrameStack.module.css';

interface FrameStackProps {
    active: number;
    className?: string;
    frames: string[];
    height: number;
    width: number;
}

export function FrameStack({ active, className, frames, height, width }: FrameStackProps) {
    return (
        <div className={cx(styles.stack, className)}>
            {frames.map((src, index) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    key={src}
                    src={src}
                    alt=""
                    width={width}
                    height={height}
                    draggable={false}
                    className={styles.frame}
                    style={{ visibility: index === active ? 'visible' : 'hidden' }}
                />
            ))}
        </div>
    );
}
