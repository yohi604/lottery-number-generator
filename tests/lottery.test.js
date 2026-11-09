import test from 'node:test';
import assert from 'node:assert/strict';
import {randomInt, generateLotto, generatePension, generateGames, isValidGame, formatGame} from '../docs/assets/lottery.js';
import {saveGame, readSaved, removeGame, clearGames, STORAGE_KEY} from '../docs/assets/storage.js';

const sequence = values => ({getRandomValues(array) { assert.ok(values.length, 'No deterministic samples left'); array[0] = values.shift(); return array; }});
class MemoryStorage {
  data = new Map();
  getItem(key) { return this.data.has(key) ? this.data.get(key) : null; }
  setItem(key, value) { this.data.set(key, value); }
}
const lotto = {type: 'lotto', numbers: [1, 2, 3, 4, 5, 45]};
const pension = {type: 'pension', group: 3, digits: '012345'};

test('10,000 Lotto games have six unique sorted numbers in 1–45', () => {
  for (let i = 0; i < 10000; i++) {
    const game = generateLotto();
    assert.equal(isValidGame(game), true);
    assert.equal(new Set(game.numbers).size, 6);
  }
});
test('10,000 pension games have a group 1–5 and exactly six digits', () => {
  for (let i = 0; i < 10000; i++) assert.equal(isValidGame(generatePension()), true);
});
test('Rejection sampling discards the biased uint32 remainder', () => {
  assert.equal(randomInt(10, sequence([0xffffffff, 4294967290, 19])), 9);
  assert.equal(randomInt(1, sequence([0xffffffff])), 0);
});
test('Pension group and six digits use separate random samples; leading zero retained', () => {
  assert.deepEqual(generatePension(sequence([2, 0, 1, 2, 3, 4, 5])), pension);
  assert.equal(formatGame(pension), '3조 012345');
  assert.deepEqual(generatePension(sequence([0, 0, 0, 0, 0, 0, 0])), {type: 'pension', group: 1, digits: '000000'});
  assert.deepEqual(generatePension(sequence([4, 9, 9, 9, 9, 9, 9])), {type: 'pension', group: 5, digits: '999999'});
});
test('Only 1, 5 or 10 games accepted; separate games may repeat', () => {
  for (const type of ['lotto', 'pension']) for (const count of [1, 5, 10]) assert.equal(generateGames(type, count).length, count);
  const source = {getRandomValues(array) { array[0] = 0; return array; }};
  const games = generateGames('lotto', 5, source);
  assert.deepEqual(games[0], games[1]);
  assert.throws(() => generateGames('other', 1));
  assert.throws(() => generateGames('lotto', 0));
  assert.throws(() => randomInt(46, {}));
});
test('Store saves dates, deduplicates, persists when re-read, and preserves leading zero', () => {
  const storage = new MemoryStorage();
  assert.equal(saveGame(lotto, storage, new Date('2026-11-09T05:00:00Z')).added, true);
  assert.equal(saveGame(lotto, storage).added, false);
  saveGame(pension, storage);
  const reloaded = readSaved(storage);
  assert.equal(reloaded.length, 2);
  assert.equal(reloaded[0].digits, '012345');
  assert.equal(reloaded[1].createdAt, '2026-11-09T05:00:00.000Z');
  assert.deepEqual(removeGame('lotto:1-2-3-4-5-45', storage).map(g => g.type), ['pension']);
});
test('Clearing one type leaves the other type and unrelated localStorage keys intact', () => {
  const storage = new MemoryStorage();
  storage.setItem('unrelated-project', 'keep me');
  saveGame(lotto, storage); saveGame(pension, storage);
  assert.deepEqual(clearGames('lotto', storage).map(g => g.type), ['pension']);
  assert.equal(storage.getItem('unrelated-project'), 'keep me');
  assert.equal(clearGames('pension', storage).length, 0);
});
test('Storage failures throw; no successful result is returned or invalid data overwritten', () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, '{broken');
  assert.throws(() => readSaved(storage));
  assert.throws(() => saveGame(lotto, storage));
  assert.equal(storage.getItem(STORAGE_KEY), '{broken');
  assert.throws(() => saveGame(lotto, {getItem() { return null; }, setItem() { throw new Error('Quota exceeded'); }}));
  assert.throws(() => readSaved({getItem() { throw new Error('Access denied'); }}));
});
test('Malformed saved records and injected fields do not become valid displayed games', () => {
  const storage = new MemoryStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify({version: 1, entries: [
    {...lotto, createdAt: 'invalid'}, {...pension, digits: '<img/>', createdAt: '2026-11-09'},
    {...lotto, numbers: [1,1,2,3,4,5], createdAt: '2026-11-09'}, {...pension, createdAt: '2026-11-09'}
  ]}));
  assert.equal(readSaved(storage).length, 1);
  assert.throws(() => saveGame({type: 'pension', group: 6, digits: '012345'}, storage));
});
test('Sequential actions re-read storage, preserving changes made in another tab', () => {
  const storage = new MemoryStorage();
  readSaved(storage);
  saveGame(pension, storage);
  saveGame(lotto, storage);
  assert.equal(readSaved(storage).length, 2);
});
