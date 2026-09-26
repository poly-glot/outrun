import assert from 'node:assert/strict';
import test from 'node:test';
import { recommendModel } from './recommendation.ts';

test('anyone who would rather back than run is a Guardian', () => {
    assert.equal(recommendModel({ running: 'no' }), 'Guardian');
    assert.equal(recommendModel({ company: 'crew', give: 'money', running: 'love' }), 'Guardian');
    assert.equal(recommendModel({ time: 'minutes' }), 'Guardian');
});

test('anyone bringing others is a Coalition', () => {
    assert.equal(recommendModel({ company: 'crew', running: 'love' }), 'Coalition');
    assert.equal(recommendModel({ company: 'family' }), 'Coalition');
    assert.equal(recommendModel({ company: 'solo', proof: 'total', running: 'maybe' }), 'Coalition');
});

test('everyone else runs Solo', () => {
    assert.equal(recommendModel({}), 'Solo');
    assert.equal(recommendModel({ company: 'solo', give: 'sweat', proof: 'medal', running: 'love', time: 'weeks' }), 'Solo');
});
