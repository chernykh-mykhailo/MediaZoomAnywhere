(() => {
  // Configuration
  const config = {
    enabled: true,
    modifierKey: 'ctrl',
    zoomSpeed: 1.15,
    maxZoom: 20.0,
    minZoom: 1.0,
    badgeTimeout: 1200
  };

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
    if (tag === 'img' || tag === 'video' || tag === 'canvas') return true;
    if (tag === 'picture') return true;
    return false;
  }

  function resolveMediaNode(el) {
    if (!el) return null;
    if (el.tagName.toLowerCase() === 'picture') {
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

  // Find media inside ShadowRoot
  function findInShadowRoot(root) {
    if (!root) return null;
    return root.querySelector('video, img, canvas');
  }

  // Find the largest visible media in a given container or on the whole page
  function findLargestMedia(container = document) {
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

  // Find media element under cursor or in the active modal / viewer in focus
  function findTargetMedia(e) {
    const x = e.clientX;
    const y = e.clientY;

    // 1. If an element is already actively zoomed, keep it
    if (activeElement && activeState && activeState.scale > 1.0) {
      return activeElement;
    }

    // 2. Check composedPath (handles Shadow DOM and elements under cursor)
    const path = e.composedPath ? e.composedPath() : [];
    for (const el of path) {
      if (!el || !(el instanceof Element)) continue;
      if (isMediaNode(el)) return resolveMediaNode(el);
      if (el.shadowRoot) {
        const shadowMedia = findInShadowRoot(el.shadowRoot);
        if (shadowMedia) return shadowMedia;
      }
    }

    // 3. Inspect elementsFromPoint
    const elements = document.elementsFromPoint(x, y) || [];
    for (const el of elements) {
      if (isMediaNode(el)) return resolveMediaNode(el);
      if (el.shadowRoot) {
        const shadowMedia = findInShadowRoot(el.shadowRoot);
        if (shadowMedia) return shadowMedia;
      }
    }

    // 4. Check for background-image on elements directly under point
    for (const el of elements) {
      if (hasBackgroundImage(el)) return el;
    }

    // 5. Check if cursor is over a modal / lightbox / viewer container
    for (const el of elements) {
      const role = el.getAttribute ? el.getAttribute('role') : null;
      const className = String(el.className || '').toLowerCase();
      const isModalLike = (
        role === 'dialog' ||
        className.includes('modal') ||
        className.includes('lightbox') ||
        className.includes('viewer') ||
        className.includes('dialog') ||
        className.includes('overlay') ||
        className.includes('carousel') ||
        className.includes('slider') ||
        className.includes('swiper')
      );

      if (isModalLike) {
        const modalMedia = findLargestMedia(el);
        if (modalMedia) return resolveMediaNode(modalMedia);
      }
    }

    // 6. Check closest ancestor or child media near elements under cursor
    for (const el of elements) {
      const child = el.querySelector('video, img, canvas');
      if (child && isVisible(child)) {
        return resolveMediaNode(child);
      }
      const parent = el.parentElement;
      if (parent) {
        const siblingMedia = parent.querySelector('video, img, canvas');
        if (siblingMedia && isVisible(siblingMedia)) {
          return resolveMediaNode(siblingMedia);
        }
      }
    }

    // 7. Fallback: If a modal / lightbox covers the screen, find the open media in focus
    const modalContainers = document.querySelectorAll(
      '[role="dialog"], [aria-modal="true"], .modal, .lightbox, .pswp, .viewer, [class*="viewer"], [class*="lightbox"], [class*="modal"]'
    );
    for (const modal of modalContainers) {
      if (isVisible(modal)) {
        const media = findLargestMedia(modal);
        if (media) return resolveMediaNode(media);
      }
    }

    // 8. Global fallback: Largest visible media on screen (media in focus)
    const largest = findLargestMedia(document);
    if (largest) {
      const rect = largest.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area >= (window.innerWidth * window.innerHeight * 0.12)) {
        return resolveMediaNode(largest);
      }
    }

    return null;
  }

  function saveOriginalStyles(el) {
    return {
      transform: el.style.transform,
      transformOrigin: el.style.transformOrigin,
      zIndex: el.style.zIndex,
      position: el.style.position
    };
  }

  function resetZoom(el) {
    if (!el || !activeState) return;

    el.classList.remove('mza-zoomed', 'mza-dragging');
    if (activeState.originalStyles) {
      el.style.transform = activeState.originalStyles.transform;
      el.style.transformOrigin = activeState.originalStyles.transformOrigin;
      el.style.zIndex = activeState.originalStyles.zIndex;
      el.style.position = activeState.originalStyles.position;
    } else {
      el.style.transform = '';
      el.style.transformOrigin = '';
      el.style.zIndex = '';
      el.style.position = '';
    }

    // Remove overflow overrides
    if (activeState.overflowParents) {
      for (const parent of activeState.overflowParents) {
        parent.style.overflow = '';
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
    const baseTransform = activeState && activeState.baseTransform ? `${activeState.baseTransform} ` : '';
    el.style.transform = `${baseTransform}translate(${panX.toFixed(2)}px, ${panY.toFixed(2)}px) scale(${scale.toFixed(3)})`;
  }

  // Intercept wheel event in capture phase before page scripts see it
  function onWheel(e) {
    if (!config.enabled) return;
    if (!isModifierPressed(e)) return;

    const targetMedia = findTargetMedia(e);
    if (!targetMedia) return;

    // CRUCIAL: Immediately stop browser zoom and site carousels
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    // Initialize state if new element
    if (activeElement !== targetMedia) {
      if (activeElement && activeState) {
        resetZoom(activeElement);
      }

      const currentTransform = targetMedia.style.transform || '';
      let baseTransform = '';
      if (currentTransform && !currentTransform.includes('translate(')) {
        baseTransform = currentTransform;
      }

      activeElement = targetMedia;
      activeState = {
        scale: 1.0,
        panX: 0,
        panY: 0,
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

      // Lift overflow:hidden on direct parent if needed so image isn't clipped
      let p = targetMedia.parentElement;
      while (p && p !== document.body && p !== document.documentElement) {
        const pStyle = window.getComputedStyle(p);
        if (pStyle.overflow === 'hidden' || pStyle.overflowX === 'hidden' || pStyle.overflowY === 'hidden') {
          activeState.overflowParents.push(p);
          p.style.overflow = 'visible';
        }
        p = p.parentElement;
      }
    }

    // Determine scale direction
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

    // Anchor zoom relative to cursor position
    const rect = targetMedia.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const cursorOffsetX = e.clientX - centerX;
    const cursorOffsetY = e.clientY - centerY;

    activeState.panX = cursorOffsetX * (1 - effectiveFactor) + activeState.panX * effectiveFactor;
    activeState.panY = cursorOffsetY * (1 - effectiveFactor) + activeState.panY * effectiveFactor;
    activeState.scale = nextScale;

    applyTransform(targetMedia, activeState.scale, activeState.panX, activeState.panY);
    showBadge(`${Math.round(nextScale * 100)}%`, e.clientX, e.clientY);
  }

  // Pan / Drag handling
  function onMouseDown(e) {
    if (!activeElement || !activeState || activeState.scale <= 1.0) return;
    if (e.button !== 0 && e.button !== 1) return;

    isDragging = true;
    hasDragged = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startPanX = activeState.panX;
    startPanY = activeState.panY;

    activeElement.classList.add('mza-dragging');
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!isDragging || !activeElement || !activeState) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasDragged = true;
    }

    activeState.panX = startPanX + dx;
    activeState.panY = startPanY + dy;

    applyTransform(activeElement, activeState.scale, activeState.panX, activeState.panY);
  }

  function onMouseUp(e) {
    if (!isDragging) return;
    isDragging = false;
    if (activeElement) {
      activeElement.classList.remove('mza-dragging');
    }
  }

  function onClick(e) {
    if (hasDragged) {
      hasDragged = false;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  function onDoubleClick(e) {
    if (!activeElement || !activeState || activeState.scale <= 1.0) return;
    e.preventDefault();
    e.stopPropagation();
    resetZoom(activeElement);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape' && activeElement) {
      resetZoom(activeElement);
    }
  }

  // Register capture listeners on window and document
  window.addEventListener('wheel', onWheel, { capture: true, passive: false });
  document.addEventListener('wheel', onWheel, { capture: true, passive: false });
  window.addEventListener('mousedown', onMouseDown, { capture: true });
  window.addEventListener('mousemove', onMouseMove, { capture: true });
  window.addEventListener('mouseup', onMouseUp, { capture: true });
  window.addEventListener('click', onClick, { capture: true });
  window.addEventListener('dblclick', onDoubleClick, { capture: true });
  window.addEventListener('keydown', onKeyDown, { capture: true });
})();
