(() => {
  // Configuration
  const config = {
    enabled: true,
    modifierKey: 'ctrl',
    zoomSpeed: 1.15,
    maxZoom: 20.0,
    minZoom: 1.0,
    wheelPanSpeed: 1.0,
    badgeTimeout: 1200,
    hideScrollbars: true,
    keyboardZoomEnabled: false,
    kbdZoomIn: { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowUp', key: 'ArrowUp' },
    kbdZoomOut: { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowDown', key: 'ArrowDown' }
  };

  // Check support for individual transform properties (Chrome 104+)
  const supportsIndependentTransforms = ('scale' in document.documentElement.style && 'translate' in document.documentElement.style);

  function updateScrollbarState(isZoomed) {
    if (isZoomed && config.hideScrollbars) {
      document.documentElement.classList.add('mza-hide-scrollbars');
    } else {
      document.documentElement.classList.remove('mza-hide-scrollbars');
    }
  }

  // Load saved settings
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
    chrome.storage.sync.get([
      'enabled', 'modifierKey', 'zoomSpeed', 'maxZoom',
      'hideScrollbars', 'keyboardZoomEnabled', 'kbdZoomIn', 'kbdZoomOut'
    ], (items) => {
      if (items.enabled !== undefined) config.enabled = items.enabled;
      if (items.modifierKey) config.modifierKey = items.modifierKey;
      if (items.zoomSpeed) config.zoomSpeed = Number(items.zoomSpeed);
      if (items.maxZoom) config.maxZoom = Number(items.maxZoom);
      if (items.hideScrollbars !== undefined) config.hideScrollbars = items.hideScrollbars;
      if (items.keyboardZoomEnabled !== undefined) config.keyboardZoomEnabled = items.keyboardZoomEnabled;
      if (items.kbdZoomIn) config.kbdZoomIn = items.kbdZoomIn;
      if (items.kbdZoomOut) config.kbdZoomOut = items.kbdZoomOut;
    });

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' || area === 'local') {
        if (changes.enabled) config.enabled = changes.enabled.newValue;
        if (changes.modifierKey) config.modifierKey = changes.modifierKey.newValue;
        if (changes.zoomSpeed) config.zoomSpeed = Number(changes.zoomSpeed.newValue);
        if (changes.maxZoom) config.maxZoom = Number(changes.maxZoom.newValue);
        if (changes.hideScrollbars) {
          config.hideScrollbars = changes.hideScrollbars.newValue;
          updateScrollbarState(Boolean(activeElement && activeState && activeState.scale > 1.0));
        }
        if (changes.keyboardZoomEnabled) config.keyboardZoomEnabled = changes.keyboardZoomEnabled.newValue;
        if (changes.kbdZoomIn) config.kbdZoomIn = changes.kbdZoomIn.newValue;
        if (changes.kbdZoomOut) config.kbdZoomOut = changes.kbdZoomOut.newValue;
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
  let lastMouseX = -1;
  let lastMouseY = -1;

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
    if (config.modifierKey === 'ctrl') return e.ctrlKey || e.metaKey;
    if (config.modifierKey === 'alt') return e.altKey;
    if (config.modifierKey === 'shift') return e.shiftKey;
    if (config.modifierKey === 'cmd') return e.metaKey;
    return e.ctrlKey || e.metaKey;
  }

  function isVisible(el) {
    if (!el || !(el instanceof Element) || !document.contains(el)) return false;
    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true })) {
        return false;
      }
    }
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

  function isWatermarkOrOverlay(el) {
    if (!el || !(el instanceof Element)) return false;
    const str = `${el.className || ''} ${el.id || ''} ${el.getAttribute('data-testid') || ''} ${el.getAttribute('aria-label') || ''}`.toLowerCase();
    if (/watermark|wm-layer|wm_|protect|shield|stamp|backdrop|vignette|click-blocker|click-catcher/i.test(str)) {
      return true;
    }
    return false;
  }

  function isModalElement(el) {
    if (!el || !(el instanceof Element)) return false;
    const role = el.getAttribute ? el.getAttribute('role') : null;
    const className = String(el.className || '').toLowerCase();
    return (
      role === 'dialog' ||
      el.hasAttribute('aria-modal') ||
      className.includes('modal') ||
      className.includes('lightbox') ||
      className.includes('viewer') ||
      className.includes('dialog') ||
      className.includes('gallery') ||
      className.includes('carousel') ||
      className.includes('slider') ||
      className.includes('swiper') ||
      className.includes('player') ||
      className.includes('pswp') ||
      className.includes('fancybox')
    );
  }

  function findLargestMedia(container = document) {
    // 1. Highest priority: visible <video>
    const videos = container.querySelectorAll('video');
    for (const v of videos) {
      if (isVisible(v) && !isWatermarkOrOverlay(v)) return v;
    }

    // 2. Second priority: visible <img> / picture (filtering out watermarks and tiny icons)
    const list = container.querySelectorAll('img, picture');
    let bestImg = null;
    let maxImgArea = 0;
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    for (const item of list) {
      const el = resolveMediaNode(item);
      if (!isVisible(el) || isWatermarkOrOverlay(el)) continue;
      const rect = el.getBoundingClientRect();
      // Ignore tiny icons / avatars (< 50x50)
      if (rect.width < 50 || rect.height < 50) continue;
      if (rect.right < 0 || rect.bottom < 0 || rect.left > vpW || rect.top > vpH) continue;
      const visibleW = Math.min(rect.right, vpW) - Math.max(rect.left, 0);
      const visibleH = Math.min(rect.bottom, vpH) - Math.max(rect.top, 0);
      const area = visibleW * visibleH;
      if (area > maxImgArea) {
        maxImgArea = area;
        bestImg = el;
      }
    }
    if (bestImg) return bestImg;

    // 3. Third priority: <canvas> (only if not a watermark and reasonable size >= 80x80)
    const canvases = container.querySelectorAll('canvas');
    let bestCanvas = null;
    let maxCanvasArea = 0;
    for (const c of canvases) {
      if (!isVisible(c) || isWatermarkOrOverlay(c)) continue;
      const rect = c.getBoundingClientRect();
      if (rect.width < 80 || rect.height < 80) continue;
      const area = rect.width * rect.height;
      if (area > maxCanvasArea) {
        maxCanvasArea = area;
        bestCanvas = c;
      }
    }
    return bestCanvas;
  }

  function getActiveViewer(x, y) {
    const elements = (x !== undefined && y !== undefined) ? (document.elementsFromPoint(x, y) || []) : [];

    // 1. Check elements under cursor or their ancestors
    for (const el of elements) {
      if (el === document.body || el === document.documentElement) continue;
      if (isModalElement(el) && isVisible(el)) return el;
      const parentModal = el.closest(
        '[role="dialog"], [aria-modal="true"], .pswp, .viewer-container, .fancybox__container, ' +
        '[class*="lightbox"], [class*="viewer"], [class*="modal"], [class*="gallery"], [class*="player"]'
      );
      if (parentModal && isVisible(parentModal)) return parentModal;
    }

    // 2. Check for full-screen fixed/absolute overlay under cursor
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    for (const el of elements) {
      if (el === document.body || el === document.documentElement) continue;
      const style = window.getComputedStyle(el);
      if ((style.position === 'fixed' || style.position === 'absolute') && isVisible(el)) {
        const rect = el.getBoundingClientRect();
        if (rect.width >= vpW * 0.65 && rect.height >= vpH * 0.65) {
          return el;
        }
      }
    }

    // 3. Check document-wide for active/open modals or players
    const openModals = document.querySelectorAll(
      '[role="dialog"]:not([aria-hidden="true"]), [aria-modal="true"], .pswp--open, .viewer-container, ' +
      '.lightbox.active, .lightbox.open, .lightbox.show, .modal.show, .modal.active, .modal.open, .modal.is-active, ' +
      '.html5-video-player, #movie_player'
    );
    for (const m of openModals) {
      if (isVisible(m)) return m;
    }

    return null;
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

    // Check if event target is inside player container of activeElement (e.g. #movie_player / .video-container)
    for (const el of path) {
      if (!el || !(el instanceof Element)) continue;
      if (
        el.contains(activeElement) &&
        (el.id === 'movie_player' || el.classList.contains('html5-video-player') || el.classList.contains('video-container') ||
         String(el.className || '').toLowerCase().includes('player'))
      ) {
        return true;
      }
    }

    // Check if target is a direct overlay/watermark sitting on top of activeElement
    const target = e.target;
    if (target && target instanceof Element) {
      if (isWatermarkOrOverlay(target) && activeElement.parentElement && activeElement.parentElement.contains(target)) {
        return true;
      }
    }

    return false;
  }

  function isWheelOverActiveMedia(e) {
    if (!activeElement || !activeState) return false;
    const path = e.composedPath ? e.composedPath() : [];
    if (path.includes(activeElement)) return true;

    for (const el of path) {
      if (!el || !(el instanceof Element)) continue;
      if (
        el.contains(activeElement) &&
        (el.id === 'movie_player' || el.classList.contains('html5-video-player') || el.classList.contains('video-container'))
      ) {
        return true;
      }
    }

    const rect = activeElement.getBoundingClientRect();
    if (e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom) {
      return true;
    }

    return false;
  }

  // Detect real interactive player controls (buttons, bars, sliders, seekbars) so clicks work normally while zoomed
  function isControlElement(target) {
    if (!target || !(target instanceof Element)) return false;
    const tag = (target.tagName || '').toLowerCase();
    if (tag === 'button' || tag === 'input' || tag === 'select' || tag === 'a') return true;
    if (target.getAttribute && (target.getAttribute('role') === 'button' || target.getAttribute('role') === 'slider')) return true;

    if (target.closest('button, a, input, select, [role="button"], [role="slider"]')) {
      return true;
    }

    // Compact player control bars (height <= 110px) so we never match a full-player overlay wrapper
    const controlBar = target.closest(
      '.ytp-chrome-bottom, .ytp-chrome-top, .vjs-control-bar, .plyr__controls, ' +
      '[class*="control"], [class*="progress"], [class*="timeline"], [class*="seek"], [class*="volume"], [class*="toolbar"]'
    );
    if (controlBar) {
      const barRect = controlBar.getBoundingClientRect();
      if (barRect.height > 0 && barRect.height <= 110) {
        return true;
      }
    }

    // Small clickable icons/elements with cursor: pointer
    if (activeState && activeState.origRect) {
      const tRect = target.getBoundingClientRect();
      const isSmall = tRect.width < activeState.origRect.width * 0.5 && tRect.height <= 90;
      if (isSmall && window.getComputedStyle(target).cursor === 'pointer') {
        return true;
      }
    }

    return false;
  }

  // Priority search for media
  function findTargetMedia(e) {
    const x = e.clientX;
    const y = e.clientY;

    // 1. If currently zoomed in, keep active element if cursor is near it or within same viewer/window,
    // unless user hovers directly over another distinct large content media (>= 150x150)
    if (activeElement && activeState && activeState.scale > 1.0 && isVisible(activeElement)) {
      if (isCursorNearElement(activeElement, x, y, 160)) {
        return activeElement;
      }
      const elementsAtPoint = document.elementsFromPoint(x, y) || [];
      let otherDistinctMedia = null;
      for (const el of elementsAtPoint) {
        if (el === activeElement || activeElement.contains(el)) continue;
        if ((el.tagName === 'IMG' || el.tagName === 'VIDEO') && isVisible(el) && !isWatermarkOrOverlay(el)) {
          const r = el.getBoundingClientRect();
          if (r.width >= 150 && r.height >= 150) {
            otherDistinctMedia = el;
            break;
          }
        }
      }
      if (!otherDistinctMedia) {
        return activeElement;
      }
    }

    // 2. CHECK ACTIVE VIEWER / MODAL / PLAYER:
    // If inside or interacting with an open lightbox/viewer/modal, ALWAYS prioritize the primary media in that viewer!
    const activeViewer = getActiveViewer(x, y);
    if (activeViewer) {
      const viewerMedia = findLargestMedia(activeViewer);
      if (viewerMedia) {
        return resolveMediaNode(viewerMedia);
      }
    }

    // 3. Check document.activeElement if focused (e.g. video player or focused media container)
    if (document.activeElement && document.activeElement !== document.body && document.activeElement !== document.documentElement) {
      const focused = document.activeElement;
      if (focused.tagName && focused.tagName.toLowerCase() === 'video' && isVisible(focused)) {
        return focused;
      }
      const playerContainer = focused.closest('.html5-video-player, #movie_player, [class*="player"]');
      if (playerContainer) {
        const vid = playerContainer.querySelector('video');
        if (vid && isVisible(vid)) return vid;
      }
    }

    const elements = document.elementsFromPoint(x, y) || [];
    const path = e.composedPath ? e.composedPath() : [];

    // 4. VIDEO PRIORITY: Check direct <video> under cursor or in path
    for (const el of elements) {
      if (el.tagName && el.tagName.toLowerCase() === 'video' && isVisible(el) && !isWatermarkOrOverlay(el)) {
        return el;
      }
    }

    for (const el of path) {
      if (el && el.tagName && el.tagName.toLowerCase() === 'video' && isVisible(el) && !isWatermarkOrOverlay(el)) {
        return el;
      }
      if (el && el.shadowRoot) {
        const vid = el.shadowRoot.querySelector('video');
        if (vid && isVisible(vid) && !isWatermarkOrOverlay(vid)) return vid;
      }
    }

    for (const el of elements) {
      if (el === document.body || el === document.documentElement) continue;
      const vid = el.querySelector('video');
      if (vid && isVisible(vid) && !isWatermarkOrOverlay(vid) && isCursorNearElement(vid, x, y)) {
        return vid;
      }
    }

    // 5. IMAGE PRIORITY UNDER CURSOR:
    // Collect all candidate images under cursor and pick the largest content image (filtering out watermarks & tiny icons)
    let bestImgUnderCursor = null;
    let bestImgArea = 0;

    for (const el of elements) {
      let candidate = null;
      if (el.tagName && (el.tagName.toLowerCase() === 'img' || el.tagName.toLowerCase() === 'picture')) {
        candidate = resolveMediaNode(el);
      } else if (el !== document.body && el !== document.documentElement) {
        const child = el.querySelector('img, picture');
        if (child && isCursorNearElement(child, x, y, 20)) {
          candidate = resolveMediaNode(child);
        }
      }
      if (candidate && isVisible(candidate) && !isWatermarkOrOverlay(candidate)) {
        const rect = candidate.getBoundingClientRect();
        if (rect.width >= 50 && rect.height >= 50) {
          const area = rect.width * rect.height;
          if (area > bestImgArea) {
            bestImgArea = area;
            bestImgUnderCursor = candidate;
          }
        }
      }
    }
    if (bestImgUnderCursor) {
      return bestImgUnderCursor;
    }

    for (const el of path) {
      if (!el || !(el instanceof Element)) continue;
      if (el.tagName && el.tagName.toLowerCase() === 'img' && isVisible(el) && !isWatermarkOrOverlay(el)) {
        return el;
      }
      if (el.shadowRoot) {
        const shadowImg = el.shadowRoot.querySelector('img');
        if (shadowImg && isVisible(shadowImg) && !isWatermarkOrOverlay(shadowImg)) return shadowImg;
      }
    }

    // 6. Parent / sibling wrapper for video or img
    for (const el of elements) {
      if (el === document.body || el === document.documentElement) continue;
      const parent = el.parentElement;
      if (parent && parent !== document.body && parent !== document.documentElement) {
        const vid = parent.querySelector('video');
        if (vid && isVisible(vid) && !isWatermarkOrOverlay(vid) && isCursorNearElement(vid, x, y)) return vid;

        const siblingMedia = parent.querySelector('img');
        if (siblingMedia && isVisible(siblingMedia) && !isWatermarkOrOverlay(siblingMedia) && isCursorNearElement(siblingMedia, x, y)) {
          return siblingMedia;
        }
      }
    }

    // 7. CANVAS PRIORITY (only if not a watermark and of substantial size >= 80x80)
    for (const el of elements) {
      if (el.tagName && el.tagName.toLowerCase() === 'canvas' && isVisible(el) && !isWatermarkOrOverlay(el)) {
        const r = el.getBoundingClientRect();
        if (r.width >= 80 && r.height >= 80) {
          return el;
        }
      }
    }

    // 8. Background image element
    for (const el of elements) {
      if (hasBackgroundImage(el) && !isWatermarkOrOverlay(el)) {
        const r = el.getBoundingClientRect();
        if (r.width >= 80 && r.height >= 80) return el;
      }
    }

    // 9. Document-wide fallback: largest visible media on page
    const largest = findLargestMedia(document);
    if (largest) {
      const rect = largest.getBoundingClientRect();
      const area = rect.width * rect.height;
      if (area >= (window.innerWidth * window.innerHeight * 0.08)) {
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

    document.documentElement.classList.remove('mza-dragging-active');
    updateScrollbarState(false);
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

    // Restore overflow on parents using setProperty / removeProperty with priority
    if (activeState && activeState.overflowParents) {
      for (const item of activeState.overflowParents) {
        if (item.modX) {
          if (item.prevOverflowX) {
            item.el.style.setProperty('overflow-x', item.prevOverflowX, item.prevOverflowXPriority || '');
          } else {
            item.el.style.removeProperty('overflow-x');
          }
        }
        if (item.modY) {
          if (item.prevOverflowY) {
            item.el.style.setProperty('overflow-y', item.prevOverflowY, item.prevOverflowYPriority || '');
          } else {
            item.el.style.removeProperty('overflow-y');
          }
        }
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
      el.style.setProperty('scale', `${scale.toFixed(3)}`, 'important');
      el.style.setProperty('translate', `${panX.toFixed(2)}px ${panY.toFixed(2)}px`, 'important');
    } else {
      const base = activeState && activeState.baseTransform ? `${activeState.baseTransform} ` : '';
      el.style.setProperty('transform', `${base}translate(${panX.toFixed(2)}px, ${panY.toFixed(2)}px) scale(${scale.toFixed(3)})`, 'important');
    }
  }

  // Observe media src changes to reset zoom when changing slides/videos
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
    // ONLY when cursor is actually over the zoomed media!
    if (!isModifierPressed(e)) {
      if (activeElement && activeState && activeState.scale > 1.0) {
        // Auto-reset if media was detached or hidden (e.g. modal closed)
        if (!document.contains(activeElement) || !isVisible(activeElement)) {
          resetZoom(activeElement);
          return;
        }

        // Only intercept wheel if cursor is over the zoomed media/player; otherwise let the webpage scroll normally!
        if (!isWheelOverActiveMedia(e)) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        if (e.shiftKey) {
          activeState.panX -= (e.deltaY || e.deltaX) * config.wheelPanSpeed;
        } else {
          activeState.panY -= e.deltaY * config.wheelPanSpeed;
          if (e.deltaX) {
            activeState.panX -= e.deltaX * config.wheelPanSpeed;
          }
        }

        applyTransform(activeElement, activeState.scale, activeState.panX, activeState.panY);
        return;
      }
      return;
    }

    // SCENARIO 2: MODIFIER (Ctrl/Cmd) + WHEEL: ZOOM IN / OUT
    const targetMedia = findTargetMedia(e);
    if (!targetMedia) return;

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    const factor = e.deltaY < 0 ? config.zoomSpeed : (1 / config.zoomSpeed);
    applyZoomStep(targetMedia, factor, e.clientX, e.clientY);
  }

  // Shared zoom initializer and scaler (focalX/focalY null => zooms into media center)
  function applyZoomStep(targetMedia, factor, focalX, focalY) {
    if (!targetMedia) return;

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
        origRect: initRect,
        origCenterX: initRect.left + initRect.width / 2,
        origCenterY: initRect.top + initRect.height / 2,
        baseTransform: baseTransform,
        originalStyles: saveOriginalStyles(targetMedia),
        overflowParents: []
      };

      const isVideo = targetMedia.tagName && targetMedia.tagName.toLowerCase() === 'video';
      const inModal = Boolean(targetMedia.closest('[role="dialog"], [aria-modal="true"], .modal, .lightbox, .pswp, .viewer, [class*="viewer"], [class*="lightbox"], [class*="modal"]'));
      const computed = window.getComputedStyle(targetMedia);
      if (computed.position === 'static') {
        targetMedia.style.position = 'relative';
      }
      // Keep <video> and modal/lightbox media below player/lightbox UI toolbars and close buttons!
      if (!isVideo && !inModal) {
        targetMedia.style.zIndex = '2147483646';
      }
      targetMedia.classList.add('mza-zoomed');

      // Lift overflow:hidden on direct container parents only for inline thumbnails (not videos or modal viewers, so controls/close buttons stay unobstructed)
      if (!isVideo && !inModal) {
        let p = targetMedia.parentElement;
        let depth = 0;
        while (p && p !== document.body && p !== document.documentElement && depth < 5) {
          const pStyle = window.getComputedStyle(p);
          const isScrollableY = (pStyle.overflowY === 'auto' || pStyle.overflowY === 'scroll') && p.scrollHeight > p.clientHeight;
          const isScrollableX = (pStyle.overflowX === 'auto' || pStyle.overflowX === 'scroll') && p.scrollWidth > p.clientWidth;

          const modX = !isScrollableX && pStyle.overflowX === 'hidden';
          const modY = !isScrollableY && pStyle.overflowY === 'hidden';

          if (modX || modY) {
            activeState.overflowParents.push({
              el: p,
              modX: modX,
              modY: modY,
              prevOverflowX: p.style.overflowX,
              prevOverflowXPriority: p.style.getPropertyPriority('overflow-x'),
              prevOverflowY: p.style.overflowY,
              prevOverflowYPriority: p.style.getPropertyPriority('overflow-y')
            });
            if (modX) p.style.setProperty('overflow-x', 'visible', 'important');
            if (modY) p.style.setProperty('overflow-y', 'visible', 'important');
          }
          p = p.parentElement;
          depth++;
        }
      }

      observeMediaChanges(targetMedia);
    }

    const prevScale = activeState.scale;
    let nextScale = prevScale * factor;

    const badgeX = focalX !== null ? focalX : activeState.origCenterX;
    const badgeY = focalY !== null ? focalY : activeState.origCenterY;

    if (nextScale <= config.minZoom * 1.02) {
      resetZoom(targetMedia);
      showBadge('100%', badgeX, badgeY);
      return;
    }

    if (nextScale > config.maxZoom) {
      nextScale = config.maxZoom;
    }

    const effectiveFactor = nextScale / prevScale;

    // Anchor zoom relative to invariant center and focal point (center if keyboard zoom)
    const curX = focalX !== null ? (focalX - activeState.origCenterX) : 0;
    const curY = focalY !== null ? (focalY - activeState.origCenterY) : 0;

    activeState.panX = curX * (1 - effectiveFactor) + activeState.panX * effectiveFactor;
    activeState.panY = curY * (1 - effectiveFactor) + activeState.panY * effectiveFactor;
    activeState.scale = nextScale;

    updateScrollbarState(true);
    applyTransform(targetMedia, activeState.scale, activeState.panX, activeState.panY);
    showBadge(`${Math.round(nextScale * 100)}%`, badgeX, badgeY);
  }

  // Pointer & Mouse Down handling
  function onPointerDown(e) {
    if (!activeElement || !activeState || activeState.scale <= 1.0) return;
    if (e.button !== 0 && e.button !== 1) return;

    // Allow user to click real controls (close button, arrows, player bars) without dragging or shifting layout before click completes
    if (isControlElement(e.target)) {
      return;
    }
    if (
      activeElement.tagName &&
      activeElement.tagName.toLowerCase() === 'video' &&
      activeElement.hasAttribute('controls') &&
      activeState.origRect &&
      e.clientY >= activeState.origRect.bottom - 55
    ) {
      return;
    }

    // Only capture drag if clicking inside active media area; outside clicks pass cleanly to onClick
    if (!isEventOnActiveMedia(e)) {
      return;
    }

    isDragging = true;
    hasDragged = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    startPanX = activeState.panX;
    startPanY = activeState.panY;

    activeElement.classList.add('mza-dragging');
    document.documentElement.classList.add('mza-dragging-active');

    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  // Pointer & Mouse Move handling
  function onPointerMove(e) {
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;

    if (!isDragging || !activeElement || !activeState) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
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

    document.documentElement.classList.remove('mza-dragging-active');
    if (activeElement) {
      activeElement.classList.remove('mza-dragging');
    }

    if (hasDragged) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }

  // Prevent accidental clicks after drag, and reset zoom on outside clicks or modal close
  function onClick(e) {
    if (hasDragged) {
      hasDragged = false;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    if (activeElement && activeState && activeState.scale > 1.0) {
      // If user clicked outside the zoomed media/player, reset zoom cleanly AFTER the click fires on the target!
      if (!isEventOnActiveMedia(e)) {
        resetZoom(activeElement);
        return;
      }

      const clickedEl = e.target;
      if (clickedEl !== activeElement && !activeElement.contains(clickedEl)) {
        const cls = String(clickedEl.className || '').toLowerCase();
        if (
          cls.includes('swiper-button') || cls.includes('slick-arrow') ||
          cls.includes('pswp__button--arrow') || cls.includes('gallery-next') ||
          cls.includes('gallery-prev') || cls.includes('close')
        ) {
          resetZoom(activeElement);
          return;
        }
      }

      // Check after click in case the click closed a lightbox/modal (including animated fade-outs)
      const prevEl = activeElement;
      [60, 250, 450].forEach((delay) => {
        setTimeout(() => {
          if (activeElement === prevEl && (!document.contains(prevEl) || !isVisible(prevEl))) {
            resetZoom(prevEl);
          }
        }, delay);
      });
    }
  }

  function onDoubleClick(e) {
    if (!activeElement || !activeState || activeState.scale <= 1.0) return;
    if (isControlElement(e.target)) return;
    e.preventDefault();
    e.stopPropagation();
    resetZoom(activeElement);
  }

  function isTypingTarget(el) {
    if (!el || !(el instanceof Element)) return false;
    const tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }

  function matchesKeyCombo(e, combo) {
    if (!combo) return false;
    const ctrlMatch = Boolean(combo.ctrl) === Boolean(e.ctrlKey);
    const altMatch = Boolean(combo.alt) === Boolean(e.altKey);
    const shiftMatch = Boolean(combo.shift) === Boolean(e.shiftKey);
    const metaMatch = Boolean(combo.meta) === Boolean(e.metaKey);
    if (!ctrlMatch || !altMatch || !shiftMatch || !metaMatch) return false;

    if (combo.code && e.code === combo.code) return true;
    if (combo.key && e.key && e.key.toLowerCase() === combo.key.toLowerCase()) return true;
    return false;
  }

  const blockedKeyCodes = new Set();

  function blockKeyEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  }

  function onKeyUpOrPress(e) {
    if (blockedKeyCodes.has(e.code)) {
      blockKeyEvent(e);
      if (e.type === 'keyup') {
        blockedKeyCodes.delete(e.code);
      }
    }
  }

  // Keyboard zoom + navigation resets
  function onKeyDown(e) {
    if (config.enabled && config.keyboardZoomEnabled && !isTypingTarget(e.target)) {
      const isZoomIn = matchesKeyCombo(e, config.kbdZoomIn);
      const isZoomOut = !isZoomIn && matchesKeyCombo(e, config.kbdZoomOut);

      if (isZoomIn || isZoomOut) {
        let target = (activeElement && isVisible(activeElement)) ? activeElement : null;
        if (!target) {
          const viewer = getActiveViewer(lastMouseX >= 0 ? lastMouseX : undefined, lastMouseY >= 0 ? lastMouseY : undefined);
          if (viewer) {
            target = findLargestMedia(viewer);
          }
        }
        if (!target && lastMouseX >= 0 && lastMouseY >= 0) {
          target = findTargetMedia({ clientX: lastMouseX, clientY: lastMouseY });
        }
        if (!target) {
          target = findLargestMedia(document);
        }

        if (target) {
          blockKeyEvent(e);
          if (e.code) blockedKeyCodes.add(e.code);
          const factor = isZoomIn ? config.zoomSpeed : (1 / config.zoomSpeed);
          applyZoomStep(target, factor, null, null);
          return;
        }
      }
    }

    if (!activeElement) return;

    if (e.key === 'Escape') {
      resetZoom(activeElement);
      return;
    }

    // Only reset on gallery navigation keys if not in a video player (to avoid breaking arrow seeking)
    if (activeElement.tagName && activeElement.tagName.toLowerCase() === 'video') {
      return;
    }

    const navKeys = ['PageDown', 'PageUp', 'Home', 'End'];
    if (navKeys.includes(e.key)) {
      resetZoom(activeElement);
    }
  }

  // Clear stuck drag states on Alt+Tab or window blur
  function onWindowBlur() {
    isDragging = false;
    hasDragged = false;
    blockedKeyCodes.clear();
    document.documentElement.classList.remove('mza-dragging-active');
    if (activeElement) {
      activeElement.classList.remove('mza-dragging');
      if (!document.contains(activeElement) || !isVisible(activeElement)) {
        resetZoom(activeElement);
      }
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
  window.addEventListener('keypress', onKeyUpOrPress, { capture: true });
  window.addEventListener('keyup', onKeyUpOrPress, { capture: true });
  document.addEventListener('keydown', onKeyDown, { capture: true });
  document.addEventListener('keypress', onKeyUpOrPress, { capture: true });
  document.addEventListener('keyup', onKeyUpOrPress, { capture: true });
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) onWindowBlur();
  });
})();
