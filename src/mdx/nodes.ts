import { Children, isValidElement, type ComponentType, type ReactElement, type ReactNode } from 'react';

interface NodeProps {
    children?: ReactNode;
    href?: string;
    id?: string;
    menu?: string;
    title?: string;
}

type NodeType = ComponentType<never> | string;

export const elementsOf = (children: ReactNode): ReactElement<NodeProps>[] =>
    Children.toArray(children).filter((node): node is ReactElement<NodeProps> => isValidElement(node));

export function ofType<T = NodeProps>(children: ReactNode, type: ComponentType<T> | string): ReactElement<T>[] {
    return Children.toArray(children).filter((node): node is ReactElement<T> => isValidElement(node) && node.type === type);
}

export const notOfType = (children: ReactNode, ...types: NodeType[]): ReactNode[] =>
    Children.toArray(children).filter((node) => !isValidElement(node) || !types.includes(node.type as NodeType));

export function textOf(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') {
        return '';
    }

    if (typeof node === 'string' || typeof node === 'number') {
        return String(node);
    }

    if (Array.isArray(node)) {
        return node.map(textOf).join('');
    }

    if (isValidElement<NodeProps>(node)) {
        return node.type === 'br' ? '\n' : textOf(node.props.children);
    }

    return '';
}

export const linesOf = (node: ReactNode): string[] =>
    textOf(node).split('\n').map((line) => line.trim()).filter(Boolean);

export interface MenuItem {
    id: string;
    text: string;
}

export function collectSections(tree: ReactNode): MenuItem[] {
    const found: MenuItem[] = [];

    const walk = (node: ReactNode) => {
        if (Array.isArray(node)) {
            node.forEach(walk);

            return;
        }

        if (!isValidElement<NodeProps>(node)) {
            return;
        }

        const { children, id, menu } = node.props;

        if (typeof id === 'string' && typeof menu === 'string') {
            found.push({ id, text: menu });
        }

        walk(children);
    };

    walk(tree);

    return found;
}
