import {isValidGame, gameKey} from './lottery.js';
export const STORAGE_KEY = 'lottery-number-generator:v1';

export function readSaved(storage = globalThis.localStorage) {
  const raw = storage.getItem(STORAGE_KEY);
  if (raw === null) return [];
  const parsed = JSON.parse(raw);
  if (parsed?.version !== 1 || !Array.isArray(parsed.entries)) throw new Error('저장 데이터를 읽을 수 없습니다.');
  const seen = new Set();
  return parsed.entries.filter(entry => {
    if (!isValidGame(entry) || typeof entry.createdAt !== 'string' || !Number.isFinite(Date.parse(entry.createdAt))) return false;
    const key = gameKey(entry);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function writeSaved(entries, storage) {
  storage.setItem(STORAGE_KEY, JSON.stringify({version: 1, entries}));
  return entries;
}

export function saveGame(game, storage = globalThis.localStorage, now = new Date()) {
  if (!isValidGame(game)) throw new Error('유효하지 않은 번호입니다.');
  const entries = readSaved(storage);
  if (entries.some(entry => gameKey(entry) === gameKey(game))) return {entries, added: false};
  const clean = game.type === 'lotto' ? {type: 'lotto', numbers: [...game.numbers]} : {type: 'pension', group: game.group, digits: game.digits};
  const next = [{...clean, createdAt: now.toISOString()}, ...entries];
  return {entries: writeSaved(next, storage), added: true};
}

export function removeGame(key, storage = globalThis.localStorage) {
  return writeSaved(readSaved(storage).filter(entry => gameKey(entry) !== key), storage);
}

export function clearGames(type, storage = globalThis.localStorage) {
  if (!['lotto', 'pension'].includes(type)) throw new Error('잘못된 보관함입니다.');
  return writeSaved(readSaved(storage).filter(entry => entry.type !== type), storage);
}
