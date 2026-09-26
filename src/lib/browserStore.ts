import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export function useBrowserValue<T>(read: () => T, serverValue: T): T {
    return useSyncExternalStore(subscribe, read, () => serverValue);
}
