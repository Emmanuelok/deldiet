import test from 'node:test';
import assert from 'node:assert/strict';
import { readLocal, writeLocal, mergePassport, passportData, validCartItems, canonicalBrewer } from '../lib/local-state.ts';
import { normalizeServiceRequest } from '../lib/service-requests.ts';

const values = new Map();
globalThis.window = { localStorage: { getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) }, dispatchEvent: () => true };

test('Passport updates preserve favourites, saved recipes, and unrelated preferences', () => {
  values.clear();
  writeLocal('deldiet-passport-v1', { savedProducts: ['house-01'], brewprints: [{ id: 'recipe-1' }], brewer: 'Pour-over' });
  assert.equal(mergePassport({ taste: { note: 'Chocolate & nuts' } }), true);
  assert.deepEqual(passportData().savedProducts, ['house-01']);
  assert.deepEqual(passportData().brewprints, [{ id: 'recipe-1' }]);
  assert.equal(passportData().brewer, 'Pour-over');
});
test('malformed local data and invalid cart values cannot reach checkout calculations', () => {
  values.set('corrupt', '{');
  assert.deepEqual(readLocal('corrupt', []), []);
  const valid = { id: 'house', name: 'House coffee', detail: '340 g', price: 24, quantity: 2 };
  const items = validCartItems([valid, { ...valid, price: null }, { ...valid, quantity: 1.2 }, { ...valid, quantity: 100 }, { ...valid, channel: 'admin' }, null]);
  assert.equal(items.length, 1);
  assert.equal(items[0].channel, 'shop');
  assert.deepEqual(validCartItems({ items: [] }), []);
});
test('actual Machine Match names resolve to recognized Passport brewers', () => {
  assert.equal(canonicalBrewer('Keurig brewer'), 'Single-serve brewer');
  assert.equal(canonicalBrewer('Pour-over setup'), 'Pour-over');
  assert.equal(canonicalBrewer('Nespresso Original'), 'Capsule machine');
});
test('reservation validation rejects impossible and past calendar dates', () => {
  const base = { type: 'reservation', source: 'reservation-test', idempotencyKey: 'reservation-test-1234567890', customer: { name: 'Guest', email: 'guest@example.com' }, payload: { visitType: 'Table reservation', party: '2 people', preferredTime: 'Morning' } };
  for (const preferredDate of ['2028-02-30', '2026-13-02', '2020-01-01', 'tomorrow']) assert.equal(normalizeServiceRequest({ ...base, payload: { ...base.payload, preferredDate } }).ok, false);
  const preferredDate = new Date(Date.now() + 86400000 * 5).toISOString().slice(0,10);
  assert.equal(normalizeServiceRequest({ ...base, payload: { ...base.payload, preferredDate } }).ok, true);
});
test('storage failures are recoverable without crashing the product', () => {
  const previous = window.localStorage;
  window.localStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('quota'); } };
  assert.deepEqual(readLocal('anything', {}), {});
  assert.equal(mergePassport({ brewer: 'Pour-over' }), false);
  window.localStorage = previous;
});
