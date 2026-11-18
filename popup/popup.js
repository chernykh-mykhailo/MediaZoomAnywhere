const translations = {
  en: {
    modifierLabel: 'Activation key:',
    optCtrl: 'Ctrl / Cmd ⌘ (default)',
    optAlt: 'Alt / Option ⌥',
    optShift: 'Shift',
    optCustom: 'Custom...',
    zoomSpeedLabel: 'Zoom speed:',
    maxZoomLabel: 'Max zoom:',
    moreSettingsLabel: 'More Settings...',
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
    optCustom: 'Кастом...',
    zoomSpeedLabel: 'Швидкість зуму:',
    maxZoomLabel: 'Максимальний зум:',
    moreSettingsLabel: 'Більше налаштувань...',
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

const defaultCustomActivationKey = { ctrl: false, alt: false, shift: false, meta: false, code: 'KeyZ', key: 'z' };

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
  const langToggle = document.getElementById('langToggle');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  const moreSettingsBtn = document.getElementById('moreSettingsBtn');
  const customActivationRow = document.getElementById('customActivationRow');
  const recordCustomActivation = document.getElementById('recordCustomActivation');
  const tipsList = document.querySelector('.tips ul');

  let currentLang = 'en';
  let isRecording = false;
  let activeModifiers = null;
  let customActivationKey = { ...defaultCustomActivationKey };

  function updateCustomRow() {
    if (customActivationRow) {
      customActivationRow.style.display = modifierKey.value === 'custom' ? 'flex' : 'none';
    }
    if (recordCustomActivation && !isRecording) {
      recordCustomActivation.textContent = formatKeyCombo(customActivationKey, currentLang);
      recordCustomActivation.classList.remove('recording');
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

    updateCustomRow();
  }

  function openOptions() {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options/options.html'));
    }
  }

  if (openOptionsBtn) openOptionsBtn.addEventListener('click', openOptions);
  if (moreSettingsBtn) moreSettingsBtn.addEventListener('click', openOptions);

  const defaultLang = (navigator.language || 'en').toLowerCase().startsWith('uk') ? 'uk' : 'en';

  chrome.storage.sync.get({
    enabled: true,
    modifierKey: 'ctrl',
    customActivationKey: defaultCustomActivationKey,
    zoomSpeed: 1.35,
    maxZoom: 15,
    language: defaultLang
  }, (items) => {
    toggleEnabled.checked = items.enabled;
    modifierKey.value = items.modifierKey;
    if (items.customActivationKey) customActivationKey = items.customActivationKey;
    zoomSpeed.value = items.zoomSpeed;
    zoomSpeedVal.textContent = `${Math.round((items.zoomSpeed - 1) * 100)}%`;
    updateCustomRow();
    applyLanguage(items.language);
  });

  // Listen for storage changes from Options page to keep popup in sync if both are open
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'sync' || area === 'local') {
      if (changes.enabled) toggleEnabled.checked = changes.enabled.newValue;
      if (changes.modifierKey) {
        modifierKey.value = changes.modifierKey.newValue;
        updateCustomRow();
      }
      if (changes.customActivationKey) {
        customActivationKey = changes.customActivationKey.newValue;
        updateCustomRow();
      }
      if (changes.zoomSpeed) {
        const val = Number(changes.zoomSpeed.newValue);
        zoomSpeed.value = val;
        zoomSpeedVal.textContent = `${Math.round((val - 1) * 100)}%`;
      }
      if (changes.language) applyLanguage(changes.language.newValue);
    }
  });

  const saveTimers = {};

  function safeSyncSet(items, delay = 0) {
    const keys = Object.keys(items);
    const timerKey = keys.join('_');

    if (delay > 0) {
      clearTimeout(saveTimers[timerKey]);
      saveTimers[timerKey] = setTimeout(() => {
        chrome.storage.sync.set(items, () => {
          if (chrome.runtime.lastError) {
            chrome.storage.local.set(items, () => {});
          }
        });
      }, delay);
    } else {
      clearTimeout(saveTimers[timerKey]);
      chrome.storage.sync.set(items, () => {
        if (chrome.runtime.lastError) {
          chrome.storage.local.set(items, () => {});
        }
      });
    }
  }

  langToggle.addEventListener('click', () => {
    const nextLang = currentLang === 'en' ? 'uk' : 'en';
    applyLanguage(nextLang);
    safeSyncSet({ language: nextLang });
  });

  toggleEnabled.addEventListener('change', () => {
    safeSyncSet({ enabled: toggleEnabled.checked });
  });

  modifierKey.addEventListener('change', () => {
    updateCustomRow();
    safeSyncSet({ modifierKey: modifierKey.value });
  });

  function startRecording() {
    isRecording = true;
    activeModifiers = null;
    recordCustomActivation.textContent = translations[currentLang].pressKeys;
    recordCustomActivation.classList.add('recording');
  }

  function finishRecording(combo) {
    if (!isRecording) return;
    customActivationKey = combo;
    safeSyncSet({ customActivationKey: combo }, 0);
    isRecording = false;
    activeModifiers = null;
    updateCustomRow();
  }

  function cancelRecording() {
    isRecording = false;
    activeModifiers = null;
    updateCustomRow();
  }

  if (recordCustomActivation) {
    recordCustomActivation.addEventListener('click', startRecording);
  }

  document.addEventListener('keydown', (e) => {
    if (!isRecording) return;
    e.preventDefault();
    e.stopPropagation();

    if (e.key === 'Escape') {
      cancelRecording();
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
      recordCustomActivation.textContent = preview.join(' + ') + ' + ...';
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
    if (!isRecording) return;
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
    if (!isRecording) return;
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
    if (isRecording && (e.button === 1 || e.button === 2 || e.button === 3 || e.button === 4)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true });
  document.addEventListener('mouseup', (e) => {
    if (isRecording && (e.button === 1 || e.button === 2 || e.button === 3 || e.button === 4)) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true });
  document.addEventListener('auxclick', (e) => {
    if (isRecording) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, { capture: true });

  document.addEventListener('contextmenu', (e) => {
    if (isRecording) {
      e.preventDefault();
    }
  }, { capture: true });

  zoomSpeed.addEventListener('input', () => {
    const val = Number(zoomSpeed.value);
    zoomSpeedVal.textContent = `${Math.round((val - 1) * 100)}%`;
    safeSyncSet({ zoomSpeed: val }, 250);
  });

  zoomSpeed.addEventListener('change', () => {
    const val = Number(zoomSpeed.value);
    safeSyncSet({ zoomSpeed: val }, 0);
  });
});
