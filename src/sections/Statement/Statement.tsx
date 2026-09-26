import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import styles from './Statement.module.css';

interface StatementProps {
    children?: ReactNode;
}

export function Statement({ children }: StatementProps) {
    return <article className={cx('contentContainer', styles.article)}>{children}</article>;
}
