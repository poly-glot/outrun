import { BackgroundImage, type Background } from '@/components/BackgroundImage/BackgroundImage';
import styles from './FixedBackground.module.css';

export function Shadow({ name }: { name: string }) {
    return (
        <svg className={styles.shadow} preserveAspectRatio="xMinYMin meet" viewBox="0 0 1019 670" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
                <linearGradient id={`${name}-shadow-gradient`} x1="50%" x2="88.6%" y1="48.7%" y2="48.7%">
                    <stop offset="0%" stopColor="#000" stopOpacity="0.52" />
                    <stop offset="100%" stopColor="#000" stopOpacity="0.1" />
                </linearGradient>
                <filter id={`${name}-shadow-blur`} filterUnits="objectBoundingBox" height="136.5%" width="131.1%" x="-15.5%" y="-18.3%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="50" />
                </filter>
            </defs>
            <rect fill={`url(#${name}-shadow-gradient)`} filter={`url(#${name}-shadow-blur)`} height="821" width="966" x="-48" y="-28" />
        </svg>
    );
}

export function FixedBackground({ background }: { background: Background }) {
    return (
        <div className={styles.container} aria-hidden="true">
            <BackgroundImage background={background} />
            <Shadow name="site" />
        </div>
    );
}
