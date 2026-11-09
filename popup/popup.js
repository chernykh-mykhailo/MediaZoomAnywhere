const translations = {
  en: {
    modifierLabel: 'Activation key:',
    optCtrl: 'Ctrl / Cmd ⌘ (default)',
    optAlt: 'Alt / Option ⌥',
    optShift: 'Shift',
    zoomSpeedLabel: 'Zoom speed:',
    maxZoomLabel: 'Max zoom:',
    kbdZoomLabel: 'Keyboard zoom (center):',
    kbdInLabel: 'Zoom In',
    kbdOutLabel: 'Zoom Out',
    pressKeys: 'Press keys...',
    controlsTitle: 'Controls (Windows / Mac):',
    tips: [
      { key: 'Ctrl (or Cmd ⌘) + Wheel', desc: ' — zoom in/out (or 2-finger Pinch on Mac trackpad).' },
      { key: 'Normal Wheel', desc: ' (when zoomed) — smoothly pan up/down.' },
      { key: 'Shift + Wheel', desc: ' — pan left/right.' },
      { key: 'Left-click Drag', desc: ' — free pan anywhere.' },
      { key: 'Double-click / Esc', desc: ' — reset zoom to 100%.' }
    ]
  },
  uk: {
    modifierLabel: 'Клавіша активації:',
    optCtrl: 'Ctrl / Cmd ⌘ (за замовчуванням)',
    optAlt: 'Alt / Option ⌥',
    optShift: 'Shift',
    zoomSpeedLabel: 'Швидкість зуму:',
    maxZoomLabel: 'Максимальний зум:',
    kbdZoomLabel: 'Зум з клавіатури (у центр):',
    kbdInLabel: 'Наблизити',
    kbdOutLabel: 'Віддалити',
    pressKeys: 'Натисніть клавіші...',
    controlsTitle: 'Керування (Windows / Mac):',
    tips: [
      { key: 'Ctrl (або Cmd ⌘) + Колесико', desc: ' — наближення та віддалення (на Mac також жест двома пальцями Pinch-to-zoom).' },
      { key: 'Звичайне колесико', desc: ' (коли збільшено) — плавно переміщує фокус вище / нижче.' },
      { key: 'Shift + Колесико', desc: ' — переміщення вліво / вправо.' },
      { key: 'Затиснути ліву кнопку', desc: ' — вільне перетягування.' },
      { key: 'Подвійний клік / Esc', desc: ' — миттєве скидання зуму.' }
    ]
  }
};

const defaultKbdIn = { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowUp', key: 'ArrowUp' };
const defaultKbdOut = { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowDown', key: 'ArrowDown' };

function formatKeyCombo(combo) {
  if (!combo) return '';
  const parts = [];
  if (combo.ctrl) parts.push('Ctrl');
  if (combo.meta) parts.push('Cmd');
  if (combo.alt) parts.push('Alt');
  if (combo.shift) parts.push('Shift');

  const keyNames = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Equal: '+',
    Minus: '-',
    NumpadAdd: 'Num +',
    NumpadSubtract: 'Num -'
  };

  const label = keyNames[combo.code] || keyNames[combo.key] || (combo.key ? combo.key.toUpperCase() : combo.code);
  parts.push(label);
  return parts.join(' + ');
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleEnabled = document.getElementById('toggleEnabled');
  const modifierKey = document.getElementById('modifierKey');
  const zoomSpeed = document.getElementById('zoomSpeed');
  const zoomSpeedVal = document.getElementById('zoomSpeedVal');
  const maxZoom = document.getElementById('maxZoom');
  const maxZoomVal = document.getElementById('maxZoomVal');
  const toggleKeyboardZoom = document.getElementById('toggleKeyboardZoom');
  const kbdBindings = document.getElementById('kbdBindings');
  const bindZoomIn = document.getElementById('bindZoomIn');
  const bindZoomOut = document.getElementById('bindZoomOut');
  const langToggle = document.getElementById('langToggle');
  const tipsList = document.querySelector('.tips ul');

  let currentLang = 'en';
  let recordingTarget = null;
  let currentKbdIn = { ...defaultKbdIn };
  let currentKbdOut = { ...defaultKbdOut };

  function updateBindingButtons() {
    if (recordingTarget !== 'in') {
      bindZoomIn.textContent = formatKeyCombo(currentKbdIn);
      bindZoomIn.classList.remove('recording');
    }
    if (recordingTarget !== 'out') {
      bindZoomOut.textContent = formatKeyCombo(currentKbdOut);
      bindZoomOut.classList.remove('recording');
    }
  }

  function applyLanguage(lang) {
    currentLang = translations[lang] ? lang : 'en';
    const dict = translations[currentLang];

    document.documentElement.lang = currentLang;
    langToggle.textContent = currentLang.toUpperCase();

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    if (tipsList && dict.tips) {
      tipsList.textContent = '';
      dict.tips.forEach((tip) => {
        const li = document.createElement('li');
        const strong = document.createElement('strong');
        strong.textContent = tip.key;
        li.appendChild(strong);
        li.appendChild(document.createTextNode(tip.desc));
        tipsList.appendChild(li);
      });
    }

    if (recordingTarget === 'in') bindZoomIn.textContent = dict.pressKeys;
    if (recordingTarget === 'out') bindZoomOut.textContent = dict.pressKeys;
  }

  const defaultLang = (navigator.language || 'en').toLowerCase().startsWith('uk') ? 'uk' : 'en';

  chrome.storage.sync.get({
    enabled: true,
    modifierKey: 'ctrl',
    zoomSpeed: 1.15,
    maxZoom: 15,
    language: defaultLang,
    keyboardZoomEnabled: false,
    kbdZoomIn: defaultKbdIn,
    kbdZoomOut: defaultKbdOut
  }, (items) => {
    toggleEnabled.checked = items.enabled;
    modifierKey.value = items.modifierKey;
    zoomSpeed.value = items.zoomSpeed;
    zoomSpeedVal.textContent = `${Math.round((items.zoomSpeed - 1) * 100)}%`;
    maxZoom.value = items.maxZoom;
    maxZoomVal.textContent = `${items.maxZoom}x`;
    toggleKeyboardZoom.checked = items.keyboardZoomEnabled;
    kbdBindings.style.display = items.keyboardZoomEnabled ? 'grid' : 'none';
    currentKbdIn = items.kbdZoomIn || defaultKbdIn;
    currentKbdOut = items.kbdZoomOut || defaultKbdOut;
    updateBindingButtons();
    applyLanguage(items.language);
  });

  langToggle.addEventListener('click', () => {
    const nextLang = currentLang === 'en' ? 'uk' : 'en';
    applyLanguage(nextLang);
    chrome.storage.sync.set({ language: nextLang });
  });

  toggleEnabled.addEventListener('change', () => {
    chrome.storage.sync.set({ enabled: toggleEnabled.checked });
  });

  modifierKey.addEventListener('change', () => {
    chrome.storage.sync.set({ modifierKey: modifierKey.value });
  });

  zoomSpeed.addEventListener('input', () => {
    const val = Number(zoomSpeed.value);
    zoomSpeedVal.textContent = `${Math.round((val - 1) * 100)}%`;
    chrome.storage.sync.set({ zoomSpeed: val });
  });

  maxZoom.addEventListener('input', () => {
    const val = Number(maxZoom.value);
    maxZoomVal.textContent = `${val}x`;
    chrome.storage.sync.set({ maxZoom: val });
  });

  toggleKeyboardZoom.addEventListener('change', () => {
    const enabled = toggleKeyboardZoom.checked;
    kbdBindings.style.display = enabled ? 'grid' : 'none';
    chrome.storage.sync.set({ keyboardZoomEnabled: enabled });
  });

  function startRecording(target, btn) {
    recordingTarget = target;
    updateBindingButtons();
    btn.textContent = translations[currentLang].pressKeys;
    btn.classList.add('recording');
  }

  bindZoomIn.addEventListener('click', () => startRecording('in', bindZoomIn));
  bindZoomOut.addEventListener('click', () => startRecording('out', bindZoomOut));

  document.addEventListener('keydown', (e) => {
    if (!recordingTarget) return;
    e.preventDefault();
    e.stopPropagation();

    // Ignore pure modifier presses until the actual key is pressed
    if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
      return;
    }

    if (e.key === 'Escape') {
      recordingTarget = null;
      updateBindingButtons();
      return;
    }

    const combo = {
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
      code: e.code,
      key: e.key
    };

    if (recordingTarget === 'in') {
      currentKbdIn = combo;
      chrome.storage.sync.set({ kbdZoomIn: combo });
    } else {
      currentKbdOut = combo;
      chrome.storage.sync.set({ kbdZoomOut: combo });
    }

    recordingTarget = null;
    updateBindingButtons();
  });
});
