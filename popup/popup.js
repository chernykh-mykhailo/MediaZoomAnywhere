const translations = {
  en: {
    modifierLabel: 'Activation key:',
    optCtrl: 'Ctrl / Cmd ⌘ (default)',
    optAlt: 'Alt / Option ⌥',
    optShift: 'Shift',
    zoomSpeedLabel: 'Zoom speed:',
    maxZoomLabel: 'Max zoom:',
    kbdPanStepLabel: 'Pan step:',
    hideScrollbarsLabel: 'Hide scrollbars when zoomed:',
    resetOnMediaChangeLabel: 'Reset focus on media change:',
    expandPreviewVideosLabel: 'Expand preview video outside frame:',
    expandPlayerVideosLabel: 'Expand player video outside frame:',
    kbdZoomLabel: 'Keyboard zoom (center):',
    kbdInLabel: 'Zoom In',
    kbdOutLabel: 'Zoom Out',
    kbdPanUpLabel: 'Focus Up',
    kbdPanDownLabel: 'Focus Down',
    kbdPanLabel: 'Pan with arrow keys:',
    optPanNone: '↑ ↓ ← → (Arrows only)',
    optPanShift: 'Shift + ↑ ↓ ← →',
    optPanAlt: 'Alt + ↑ ↓ ← →',
    optPanCtrl: 'Ctrl / Cmd + ↑ ↓ ← →',
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
    kbdPanStepLabel: 'Крок переміщення:',
    hideScrollbarsLabel: 'Приховувати скрол при зумі:',
    resetOnMediaChangeLabel: 'Скидати фокус при зміні медіа:',
    expandPreviewVideosLabel: 'Розширювати прев\'ю відео за межі рамки:',
    expandPlayerVideosLabel: 'Розширювати відео з плеєра за межі рамки:',
    kbdZoomLabel: 'Зум з клавіатури (у центр):',
    kbdInLabel: 'Наблизити',
    kbdOutLabel: 'Віддалити',
    kbdPanUpLabel: 'Фокус вище',
    kbdPanDownLabel: 'Фокус нижче',
    kbdPanLabel: 'Переміщення стрілками:',
    optPanNone: '↑ ↓ ← → (лише стрілки)',
    optPanShift: 'Shift + ↑ ↓ ← →',
    optPanAlt: 'Alt + ↑ ↓ ← →',
    optPanCtrl: 'Ctrl / Cmd + ↑ ↓ ← →',
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
const defaultKbdPanUp = { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowLeft', key: 'ArrowLeft' };
const defaultKbdPanDown = { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowRight', key: 'ArrowRight' };

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
  const keyboardPanStep = document.getElementById('keyboardPanStep');
  const keyboardPanStepVal = document.getElementById('keyboardPanStepVal');
  const toggleHideScrollbars = document.getElementById('toggleHideScrollbars');
  const toggleResetOnMediaChange = document.getElementById('toggleResetOnMediaChange');
  const toggleExpandPreviewVideos = document.getElementById('toggleExpandPreviewVideos');
  const toggleExpandPlayerVideos = document.getElementById('toggleExpandPlayerVideos');
  const toggleKeyboardZoom = document.getElementById('toggleKeyboardZoom');
  const kbdBindings = document.getElementById('kbdBindings');
  const toggleKeyboardPan = document.getElementById('toggleKeyboardPan');
  const kbdPanOptions = document.getElementById('kbdPanOptions');
  const kbdPanModifier = document.getElementById('kbdPanModifier');
  const langToggle = document.getElementById('langToggle');
  const tipsList = document.querySelector('.tips ul');

  let currentLang = 'en';
  let recordingTarget = null;

  const bindings = {
    in: { btn: document.getElementById('bindZoomIn'), storageKey: 'kbdZoomIn', combo: { ...defaultKbdIn } },
    out: { btn: document.getElementById('bindZoomOut'), storageKey: 'kbdZoomOut', combo: { ...defaultKbdOut } },
    up: { btn: document.getElementById('bindPanUp'), storageKey: 'kbdPanUp', combo: { ...defaultKbdPanUp } },
    down: { btn: document.getElementById('bindPanDown'), storageKey: 'kbdPanDown', combo: { ...defaultKbdPanDown } }
  };

  function updateBindingButtons() {
    Object.entries(bindings).forEach(([key, entry]) => {
      if (recordingTarget !== key) {
        entry.btn.textContent = formatKeyCombo(entry.combo);
        entry.btn.classList.remove('recording');
      }
    });
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

    if (recordingTarget && bindings[recordingTarget]) {
      bindings[recordingTarget].btn.textContent = dict.pressKeys;
    }
  }

  const defaultLang = (navigator.language || 'en').toLowerCase().startsWith('uk') ? 'uk' : 'en';

  chrome.storage.sync.get({
    enabled: true,
    modifierKey: 'ctrl',
    zoomSpeed: 1.35,
    maxZoom: 15,
    language: defaultLang,
    hideScrollbars: true,
    resetOnMediaChange: true,
    expandPreviewVideos: false,
    expandPlayerVideos: false,
    keyboardZoomEnabled: true,
    kbdZoomIn: defaultKbdIn,
    kbdZoomOut: defaultKbdOut,
    kbdPanUp: defaultKbdPanUp,
    kbdPanDown: defaultKbdPanDown,
    keyboardPanEnabled: true,
    keyboardPanModifier: 'shift',
    keyboardPanStep: 200
  }, (items) => {
    toggleEnabled.checked = items.enabled;
    modifierKey.value = items.modifierKey;
    zoomSpeed.value = items.zoomSpeed;
    zoomSpeedVal.textContent = `${Math.round((items.zoomSpeed - 1) * 100)}%`;
    maxZoom.value = items.maxZoom;
    maxZoomVal.textContent = `${items.maxZoom}x`;
    const panStep = Number(items.keyboardPanStep) || 200;
    keyboardPanStep.value = panStep;
    keyboardPanStepVal.textContent = `${panStep}px`;
    toggleHideScrollbars.checked = items.hideScrollbars;
    toggleResetOnMediaChange.checked = items.resetOnMediaChange;
    toggleExpandPreviewVideos.checked = items.expandPreviewVideos !== undefined ? items.expandPreviewVideos : Boolean(items.expandVideos);
    toggleExpandPlayerVideos.checked = Boolean(items.expandPlayerVideos);
    toggleKeyboardZoom.checked = items.keyboardZoomEnabled;
    kbdBindings.style.display = items.keyboardZoomEnabled ? 'grid' : 'none';
    bindings.in.combo = items.kbdZoomIn || defaultKbdIn;
    bindings.out.combo = items.kbdZoomOut || defaultKbdOut;
    bindings.up.combo = items.kbdPanUp || defaultKbdPanUp;
    bindings.down.combo = items.kbdPanDown || defaultKbdPanDown;
    toggleKeyboardPan.checked = items.keyboardPanEnabled;
    kbdPanOptions.style.display = items.keyboardPanEnabled ? 'block' : 'none';
    kbdPanModifier.value = items.keyboardPanModifier || 'shift';
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

  keyboardPanStep.addEventListener('input', () => {
    const val = Number(keyboardPanStep.value);
    keyboardPanStepVal.textContent = `${val}px`;
    chrome.storage.sync.set({ keyboardPanStep: val });
  });

  toggleHideScrollbars.addEventListener('change', () => {
    chrome.storage.sync.set({ hideScrollbars: toggleHideScrollbars.checked });
  });

  toggleResetOnMediaChange.addEventListener('change', () => {
    chrome.storage.sync.set({ resetOnMediaChange: toggleResetOnMediaChange.checked });
  });

  toggleExpandPreviewVideos.addEventListener('change', () => {
    chrome.storage.sync.set({
      expandPreviewVideos: toggleExpandPreviewVideos.checked,
      expandVideos: toggleExpandPreviewVideos.checked
    });
  });

  toggleExpandPlayerVideos.addEventListener('change', () => {
    chrome.storage.sync.set({ expandPlayerVideos: toggleExpandPlayerVideos.checked });
  });

  toggleKeyboardZoom.addEventListener('change', () => {
    const enabled = toggleKeyboardZoom.checked;
    kbdBindings.style.display = enabled ? 'grid' : 'none';
    chrome.storage.sync.set({ keyboardZoomEnabled: enabled });
  });

  toggleKeyboardPan.addEventListener('change', () => {
    const enabled = toggleKeyboardPan.checked;
    kbdPanOptions.style.display = enabled ? 'block' : 'none';
    chrome.storage.sync.set({ keyboardPanEnabled: enabled });
  });

  kbdPanModifier.addEventListener('change', () => {
    chrome.storage.sync.set({ keyboardPanModifier: kbdPanModifier.value });
  });

  function startRecording(target, btn) {
    recordingTarget = target;
    updateBindingButtons();
    btn.textContent = translations[currentLang].pressKeys;
    btn.classList.add('recording');
  }

  Object.entries(bindings).forEach(([key, entry]) => {
    entry.btn.addEventListener('click', () => startRecording(key, entry.btn));
  });

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

    const entry = bindings[recordingTarget];
    if (entry) {
      entry.combo = combo;
      chrome.storage.sync.set({ [entry.storageKey]: combo });
    }

    recordingTarget = null;
    updateBindingButtons();
  });
});
