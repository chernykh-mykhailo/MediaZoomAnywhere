const translations = {
  en: {
    modifierLabel: 'Activation key:',
    optCtrl: 'Ctrl / Cmd ⌘ (default)',
    optAlt: 'Alt / Option ⌥',
    optShift: 'Shift',
    zoomSpeedLabel: 'Zoom speed:',
    maxZoomLabel: 'Max zoom:',
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

document.addEventListener('DOMContentLoaded', () => {
  const toggleEnabled = document.getElementById('toggleEnabled');
  const modifierKey = document.getElementById('modifierKey');
  const zoomSpeed = document.getElementById('zoomSpeed');
  const zoomSpeedVal = document.getElementById('zoomSpeedVal');
  const maxZoom = document.getElementById('maxZoom');
  const maxZoomVal = document.getElementById('maxZoomVal');
  const langToggle = document.getElementById('langToggle');
  const tipsList = document.querySelector('.tips ul');

  let currentLang = 'en';

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

    // Safely rebuild tips list without innerHTML
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
  }

  // Detect default language (Ukrainian if browser UI is uk, otherwise English)
  const defaultLang = (navigator.language || 'en').toLowerCase().startsWith('uk') ? 'uk' : 'en';

  chrome.storage.sync.get({
    enabled: true,
    modifierKey: 'ctrl',
    zoomSpeed: 1.15,
    maxZoom: 15,
    language: defaultLang
  }, (items) => {
    toggleEnabled.checked = items.enabled;
    modifierKey.value = items.modifierKey;
    zoomSpeed.value = items.zoomSpeed;
    zoomSpeedVal.textContent = `${Math.round((items.zoomSpeed - 1) * 100)}%`;
    maxZoom.value = items.maxZoom;
    maxZoomVal.textContent = `${items.maxZoom}x`;
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
});
