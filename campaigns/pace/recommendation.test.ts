import assert from 'node:assert/strict';
import test from 'node:test';
import { recommendModel } from './recommendation.ts';

test('anyone who would rather back than run is a Patron', () => {
    assert.equal(recommendModel({ saturday: 'cheer' }), 'Patron');
    assert.equal(recommendModel({ saturday: 'busy' }), 'Patron');
    assert.equal(recommendModel({ crew: 'us', give: 'wallet', saturday: 'free' }), 'Patron');
});

test('anyone bringing others is a Pack', () => {
    assert.equal(recommendModel({ crew: 'us', saturday: 'free' }), 'Pack');
    assert.equal(recommendModel({ crew: 'us', give: 'legs' }), 'Pack');
});

test('everyone else runs Stride', () => {
    assert.equal(recommendModel({}), 'Stride');
    assert.equal(recommendModel({ crew: 'me', give: 'both', saturday: 'free' }), 'Stride');
});
