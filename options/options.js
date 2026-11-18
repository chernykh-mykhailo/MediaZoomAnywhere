const translations = {
  en: {
    secGeneral: 'General & Zoom Settings',
    modifierLabel: 'Activation key:',
    modifierDesc: 'Hold this key and scroll the mouse wheel over photos or videos to zoom.',
    optCtrl: 'Ctrl / Cmd ⌘ (default)',
    optAlt: 'Alt / Option ⌥',
    optShift: 'Shift',
    optCustom: 'Custom...',
    zoomSpeedLabel: 'Zoom speed:',
    zoomSpeedDesc: 'Scaling multiplier per wheel notch. Supports speeds up to 300%.',
    maxZoomLabel: 'Max zoom:',
    maxZoomDesc: 'Upper limit for media magnification.',
    hideScrollbarsLabel: 'Hide scrollbars when zoomed',
    hideScrollbarsDesc: 'Prevents browser scrollbars from appearing during media scaling.',
    resetOnMediaChangeLabel: 'Reset focus on media change',
    resetOnMediaChangeDesc: 'Automatically returns zoom to 100% when switching slides, carousel images, or videos.',

    secVideo: 'Video Expansion Settings',
    expandPreviewVideosLabel: 'Expand preview video outside frame',
    expandPreviewVideosDesc: 'Allows hover preview videos in feeds (YouTube, X/Twitter, etc.) to break out of their card frame over surrounding elements, just like photos.',
    expandPlayerVideosLabel: 'Expand player video outside frame',
    expandPlayerVideosDesc: 'Allows standalone and watch-page players (e.g. youtube.com/watch) to scale beyond the player frame while keeping controls on top.',

    secKeyboard: 'Keyboard Controls & Shortcuts',
    kbdZoomLabel: 'Keyboard zoom (center)',
    kbdZoomDesc: 'Zoom into media using customizable key combinations without using the mouse wheel.',
    kbdInLabel: 'Zoom In',
    kbdOutLabel: 'Zoom Out',
    kbdPanUpLabel: 'Focus Up',
    kbdPanDownLabel: 'Focus Down',
    kbdPanLabel: 'Pan with arrow keys',
    kbdPanDesc: 'Navigate around zoomed media using directional arrows.',
    panModifierLabel: 'Arrow key modifier:',
    optPanNone: '↑ ↓ ← → (Arrows only)',
    optPanShift: 'Shift + ↑ ↓ ← →',
    optPanAlt: 'Alt + ↑ ↓ ← →',
    optPanCtrl: 'Ctrl / Cmd + ↑ ↓ ← →',
    kbdPanStepLabel: 'Pan step:',
    kbdPanStepDesc: 'Distance shifted on each arrow key press.',
    pressKeys: 'Press keys...',

    controlsTitle: 'Controls (Windows / Mac)',
    tips: [
      { key: 'Ctrl (or Cmd ⌘) + Wheel', desc: ' — zoom in/out (or 2-finger Pinch on Mac trackpad).' },
      { key: 'Normal Wheel', desc: ' (when zoomed) — smoothly pan up/down.' },
      { key: 'Shift + Wheel', desc: ' — pan left/right.' },
      { key: 'Left-click Drag', desc: ' — free pan anywhere.' },
      { key: 'Double-click / Esc', desc: ' — reset zoom to 100%.' }
    ]
  },
  uk: {
    secGeneral: 'Загальні налаштування та зум',
    modifierLabel: 'Клавіша активації:',
    modifierDesc: 'Затисніть цю клавішу і крутіть колесико мишки над медіа для масштабування.',
    optCtrl: 'Ctrl / Cmd ⌘ (за замовчуванням)',
    optAlt: 'Alt / Option ⌥',
    optShift: 'Shift',
    optCustom: 'Кастом...',
    zoomSpeedLabel: 'Швидкість зуму:',
    zoomSpeedDesc: 'Коефіцієнт наближення за один крок колесика. Підтримує значення до 300%.',
    maxZoomLabel: 'Максимальний зум:',
    maxZoomDesc: 'Верхня межа збільшення медіа.',
    hideScrollbarsLabel: 'Приховувати скрол при зумі',
    hideScrollbarsDesc: 'Запобігає появі смуг прокручування браузера під час збільшення.',
    resetOnMediaChangeLabel: 'Скидати фокус при зміні медіа',
    resetOnMediaChangeDesc: 'Автоматично повертає масштаб до 100% при перемиканні слайдів або зміні відео.',

    secVideo: 'Розширення відео за межі рамок',
    expandPreviewVideosLabel: 'Розширювати прев\'ю відео за межі рамки',
    expandPreviewVideosDesc: 'Дозволяє рухомим прев\'ю в стрічках (YouTube, X тощо) виходити за межі картки поверх сусідніх елементів, як звичайні фото.',
    expandPlayerVideosLabel: 'Розширювати відео з плеєра за межі рамки',
    expandPlayerVideosDesc: 'Дозволяє плеєру на сторінці перегляду (наприклад, youtube.com/watch) масштабуватися за межі вікна плеєра, зберігаючи панель керування поверх відео.',

    secKeyboard: 'Керування клавіатурою та гарячі клавіші',
    kbdZoomLabel: 'Зум з клавіатури (у центр)',
    kbdZoomDesc: 'Наближення та віддалення медіа за допомогою налаштовуваних комбінацій клавіш.',
    kbdInLabel: 'Наблизити',
    kbdOutLabel: 'Віддалити',
    kbdPanUpLabel: 'Фокус вище',
    kbdPanDownLabel: 'Фокус нижче',
    kbdPanLabel: 'Переміщення стрілками',
    kbdPanDesc: 'Зручна навігація збільшеним зображенням або відео клавішами зі стрілками.',
    panModifierLabel: 'Модифікатор для стрілок:',
    optPanNone: '↑ ↓ ← → (лише стрілки)',
    optPanShift: 'Shift + ↑ ↓ ← →',
    optPanAlt: 'Alt + ↑ ↓ ← →',
    optPanCtrl: 'Ctrl / Cmd + ↑ ↓ ← →',
    kbdPanStepLabel: 'Крок переміщення:',
    kbdPanStepDesc: 'Кількість пікселів зміщення за одне натискання стрілки.',
    pressKeys: 'Натисніть клавіші...',

    controlsTitle: 'Керування (Windows / Mac)',
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
const defaultCustomActivationKey = { ctrl: false, alt: false, shift: false, meta: false, code: 'KeyZ', key: 'z' };
const defaultCustomPanModifier = { ctrl: true, alt: false, shift: true, meta: false, code: '', key: '' };

function formatKeyCombo(combo, lang = 'en') {
  if (!combo) return '';
  const parts = [];
  if (combo.ctrl) parts.push('Ctrl');
  if (combo.meta) parts.push('Cmd');
  if (combo.alt) parts.push('Alt');
  if (combo.shift) parts.push('Shift');

  if (combo.code === 'MouseRight') {
    return lang === 'uk' ? 'Права кнопка миші' : 'Right Click';
  }
  if (combo.code === 'MouseMiddle') {
    return lang === 'uk' ? 'Колесико миші (клік)' : 'Middle Click';
  }
  if (combo.code === 'MouseBack') {
    return lang === 'uk' ? 'Бокова кнопка 1 (Назад)' : 'Mouse 4 (Back)';
  }
  if (combo.code === 'MouseForward') {
    return lang === 'uk' ? 'Бокова кнопка 2 (Вперед)' : 'Mouse 5 (Forward)';
  }

  let keyPart = '';
  if (combo.code && !['ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'ShiftLeft', 'ShiftRight', 'MetaLeft', 'MetaRight'].includes(combo.code)) {
    const keyNames = {
      ArrowUp: '↑',
      ArrowDown: '↓',
      ArrowLeft: '←',
      ArrowRight: '→',
      Equal: '+',
      Minus: '-',
      NumpadAdd: 'Num +',
      NumpadSubtract: 'Num -',
      Space: lang === 'uk' ? 'Пробіл' : 'Space'
    };
    if (keyNames[combo.code]) {
      keyPart = keyNames[combo.code];
    } else if (combo.code.startsWith('Key')) {
      keyPart = combo.code.slice(3);
    } else if (combo.code.startsWith('Digit')) {
      keyPart = combo.code.slice(5);
    } else {
      keyPart = combo.key ? combo.key.toUpperCase() : combo.code;
    }
  }
  if (keyPart) {
    parts.push(keyPart);
  }
  return parts.length > 0 ? parts.join(' + ') : (lang === 'uk' ? 'Не призначено' : 'None');
}

document.addEventListener('DOMContentLoaded', () => {
  const toggleEnabled = document.getElementById('toggleEnabled');
  const modifierKey = document.getElementById('modifierKey');
  const zoomSpeed = document.getElementById('zoomSpeed');
  const zoomSpeedVal = document.getElementById('zoomSpeedVal');
  const maxZoom = document.getElementById('maxZoom');
  const maxZoomVal = document.getElementById('maxZoomVal');
  const toggleHideScrollbars = document.getElementById('toggleHideScrollbars');
  const toggleResetOnMediaChange = document.getElementById('toggleResetOnMediaChange');
  const toggleExpandPreviewVideos = document.getElementById('toggleExpandPreviewVideos');
  const toggleExpandPlayerVideos = document.getElementById('toggleExpandPlayerVideos');
  const toggleKeyboardZoom = document.getElementById('toggleKeyboardZoom');
  const kbdBindings = document.getElementById('kbdBindings');
  const toggleKeyboardPan = document.getElementById('toggleKeyboardPan');
  const kbdPanOptions = document.getElementById('kbdPanOptions');
  const kbdPanModifier = document.getElementById('kbdPanModifier');
  const customActivationRow = document.getElementById('customActivationRow');
  const recordCustomActivation = document.getElementById('recordCustomActivation');
  const customPanModifierRow = document.getElementById('customPanModifierRow');
  const recordCustomPanModifier = document.getElementById('recordCustomPanModifier');
  const keyboardPanStep = document.getElementById('keyboardPanStep');
  const keyboardPanStepVal = document.getElementById('keyboardPanStepVal');
  const langToggle = document.getElementById('langToggle');
  const tipsList = document.querySelector('.tips-list');

  let currentLang = 'en';
  let recordingTarget = null;
  let activeModifiers = null;

  const bindings = {
    in: { btn: document.getElementById('bindZoomIn'), storageKey: 'kbdZoomIn', combo: { ...defaultKbdIn }, type: 'keyWithArrows' },
    out: { btn: document.getElementById('bindZoomOut'), storageKey: 'kbdZoomOut', combo: { ...defaultKbdOut }, type: 'keyWithArrows' },
    up: { btn: document.getElementById('bindPanUp'), storageKey: 'kbdPanUp', combo: { ...defaultKbdPanUp }, type: 'keyWithArrows' },
    down: { btn: document.getElementById('bindPanDown'), storageKey: 'kbdPanDown', combo: { ...defaultKbdPanDown }, type: 'keyWithArrows' },
    customActivation: { btn: recordCustomActivation, storageKey: 'customActivationKey', combo: { ...defaultCustomActivationKey }, type: 'any' },
    customPanModifier: { btn: recordCustomPanModifier, storageKey: 'customPanModifier', combo: { ...defaultCustomPanModifier }, type: 'modifierOrKey' }
  };

  function updateCustomRowsVisibility() {
    if (customActivationRow) {
      customActivationRow.style.display = modifierKey.value === 'custom' ? 'flex' : 'none';
    }
    if (customPanModifierRow) {
      customPanModifierRow.style.display = kbdPanModifier.value === 'custom' ? 'flex' : 'none';
    }
  }

  function updateBindingButtons() {
    Object.entries(bindings).forEach(([key, entry]) => {
      if (!entry.btn) return;
      if (recordingTarget !== key) {
        entry.btn.textContent = formatKeyCombo(entry.combo, currentLang);
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

    if (recordingTarget && bindings[recordingTarget] && bindings[recordingTarget].btn) {
      bindings[recordingTarget].btn.textContent = dict.pressKeys;
    }
    updateBindingButtons();
  }

  const defaultLang = (navigator.language || 'en').toLowerCase().startsWith('uk') ? 'uk' : 'en';

  const defaultSettings = {
    enabled: true,
    modifierKey: 'ctrl',
    customActivationKey: defaultCustomActivationKey,
    zoomSpeed: 1.35,
    maxZoom: 15,
    language: defaultLang,
    hideScrollbars: true,
    resetOnMediaChange: true,
    expandPreviewVideos: true,
    expandPlayerVideos: false,
    keyboardZoomEnabled: true,
    kbdZoomIn: defaultKbdIn,
    kbdZoomOut: defaultKbdOut,
    kbdPanUp: defaultKbdPanUp,
    kbdPanDown: defaultKbdPanDown,
    keyboardPanEnabled: true,
    keyboardPanModifier: 'shift',
    customPanModifier: defaultCustomPanModifier,
    keyboardPanStep: 200
  };

  function applyLoadedSettings(items) {
    if (!items) return;
    if (items.enabled !== undefined) toggleEnabled.checked = items.enabled;
    if (items.modifierKey) modifierKey.value = items.modifierKey;
    if (items.zoomSpeed) {
      zoomSpeed.value = items.zoomSpeed;
      zoomSpeedVal.textContent = `${Math.round((items.zoomSpeed - 1) * 100)}%`;
    }
    if (items.maxZoom) {
      maxZoom.value = items.maxZoom;
      maxZoomVal.textContent = `${items.maxZoom}x`;
    }
    if (items.hideScrollbars !== undefined) toggleHideScrollbars.checked = items.hideScrollbars;
    if (items.resetOnMediaChange !== undefined) toggleResetOnMediaChange.checked = items.resetOnMediaChange;
    if (items.expandPreviewVideos !== undefined) {
      toggleExpandPreviewVideos.checked = items.expandPreviewVideos;
    } else if (items.expandVideos !== undefined) {
      toggleExpandPreviewVideos.checked = items.expandVideos;
    }
    if (items.expandPlayerVideos !== undefined) toggleExpandPlayerVideos.checked = Boolean(items.expandPlayerVideos);
    if (items.keyboardZoomEnabled !== undefined) {
      toggleKeyboardZoom.checked = items.keyboardZoomEnabled;
      kbdBindings.style.display = items.keyboardZoomEnabled ? 'grid' : 'none';
    }
    if (items.kbdZoomIn) bindings.in.combo = items.kbdZoomIn;
    if (items.kbdZoomOut) bindings.out.combo = items.kbdZoomOut;
    if (items.kbdPanUp) bindings.up.combo = items.kbdPanUp;
    if (items.kbdPanDown) bindings.down.combo = items.kbdPanDown;
    if (items.customActivationKey) bindings.customActivation.combo = items.customActivationKey;
    if (items.customPanModifier) bindings.customPanModifier.combo = items.customPanModifier;
    if (items.keyboardPanEnabled !== undefined) {
      toggleKeyboardPan.checked = items.keyboardPanEnabled;
      kbdPanOptions.style.display = items.keyboardPanEnabled ? 'block' : 'none';
    }
    if (items.keyboardPanModifier) kbdPanModifier.value = items.keyboardPanModifier;
    if (items.keyboardPanStep !== undefined) {
      const panStep = Number(items.keyboardPanStep) || 200;
      keyboardPanStep.value = panStep;
      keyboardPanStepVal.textContent = `${panStep}px`;
    }
    updateCustomRowsVisibility();
    updateBindingButtons();
    if (items.language) applyLanguage(items.language);
  }

  // Load from local storage first (instant), then sync
  if (chrome.storage.local) {
    chrome.storage.local.get(defaultSettings, (localItems) => {
      applyLoadedSettings(localItems);
      if (chrome.storage.sync) {
        try {
          chrome.storage.sync.get(defaultSettings, (syncItems) => {
            if (!chrome.runtime.lastError && syncItems) {
              applyLoadedSettings(syncItems);
            }
          });
        } catch (e) {}
      }
    });
  } else if (chrome.storage.sync) {
    chrome.storage.sync.get(defaultSettings, (items) => {
      applyLoadedSettings(items);
    });
  }

  let syncTimer = null;
  const pendingSync = {};

  function safeSave(items, syncDelay = 500) {
    // 1. Immediately save to local storage (no write quota limits)
    try {
      const p = chrome.storage.local.set(items);
      if (p && typeof p.catch === 'function') {
        p.catch(() => {});
      }
    } catch (e) {}

    // 2. Debounce sync storage write to avoid MAX_WRITE_OPERATIONS_PER_MINUTE (120/min limit)
    Object.assign(pendingSync, items);
    clearTimeout(syncTimer);
    syncTimer = setTimeout(() => {
      const toSync = { ...pendingSync };
      for (const k of Object.keys(pendingSync)) {
        delete pendingSync[k];
      }
      try {
        const syncPromise = chrome.storage.sync.set(toSync, () => {
          if (chrome.runtime.lastError) {
            // Silently handled
          }
        });
        if (syncPromise && typeof syncPromise.catch === 'function') {
          syncPromise.catch(() => {});
        }
      } catch (e) {}
    }, syncDelay);
  }

  langToggle.addEventListener('click', () => {
    const nextLang = currentLang === 'en' ? 'uk' : 'en';
    applyLanguage(nextLang);
    safeSave({ language: nextLang });
  });

  toggleEnabled.addEventListener('change', () => {
    safeSave({ enabled: toggleEnabled.checked });
  });

  modifierKey.addEventListener('change', () => {
    updateCustomRowsVisibility();
    safeSave({ modifierKey: modifierKey.value });
  });

  zoomSpeed.addEventListener('input', () => {
    const val = Number(zoomSpeed.value);
    zoomSpeedVal.textContent = `${Math.round((val - 1) * 100)}%`;
    safeSave({ zoomSpeed: val }, 500);
  });

  zoomSpeed.addEventListener('change', () => {
    const val = Number(zoomSpeed.value);
    safeSave({ zoomSpeed: val }, 200);
  });

  maxZoom.addEventListener('input', () => {
    const val = Number(maxZoom.value);
    maxZoomVal.textContent = `${val}x`;
    safeSave({ maxZoom: val }, 500);
  });

  maxZoom.addEventListener('change', () => {
    const val = Number(maxZoom.value);
    safeSave({ maxZoom: val }, 200);
  });

  toggleHideScrollbars.addEventListener('change', () => {
    safeSave({ hideScrollbars: toggleHideScrollbars.checked });
  });

  toggleResetOnMediaChange.addEventListener('change', () => {
    safeSave({ resetOnMediaChange: toggleResetOnMediaChange.checked });
  });

  toggleExpandPreviewVideos.addEventListener('change', () => {
    safeSave({
      expandPreviewVideos: toggleExpandPreviewVideos.checked,
      expandVideos: toggleExpandPreviewVideos.checked
    });
  });

  toggleExpandPlayerVideos.addEventListener('change', () => {
    safeSave({ expandPlayerVideos: toggleExpandPlayerVideos.checked });
  });

  toggleKeyboardZoom.addEventListener('change', () => {
    const enabled = toggleKeyboardZoom.checked;
    kbdBindings.style.display = enabled ? 'grid' : 'none';
    safeSave({ keyboardZoomEnabled: enabled });
  });

  toggleKeyboardPan.addEventListener('change', () => {
    const enabled = toggleKeyboardPan.checked;
    kbdPanOptions.style.display = enabled ? 'block' : 'none';
    safeSave({ keyboardPanEnabled: enabled });
  });

  kbdPanModifier.addEventListener('change', () => {
    updateCustomRowsVisibility();
    safeSave({ keyboardPanModifier: kbdPanModifier.value });
  });

  keyboardPanStep.addEventListener('input', () => {
    const val = Number(keyboardPanStep.value);
    keyboardPanStepVal.textContent = `${val}px`;
    safeSave({ keyboardPanStep: val }, 500);
  });

  keyboardPanStep.addEventListener('change', () => {
    const val = Number(keyboardPanStep.value);
    safeSave({ keyboardPanStep: val }, 200);
  });

  function startRecording(target, btn) {
    recordingTarget = target;
    activeModifiers = null;
    updateBindingButtons();
    btn.textContent = translations[currentLang].pressKeys;
    btn.classList.add('recording');
  }

  function finishRecording(combo) {
    if (!recordingTarget) return;
    const entry = bindings[recordingTarget];
    if (entry) {
      entry.combo = combo;
      safeSave({ [entry.storageKey]: combo }, 0);
    }
    recordingTarget = null;
    activeModifiers = null;
    updateBindingButtons();
  }

  function cancelRecording() {
    recordingTarget = null;
    activeModifiers = null;
    updateBindingButtons();
  }

  Object.entries(bindings).forEach(([key, entry]) => {
    if (entry.btn) {
      entry.btn.addEventListener('click', () => startRecording(key, entry.btn));
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!recordingTarget) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      cancelRecording();
      return;
    }

    const entry = bindings[recordingTarget];
    if (!entry) return;

    if (entry.type === 'keyWithArrows') {
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }
      finishRecording({
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        meta: e.metaKey,
        code: e.code,
        key: e.key
      });
      return;
    }

    const isModifierOnly = ['Control', 'Alt', 'Shift', 'Meta'].includes(e.key);
    if (isModifierOnly) {
      activeModifiers = {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        meta: e.metaKey
      };
      const preview = [];
      if (e.ctrlKey) preview.push('Ctrl');
      if (e.metaKey) preview.push('Cmd');
      if (e.altKey) preview.push('Alt');
      if (e.shiftKey) preview.push('Shift');
      entry.btn.textContent = preview.join(' + ') + ' + ...';
      return;
    }

    finishRecording({
      ctrl: e.ctrlKey,
      alt: e.altKey,
      shift: e.shiftKey,
      meta: e.metaKey,
      code: e.code,
      key: e.key
    });
  });

  document.addEventListener('keyup', (e) => {
    if (!recordingTarget) return;
    const entry = bindings[recordingTarget];
    if (!entry || entry.type === 'keyWithArrows') return;

    if (activeModifiers && (activeModifiers.ctrl || activeModifiers.alt || activeModifiers.shift || activeModifiers.meta)) {
      finishRecording({
        ctrl: Boolean(activeModifiers.ctrl),
        alt: Boolean(activeModifiers.alt),
        shift: Boolean(activeModifiers.shift),
        meta: Boolean(activeModifiers.meta),
        code: '',
        key: ''
      });
    }
  });

  function handleMouseRecording(e) {
    if (!recordingTarget) return;
    if (e.button === 0) return; // Left click is used to interact with buttons

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const mouseCodes = {
      1: { code: 'MouseMiddle', key: 'Middle Click' },
      2: { code: 'MouseRight', key: 'Right Click' },
      3: { code: 'MouseBack', key: 'Mouse 4 (Back)' },
      4: { code: 'MouseForward', key: 'Mouse 5 (Forward)' }
    };

    const mouseEntry = mouseCodes[e.button];
    if (mouseEntry) {
      finishRecording({
        ctrl: false,
        alt: false,
        shift: false,
        meta: false,
        code: mouseEntry.code,
        key: mouseEntry.key
      });
    }
  }

  document.addEventListener('pointerdown', handleMouseRecording, { capture: true });
  document.addEventListener('mousedown', handleMouseRecording, { capture: true });
  document.addEventListener('pointerup', (e) => {
    if (recordingTarget && (e.button === 1 || e.button === 2 || e.button === 3 || e.button === 4)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true });
  document.addEventListener('mouseup', (e) => {
    if (recordingTarget && (e.button === 1 || e.button === 2 || e.button === 3 || e.button === 4)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true });
  document.addEventListener('auxclick', (e) => {
    if (recordingTarget) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true });

  document.addEventListener('contextmenu', (e) => {
    if (recordingTarget) {
      e.preventDefault();
    }
  }, { capture: true });
});
