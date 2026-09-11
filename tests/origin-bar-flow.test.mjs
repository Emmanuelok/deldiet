import test from 'node:test';
import assert from 'node:assert/strict';
import { canVisitOriginBarStep, getDrinkDefaults } from '../lib/origin-bar-flow.mjs';

const extractions = { espresso: ['Espresso machine'], filter: ['Pour-over'], cold: ['Cold steep'], blended: ['Blender'] };
const previous = { size: 'harvest', milk: 'Organic whole', milkTouched: false, extraShots: 3, safetyAck: true };

test('guests can return directly to review after editing a valid earlier choice', () => {
  const selection = { origin: { n: 'Colombia' }, drink: { n: 'Flat White' } };
  for (const step of [6, 1, 3, 2, 6]) assert.equal(canVisitOriginBarStep(step, selection), true);
  assert.equal(canVisitOriginBarStep(6, selection, true), false);
});

test('step navigation cannot bypass the required origin and drink selections', () => {
  assert.equal(canVisitOriginBarStep(1, {}), true);
  assert.equal(canVisitOriginBarStep(2, {}), false);
  assert.equal(canVisitOriginBarStep(2, { origin: {} }), true);
  assert.equal(canVisitOriginBarStep(6, { origin: {} }), false);
  for (const step of [-1, 7, 1.5, NaN]) assert.equal(canVisitOriginBarStep(step, {}), false);
});

test('black Taste Match recipes start without milk and cold recipes start iced', () => {
  for (const drink of [{ n:'Americano', fam:'espresso' }, { n:'Pour-Over / Drip', fam:'filter' }, { n:'Cold Brew', fam:'cold' }]) {
    const next = getDrinkDefaults(drink, previous, extractions);
    assert.equal(next.milk, 'None — black');
    assert.equal(next.temp, drink.fam === 'cold' ? 'Iced' : 'Hot');
    assert.equal(next.extraShots, 0);
    assert.equal(next.safetyAck, false);
  }
});

test('changing a drink respects chosen milk and compact drink compatibility', () => {
  const latte = getDrinkDefaults({n:'Flat White',fam:'espresso',milk:true}, {...previous,milkTouched:true,milk:'Oat (barista)'}, extractions);
  assert.equal(latte.milk, 'Oat (barista)');
  assert.equal(latte.size, 'harvest');
  const espresso = getDrinkDefaults({n:'Espresso',fam:'espresso'}, previous, extractions);
  assert.equal(espresso.size, 'seed');
  assert.equal(espresso.extraction, 'Espresso machine');
  assert.equal(previous.extraShots, 3, 'the previous recipe is not mutated');
});
