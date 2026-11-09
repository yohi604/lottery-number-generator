import {generateGames, gameKey, formatGame} from './lottery.js';
import {readSaved, saveGame, removeGame, clearGames, STORAGE_KEY} from './storage.js';

const $ = selector => document.querySelector(selector);
const labels = {lotto: '로또', pension: '연금복권'};
const generated = {lotto: [], pension: []};
let saved = [];
let activeTab = 'lotto';
let deletingType = null;
let toastTimer;
const dateFormat = new Intl.DateTimeFormat('ko-KR', {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'});

function announce(message) {
  const toast = $('#toast');
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 3500);
}

function storageError() {
  const warning = $('#storage-warning');
  warning.textContent = '보관함을 읽거나 변경하지 못했어요. 브라우저의 저장 차단 설정·저장 공간·기존 데이터를 확인해 주세요. 변경은 저장되지 않았으며, 생성한 번호는 복사해서 별도로 보관할 수 있습니다.';
  warning.hidden = false;
  announce('저장하지 못했어요. 번호를 복사해 별도로 보관해 주세요.');
}

function numberMarkup(game) {
  if (game.type === 'lotto') return game.numbers.map(n => `<span class="ball ball-${Math.ceil(n / 10)}">${n}</span>`).join('');
  return `<span class="group-number">${game.group}<small>조</small></span>` + [...game.digits].map(n => `<span class="digit">${n}</span>`).join('');
}

function rowMarkup(game, index, stored = false) {
  const key = gameKey(game);
  const letter = String.fromCharCode(65 + index);
  const name = `${labels[game.type]} ${stored ? formatGame(game) : letter + '게임'}`;
  return `<div class="game-row" data-key="${key}"><div class="game-row-main"><span class="game-label" aria-hidden="true">${stored ? '★' : letter}</span><div class="number-display" role="img" aria-label="${formatGame(game)}">${numberMarkup(game)}</div></div><div class="row-bottom">${stored ? `<time class="saved-date" datetime="${new Date(game.createdAt).toISOString()}">${dateFormat.format(new Date(game.createdAt))} 저장</time>` : ''}<button class="row-button" data-action="copy" data-type="${game.type}" data-index="${index}" data-stored="${stored}" aria-label="${name} 복사"><span aria-hidden="true">⧉</span> 복사</button>${stored ? `<button class="row-button danger" data-action="delete" data-key="${key}" aria-label="${name} 삭제">삭제</button>` : `<button class="row-button" data-action="save" data-type="${game.type}" data-index="${index}" aria-pressed="false" aria-label="${name} 저장"><span aria-hidden="true">♡</span> 저장</button>`}</div></div>`;
}

function updateSavedButtons() {
  document.querySelectorAll('[data-action="save"]').forEach(button => {
    const game = generated[button.dataset.type][Number(button.dataset.index)];
    const exists = saved.some(entry => gameKey(entry) === gameKey(game));
    button.setAttribute('aria-pressed', String(exists));
    button.innerHTML = exists ? '<span aria-hidden="true">✓</span> 저장됨' : '<span aria-hidden="true">♡</span> 저장';
  });
}

function renderSaved() {
  for (const type of ['lotto', 'pension']) $(`#${type}-count`).textContent = saved.filter(entry => entry.type === type).length;
  $('#saved-total').textContent = $('#nav-count').textContent = saved.length;
  const entries = saved.filter(entry => entry.type === activeTab);
  $('#clear-saved').disabled = entries.length === 0;
  $('#clear-saved').textContent = `${labels[activeTab]} 전체 삭제`;
  $('#saved-panel').setAttribute('aria-labelledby', `tab-${activeTab}`);
  $('#saved-panel').innerHTML = entries.length ? `<div class="saved-list">${entries.map((entry, i) => rowMarkup(entry, i, true)).join('')}</div>` : '<div class="saved-empty"><span class="empty-bookmark" aria-hidden="true">♡</span><strong>아직 보관한 번호가 없어요</strong><p>마음에 드는 번호를 저장하면 여기에 모아둘게요.</p></div>';
  updateSavedButtons();
}

function refreshSaved() {
  try { saved = readSaved(); $('#storage-warning').hidden = true; renderSaved(); }
  catch { storageError(); }
}

async function copyText(value) {
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(value);
    announce('번호를 복사했어요.');
  } catch {
    const field = $('#manual-copy');
    field.value = value;
    $('#copy-dialog').showModal();
    field.focus();
    field.select();
  }
}

document.querySelectorAll('[data-generate]').forEach(button => button.addEventListener('click', () => {
  const type = button.dataset.generate;
  const count = Number($(`input[name="${type}-count"]:checked`).value);
  try {
    generated[type] = generateGames(type, count);
    $(`#${type}-results`).innerHTML = generated[type].map((game, i) => rowMarkup(game, i)).join('');
    button.innerHTML = `<span aria-hidden="true">↻</span> ${labels[type]} 번호 다시 생성하기 <span aria-hidden="true">↗</span>`;
    $(`#${type}-summary`).textContent = `${count}게임 생성 완료`;
    $(`[data-copy-all="${type}"]`).hidden = false;
    updateSavedButtons();
  } catch (error) { announce(error.message); }
}));

document.querySelectorAll('[data-copy-all]').forEach(button => button.addEventListener('click', () => {
  const type = button.dataset.copyAll;
  copyText(`${type === 'lotto' ? '로또 6/45' : '연금복권 720+'}\n` + generated[type].map((game, i) => `${String.fromCharCode(65 + i)}. ${formatGame(game)}`).join('\n'));
}));

document.addEventListener('click', event => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const {action, type, index} = button.dataset;
  if (action === 'delete') {
    const previousRow = button.closest('.game-row').previousElementSibling;
    const focusKey = previousRow?.dataset.key;
    try {
      saved = removeGame(button.dataset.key); $('#storage-warning').hidden = true; renderSaved();
      const target = focusKey ? [...document.querySelectorAll('#saved-panel [data-action="delete"]')].find(item => item.dataset.key === focusKey) : $('#saved-panel [data-action="delete"]');
      (target || $(`[data-tab="${activeTab}"]`)).focus();
      announce('보관함에서 삭제했어요.');
    } catch { storageError(); }
    return;
  }
  const game = button.dataset.stored === 'true' ? saved.filter(entry => entry.type === type)[Number(index)] : generated[type][Number(index)];
  if (!game) return;
  if (action === 'copy') copyText(formatGame(game));
  if (action === 'save') {
    try {
      const result = saveGame(game); saved = result.entries; $('#storage-warning').hidden = true; renderSaved();
      announce(result.added ? `${labels[type]} 보관함에 저장했어요.` : '이미 보관함에 있는 번호예요.');
    } catch { storageError(); }
  }
});

function selectTab(type, focus = false) {
  activeTab = type;
  document.querySelectorAll('[data-tab]').forEach(button => {
    const selected = button.dataset.tab === type;
    button.setAttribute('aria-selected', String(selected)); button.tabIndex = selected ? 0 : -1;
    if (selected && focus) button.focus();
  });
  renderSaved();
}
document.querySelectorAll('[data-tab]').forEach(button => {
  button.addEventListener('click', () => selectTab(button.dataset.tab));
  button.addEventListener('keydown', event => {
    if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      selectTab(event.key === 'Home' ? 'lotto' : event.key === 'End' ? 'pension' : activeTab === 'lotto' ? 'pension' : 'lotto', true);
    }
  });
});

$('#clear-saved').addEventListener('click', () => {
  deletingType = activeTab;
  $('#delete-description').textContent = `${labels[deletingType]} 보관함의 번호 ${saved.filter(entry => entry.type === deletingType).length}개를 모두 삭제합니다. 다른 복권 보관함은 유지되며, 삭제한 번호는 복구할 수 없어요.`;
  $('#delete-dialog').showModal();
});
$('#cancel-delete').addEventListener('click', () => $('#delete-dialog').close());
$('#confirm-delete').addEventListener('click', () => {
  try {
    saved = clearGames(deletingType); $('#storage-warning').hidden = true; renderSaved();
    $('#delete-dialog').close(); $(`[data-tab="${activeTab}"]`).focus(); announce('선택한 보관함을 비웠어요.');
  } catch { $('#delete-dialog').close(); storageError(); }
});
$('#close-copy').addEventListener('click', () => $('#copy-dialog').close());
window.addEventListener('storage', event => { if (event.key === STORAGE_KEY || event.key === null) refreshSaved(); });
refreshSaved();
