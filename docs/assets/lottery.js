/** Uniform integers: discard the remainder of the uint32 range to avoid modulo bias. */
export function randomInt(max, source = globalThis.crypto) {
  if (!Number.isSafeInteger(max) || max < 1 || max > 0x100000000) throw new RangeError('잘못된 난수 범위');
  if (!source?.getRandomValues) throw new Error('이 브라우저에서는 안전한 번호 생성을 지원하지 않습니다. 최신 브라우저를 이용해 주세요.');
  const limit = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  do { source.getRandomValues(buffer); } while (buffer[0] >= limit);
  return buffer[0] % max;
}

export function generateLotto(source = globalThis.crypto) {
  const pool = Array.from({length: 45}, (_, i) => i + 1);
  // Partial Fisher–Yates: every six-number subset has the same probability.
  for (let i = 0; i < 6; i++) {
    const j = i + randomInt(45 - i, source);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return {type: 'lotto', numbers: pool.slice(0, 6).sort((a, b) => a - b)};
}

export function generatePension(source = globalThis.crypto) {
  const group = randomInt(5, source) + 1;
  const digits = Array.from({length: 6}, () => String(randomInt(10, source))).join('');
  return {type: 'pension', group, digits};
}

export function generateGames(type, count, source = globalThis.crypto) {
  if (!['lotto', 'pension'].includes(type) || ![1, 5, 10].includes(count)) throw new RangeError('잘못된 게임 설정');
  return Array.from({length: count}, () => type === 'lotto' ? generateLotto(source) : generatePension(source));
}

export function isValidGame(game) {
  if (!game || typeof game !== 'object') return false;
  if (game.type === 'pension') return Number.isInteger(game.group) && game.group >= 1 && game.group <= 5 && typeof game.digits === 'string' && /^[0-9]{6}$/.test(game.digits);
  return game.type === 'lotto' && Array.isArray(game.numbers) && game.numbers.length === 6 &&
    game.numbers.every((n, i, arr) => Number.isInteger(n) && n >= 1 && n <= 45 && (i === 0 || n > arr[i - 1]));
}

export function gameKey(game) {
  return game.type === 'lotto' ? `lotto:${game.numbers.join('-')}` : `pension:${game.group}:${game.digits}`;
}

export function formatGame(game) {
  return game.type === 'lotto' ? game.numbers.join(', ') : `${game.group}조 ${game.digits}`;
}
