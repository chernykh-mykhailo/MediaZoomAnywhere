(() => {
  // Configuration
  const config = {
    enabled: true,
    modifierKey: 'ctrl',
    zoomSpeed: 1.15,
    maxZoom: 20.0,
    minZoom: 1.0,
    wheelPanSpeed: 1.0,
    badgeTimeout: 1200
  };

  // Check support for individual transform properties (Chrome 104+)
  const supportsIndependentTransforms = ('scale' in document.documentElement.style && 'translate' in document.documentElement.style);

  // Load saved settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get(['enabled', 'modifierKey', 'zoomSpeed', 'maxZoom'], (items) => {
      if (items.enabled !== undefined) config.enabled = items.enabled;
      if (items.modifierKey) config.modifierKey = items.modifierKey;
      if (items.zoomSpeed) config.zoomSpeed = Number(items.zoomSpeed);
      if (items.maxZoom) config.maxZoom = Number(items.maxZoom);
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' || area === 'local') {
        if (changes.enabled) config.enabled = changes.enabled.newValue;
        if (changes.modifierKey) config.modifierKey = changes.modifierKey.newValue;
        if (changes.zoomSpeed) config.zoomSpeed = Number(changes.zoomSpeed.newValue);
        if (changes.maxZoom) config.maxZoom = Number(changes.maxZoom.newValue);
      }
    });
  }

  // Active zoomed element state
  let activeElement = null;
  let activeState = null;
  let mediaObserver = null;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let startPanX = 0;
  let startPanY = 0;
  let hasDragged = false;

  // Zoom badge element
  let badgeEl = null;
  let badgeTimer = null;

  function getOrCreateBadge() {
    if (!badgeEl || !document.documentElement.contains(badgeEl)) {
      badgeEl = document.createElement('div');
      badgeEl.className = 'mza-zoom-badge';
      document.documentElement.appendChild(badgeEl);
    }
    return badgeEl;
  }

  function showBadge(text, x, y) {
    const badge = getOrCreateBadge();
    badge.textContent = text;

    const posX = Math.min(window.innerWidth - 80, Math.max(10, x + 15));
    const posY = Math.min(window.innerHeight - 40, Math.max(10, y + 15));

    badge.style.left = `${posX}px`;
    badge.style.top = `${posY}px`;
    badge.classList.add('mza-visible');

    clearTimeout(badgeTimer);
    badgeTimer = setTimeout(() => {
      badge.classList.remove('mza-visible');
    }, config.badgeTimeout);
  }

  function isModifierPressed(e) {
    if (config.modifierKey === 'ctrl') return e.ctrlKey;
    if (config.modifierKey === 'alt') return e.altKey;
    if (config.modifierKey === 'shift') return e.shiftKey;
    return e.ctrlKey;
  }

  function isVisible(el) {
    if (!el || !(el instanceof Element)) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return false;
    const style = window.getComputedStyle(el);
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
  }

  function isMediaNode(el) {
    if (!el || !(el instanceof Element)) return false;
    const tag = el.tagName.toLowerCase();
    return tag === 'img' || tag === 'video' || tag === 'canvas' || tag === 'picture';
  }

  function resolveMediaNode(el) {
    if (!el) return null;
    if (el.tagName && el.tagName.toLowerCase() === 'picture') {
      const img = el.querySelector('img');
      return img || el;
    }
    return el;
  }

  function hasBackgroundImage(el) {
    if (!el || !(el instanceof Element)) return false;
    const style = window.getComputedStyle(el);
    return Boolean(style.backgroundImage && style.backgroundImage !== 'none' && style.backgroundImage.includes('url('));
  }

  function isModalElement(el) {
    if (!el || !(el instanceof Element)) return false;
    const role = el.getAttribute ? el.getAttribute('role') : null;
    const className = String(el.className || '').toLowerCase();
    return (
      role === 'dialog' ||
      className.includes('modal') ||
      className.includes('lightbox') ||
      className.includes('viewer') ||
      className.includes('dialog') ||
      className.includes('overlay') ||
      className.includes('carousel') ||
      className.includes('slider') ||
      className.includes('swiper') ||
      className.includes('player') ||
      className.includes('pswp')
    );
  }

  function findLargestMedia(container = document) {
    // Check videos first in container
    const videos = container.querySelectorAll('video');
    for (const v of videos) {
      if (isVisible(v)) return v;
    }

    const list = container.querySelectorAll('video, img, canvas');
    let best = null;
    let maxArea = 0;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    for (const el of list) {
      if (!isVisible(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.right < 0 || rect.bottom < 0 || rect.left > vpW || rect.top > vpH) continue;
      const visibleW = Math.min(rect.right, vpW) - Math.max(rect.left, 0);
      const visibleH = Math.min(rect.bottom, vpH) - Math.max(rect.top, 0);
      const area = visibleW * visibleH;
      if (area > maxArea) {
        maxArea = area;
        best = el;
      }
    }
    return best;
  }

  function isCursorNearElement(el, x, y, margin = 60) {
    if (!el || !document.contains(el)) return false;
    const rect = el.getBoundingClientRect();
    return (
      x >= rect.left - margin &&
      x <= rect.right + margin &&
      y >= rect.top - margin &&
      y <= rect.bottom + margin
    );
  }

  function isEventOnActiveMedia(e) {
    if (!activeElement || !document.contains(activeElement)) return false;
    const path = e.composedPath ? e.composedPath() : [];
    if (path.includes(activeElement)) return true;
    return isCursorNearElement(activeElement, e.clientX, e.clientY, 50);
  }

  // Only genuine interactive control buttons or scrubber tracks are treated as controls
  function isControlElement(target) {
    if (!target || !(target instanceof Element)) return false;
    const tag = (target.tagName || '').toLowerCase();
    if (tag === 'button' || tag === 'input' || tag === 'select' || tag === 'a') return true;
    if (target.getAttribute && target.getAttribute('role') === 'button') return true;

    // Tight check for actual button or slider element, NOT broad parent containers
    const btn = target.closest('button, [role="button"], input[type="range"]');
    if (btn) return true;

    const scrubber = target.closest('[class*="scrub"], [class*="progress-bar"], [class*="seek-bar"], [class*="volume-slider"]');
    if (scrubber) return true;

    return false;
  }

  // Priority search for media
  function findTargetMedia(e) {
    const x = e.clientX;
    const y = e.clientY;

    // 1. If currently zoomed in, keep active element if cursor is on or near it
    if (activeElement && activeState && activeState.scale > 1.0) {
      if (isCursorNearElement(activeElement, x, y, 120)) {
        return activeElement;
      }
    }

    const elements = document.elementsFromPoint(x, y) || [];

    // 2. VIDEO PRIORITY: Check direct <video> under cursor
    for (const el of elements) {
      if (el.tagName && el.tagName.toLowerCase() === 'video' && isVisible(el)) {
        return el;
      }
    }

    // Check composed path for <video> (pierces shadow DOM / custom player web components)
    const path = e.composedPath ? e.composedPath() : [];
    for (const el of path) {
      if (el && el.tagName && el.tagName.toLowerCase() === 'video' && isVisible(el)) {
        return el;
      }
      if (el && el.shadowRoot) {
        const vid = el.shadowRoot.querySelector('video');
        if (vid && isVisible(vid)) return vid;
      }
    }

    // Check if any element under cursor contains a <video> (e.g. video player overlay)
    for (const el of elements) {
      if (el === document.body || el === document.documentElement) continue;
      const vid = el.querySelector('video');
      if (vid && isVisible(vid) && isCursorNearElement(vid, x, y)) {
        return vid;
      }
    }

    // 3. Direct tag match (img, canvas, picture)
    for (const el of elements) {
      if (isMediaNode(el) && isVisible(el)) {
        return resolveMediaNode(el);
      }
    }

    for (const el of path) {
      if (!el || !(el instanceof Element)) continue;
      if (isMediaNode(el) && isVisible(el)) {
        return resolveMediaNode(el);
      }
      if (el.shadowRoot) {
        const shadowChild = el.shadowRoot.querySelector('img, canvas');
        if (shadowChild && isVisible(shadowChild)) return shadowChild;
      }
    }

    // 4. Element containing an image child
    for (const el of elements) {
      if (el === document.body || el === document.documentElement) continue;
      const child = el.querySelector('img, canvas');
      if (child && isVisible(child) && isCursorNearElement(child, x, y)) {
        return resolveMediaNode(child);
      }
    }

    // 5. Parent / sibling wrapper
    for (const el of elements) {
      if (el === document.body || el === document.documentElement) continue;
      const parent = el.parentElement;
      if (parent && parent !== document.body && parent !== document.documentElement) {
        const vid = parent.querySelector('video');
        if (vid && isVisible(vid) && isCursorNearElement(vid, x, y)) return vid;

        const siblingMedia = parent.querySelector('img, canvas');
        if (siblingMedia && isVisible(siblingMedia) && isCursorNearElement(siblingMedia, x, y)) {
          return resolveMediaNode(siblingMedia);
        }
      }
    }

    // 6. Background image element
    for (const el of elements) {
      if (hasBackgroundImage(el)) return el;
    }

    // 7. Modal or player container under cursor
    for (const el of elements) {
      if (isModalElement(el)) {
        const modalMedia = findLargestMedia(el);
        if (modalMedia) return resolveMediaNode(modalMedia);
      }
    }

    // 8. Open modal in document
    const openModals = document.querySelectorAll(
      '[role="dialog"], [aria-modal="true"], .modal, .lightbox, .pswp, .viewer, [class*="viewer"], [class*="lightbox"], [class*="modal"]'
    );
    for (const modal of openModals) {
      if (isVisible(modal)) {
        const media = findLargestMedia(modal);
        if (media) return resolveMediaNode(media);
      }
    }

    // 9. Largest visible media
    const largest = findLargestMedia(document);
    if (largest) {
      const rect = largest.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area >= (window.innerWidth * window.innerHeight * 0.1)) {
        return resolveMediaNode(largest);
      }
    }

    return null;
  }

  function saveOriginalStyles(el) {
    return {
      scale: el.style.scale,
      translate: el.style.translate,
      transform: el.style.transform,
      transformOrigin: el.style.transformOrigin,
      zIndex: el.style.zIndex,
      position: el.style.position,
      pointerEvents: el.style.pointerEvents
    };
  }

  function resetZoom(el) {
    const target = el || activeElement;
    if (!target) return;

    if (mediaObserver) {
      mediaObserver.disconnect();
      mediaObserver = null;
    }

    target.classList.remove('mza-zoomed', 'mza-dragging');
    if (activeState && activeState.originalStyles) {
      const orig = activeState.originalStyles;
      target.style.scale = orig.scale || '';
      target.style.translate = orig.translate || '';
      target.style.transform = orig.transform || '';
      target.style.transformOrigin = orig.transformOrigin || '';
      target.style.zIndex = orig.zIndex || '';
      target.style.position = orig.position || '';
      target.style.pointerEvents = orig.pointerEvents || '';
    } else {
      target.style.scale = '';
      target.style.translate = '';
      target.style.transform = '';
      target.style.transformOrigin = '';
      target.style.zIndex = '';
      target.style.position = '';
      target.style.pointerEvents = '';
    }

    // Restore overflow on parents
    if (activeState && activeState.overflowParents) {
      for (const item of activeState.overflowParents) {
        item.el.style.overflow = item.prevOverflow;
      }
    }

    if (badgeEl) {
      badgeEl.classList.remove('mza-visible');
    }

    activeElement = null;
    activeState = null;
    isDragging = false;
  }

  function applyTransform(el, scale, panX, panY) {
    if (supportsIndependentTransforms) {
      el.style.scale = `${scale.toFixed(3)}`;
      el.style.translate = `${panX.toFixed(2)}px ${panY.toFixed(2)}px`;
    } else {
      const base = activeState && activeState.baseTransform ? `${activeState.baseTransform} ` : '';
      el.style.transform = `${base}translate(${panX.toFixed(2)}px, ${panY.toFixed(2)}px) scale(${scale.toFixed(3)})`;
    }
  }

  // Observe media src changes to reset zoom when changing slides
  function observeMediaChanges(el) {
    if (mediaObserver) {
      mediaObserver.disconnect();
      mediaObserver = null;
    }

    mediaObserver = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.type === 'attributes') {
          const attr = m.attributeName;
          if (attr === 'src' || attr === 'srcset' || attr === 'poster' || attr === 'data-src') {
            resetZoom(el);
            return;
          }
        } else if (m.type === 'childList') {
          for (const node of m.addedNodes) {
            if (node.tagName && node.tagName.toLowerCase() === 'source') {
              resetZoom(el);
              return;
            }
          }
        }
      }
    });

    mediaObserver.observe(el, {
      attributes: true,
      attributeFilter: ['src', 'srcset', 'poster', 'data-src'],
      childList: true
    });
  }

  // Wheel event interception
  function onWheel(e) {
    if (!config.enabled) return;

    // SCENARIO 1: NORMAL WHEEL WITHOUT MODIFIER
    // When already zoomed in (> 100%), scrolling the wheel allows panning vertically/horizontally
    // to smoothly move the focus higher/lower on the media!
    if (!isModifierPressed(e)) {
      if (activeElement && activeState && activeState.scale > 1.0) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (e.shiftKey) {
          // Horizontal pan with Shift
          activeState.panX -= (e.deltaY || e.deltaX) * config.wheelPanSpeed;
        } else {
          // Vertical pan to move focus higher / lower
          activeState.panY -= e.deltaY * config.wheelPanSpeed;
          if (e.deltaX) {
            activeState.panX -= e.deltaX * config.wheelPanSpeed;
          }
        }

        applyTransform(activeElement, activeState.scale, activeState.panX, activeState.panY);
        return;
      }
      return; // If not zoomed in, let normal wheel scroll/flip slides as usual
    }

    // SCENARIO 2: MODIFIER (Ctrl) + WHEEL: ZOOM IN / OUT
    const targetMedia = findTargetMedia(e);
    if (!targetMedia) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    // If target changed, reset previous
    if (activeElement && activeElement !== targetMedia) {
      resetZoom(activeElement);
    }

    // Initialize state if new element
    if (activeElement !== targetMedia) {
      activeElement = targetMedia;

      const currentTransform = targetMedia.style.transform || '';
      let baseTransform = '';
      if (!supportsIndependentTransforms && currentTransform) {
        baseTransform = currentTransform;
      }

      const initRect = targetMedia.getBoundingClientRect();

      activeState = {
        scale: 1.0,
        panX: 0,
        panY: 0,
        origCenterX: initRect.left + initRect.width / 2,
        origCenterY: initRect.top + initRect.height / 2,
        baseTransform: baseTransform,
        originalStyles: saveOriginalStyles(targetMedia),
        overflowParents: []
      };

      const computed = window.getComputedStyle(targetMedia);
      if (computed.position === 'static') {
        targetMedia.style.position = 'relative';
      }
      targetMedia.style.zIndex = '2147483646';
      targetMedia.classList.add('mza-zoomed');

      // Lift overflow:hidden on parents
      let p = targetMedia.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        const pStyle = window.getComputedStyle(p);
        if (pStyle.overflow === 'hidden' || pStyle.overflowX === 'hidden' || pStyle.overflowY === 'hidden') {
          activeState.overflowParents.push({ el: p, prevOverflow: p.style.overflow });
          p.style.overflow = 'visible';
        }
        p = p.parentElement;
      }

      observeMediaChanges(targetMedia);
    }

    // Calculate scale factor
    const factor = e.deltaY < 0 ? config.zoomSpeed : (1 / config.zoomSpeed);
    const prevScale = activeState.scale;
    let nextScale = prevScale * factor;

    if (nextScale <= config.minZoom * 1.02) {
      resetZoom(targetMedia);
      showBadge('100%', e.clientX, e.clientY);
      return;
    }

    if (nextScale > config.maxZoom) {
      nextScale = config.maxZoom;
    }

    const effectiveFactor = nextScale / prevScale;

    // Anchor zoom relative to invariant center and cursor
    const curX = e.clientX - activeState.origCenterX;
    const curY = e.clientY - activeState.origCenterY;

    activeState.panX = curX * (1 - effectiveFactor) + activeState.panX * effectiveFactor;
    activeState.panY = curY * (1 - effectiveFactor) + activeState.panY * effectiveFactor;
    activeState.scale = nextScale;

    applyTransform(targetMedia, activeState.scale, activeState.panX, activeState.panY);
    showBadge(`${Math.round(nextScale * 100)}%`, e.clientX, e.clientY);
  }

  // Pointer & Mouse Down handling
  function onPointerDown(e) {
    if (!activeElement || !activeState || activeState.scale <= 1.0) return;
    if (e.button !== 0 && e.button !== 1) return;

    // Allow user to click real video controls (play/pause, volume, timeline scrubber) without dragging
    if (isControlElement(e.target)) {
      return;
    }

    if (isEventOnActiveMedia(e)) {
      isDragging = true;
      hasDragged = false;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      startPanX = activeState.panX;
      startPanY = activeState.panY;

      activeElement.classList.add('mza-dragging');

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  // Pointer & Mouse Move handling
  function onPointerMove(e) {
    if (!isDragging || !activeElement || !activeState) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      hasDragged = true;
    }

    activeState.panX = startPanX + dx;
    activeState.panY = startPanY + dy;

    applyTransform(activeElement, activeState.scale, activeState.panX, activeState.panY);

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  // Pointer & Mouse Up handling
  function onPointerUp(e) {
    if (!isDragging) return;
    isDragging = false;

    if (activeElement) {
      activeElement.classList.remove('mza-dragging');
    }

    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  // Prevent accidental clicks after drag
  function onClick(e) {
    if (hasDragged) {
      hasDragged = false;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    // If user clicked any navigation button or outside controls, reset zoom
    if (activeElement && activeState && activeState.scale > 1.0) {
      const clickedEl = e.target;
      if (clickedEl !== activeElement && !activeElement.contains(clickedEl)) {
        const tag = clickedEl.tagName ? clickedEl.tagName.toLowerCase() : '';
        const role = clickedEl.getAttribute ? clickedEl.getAttribute('role') : '';
        const cls = String(clickedEl.className || '').toLowerCase();
        if (
          tag === 'button' || tag === 'a' || tag === 'svg' || tag === 'path' ||
          role === 'button' || cls.includes('arrow') || cls.includes('next') ||
          cls.includes('prev') || cls.includes('nav') || cls.includes('dot') ||
          cls.includes('thumb') || cls.includes('close')
        ) {
          resetZoom(activeElement);
        }
      }
    }
  }

  function onDoubleClick(e) {
    if (!activeElement || !activeState || activeState.scale <= 1.0) return;
    if (isControlElement(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    resetZoom(activeElement);
  }

  // Key navigation resets zoom
  function onKeyDown(e) {
    if (!activeElement) return;

    if (e.key === 'Escape') {
      resetZoom(activeElement);
      return;
    }

    const navKeys = ['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', 'PageDown', 'PageUp', 'Home', 'End'];
    if (navKeys.includes(e.key)) {
      resetZoom(activeElement);
    }
  }

  // Listeners with capture phase
  window.addEventListener('wheel', onWheel, { capture: true, passive: false });
  document.addEventListener('wheel', onWheel, { capture: true, passive: false });

  window.addEventListener('pointerdown', onPointerDown, { capture: true });
  window.addEventListener('pointermove', onPointerMove, { capture: true });
  window.addEventListener('pointerup', onPointerUp, { capture: true });

  window.addEventListener('mousedown', onPointerDown, { capture: true });
  window.addEventListener('mousemove', onPointerMove, { capture: true });
  window.addEventListener('mouseup', onPointerUp, { capture: true });

  window.addEventListener('click', onClick, { capture: true });
  window.addEventListener('dblclick', onDoubleClick, { capture: true });
  window.addEventListener('keydown', onKeyDown, { capture: true });
})();
