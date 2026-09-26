import assert from 'node:assert/strict';
import test from 'node:test';
import { followMotionPreference, storeMotionPreference } from './motion.ts';

function browser(reduced: boolean, stored: string | null) {
    const storage = new Map<string, string>();
    const listeners = new Set<() => void>();
    const media = {
        addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
        matches: reduced,
        removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    };

    if (stored !== null) {
        storage.set('motion', stored);
    }

    Object.assign(globalThis, {
        localStorage: {
            getItem: (name: string) => storage.get(name) ?? null,
            removeItem: (name: string) => storage.delete(name),
            setItem: (name: string, value: string) => storage.set(name, value),
        },
        matchMedia: () => media,
    });

    return {
        stored: () => storage.get('motion') ?? null,
        switchSystem: (next: boolean) => {
            media.matches = next;
            listeners.forEach((listener) => listener());
        },
    };
}

function follow(): boolean[] {
    const seen: boolean[] = [];

    followMotionPreference((paused) => seen.push(paused));

    return seen;
}

test('follows the OS setting, live, when nothing is stored', () => {
    const { switchSystem } = browser(true, null);
    const seen = follow();

    assert.equal(seen.at(-1), true);
    switchSystem(false);
    assert.equal(seen.at(-1), false);
});

test('a header choice made under the current OS setting wins', () => {
    browser(false, 'paused/false');
    assert.equal(follow().at(-1), true);

    browser(true, 'playing/true');
    assert.equal(follow().at(-1), false);
});

test('a header choice expires once the OS setting differs from the one it was made under', () => {
    const earlier = browser(true, 'playing/false');

    assert.equal(follow().at(-1), true);
    assert.equal(earlier.stored(), null);

    const legacy = browser(false, 'paused');

    assert.equal(follow().at(-1), false);
    assert.equal(legacy.stored(), null);

    const { stored, switchSystem } = browser(false, 'paused/false');
    const seen = follow();

    switchSystem(true);
    assert.equal(seen.at(-1), true);
    switchSystem(false);
    assert.equal(seen.at(-1), false);
    assert.equal(stored(), null);
});

test('storing a choice records the OS setting it was made under', () => {
    const { stored } = browser(true, null);

    storeMotionPreference(false);
    assert.equal(stored(), 'playing/true');
});
