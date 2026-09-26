import assert from 'node:assert/strict';
import test from 'node:test';
import { fill } from './strings.ts';

test('fill replaces each named placeholder and keeps unknown ones', () => {
    assert.equal(fill('Bild {n} anzeigen, {missing}', { n: 3 }), 'Bild 3 anzeigen, {missing}');
});
