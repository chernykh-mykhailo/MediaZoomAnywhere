(() => {
  // Configuration
  const config = {
    enabled: true,
    modifierKey: 'ctrl',
    customActivationKey: { ctrl: false, alt: false, shift: false, meta: false, code: 'KeyZ', key: 'z' },
    zoomSpeed: 1.35,
    maxZoom: 15.0,
    minZoom: 1.0,
    wheelPanSpeed: 1.0,
    badgeTimeout: 1200,
    hideScrollbars: true,
    keyboardZoomEnabled: true,
    kbdZoomIn: { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowUp', key: 'ArrowUp' },
    kbdZoomOut: { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowDown', key: 'ArrowDown' },
    kbdPanUp: { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowLeft', key: 'ArrowLeft' },
    kbdPanDown: { ctrl: true, alt: false, shift: false, meta: false, code: 'ArrowRight', key: 'ArrowRight' },
    keyboardPanEnabled: true,
    keyboardPanModifier: 'shift',
    customPanModifier: { ctrl: true, alt: false, shift: true, meta: false, code: '', key: '' },
    keyboardPanStep: 200,
    resetOnMediaChange: true,
    expandPreviewVideos: true,
    expandPlayerVideos: false
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
  const applyStoredSettings = (items) => {
    if (!items) return;
    if (items.enabled !== undefined) config.enabled = items.enabled;
    if (items.modifierKey) config.modifierKey = items.modifierKey;
    if (items.customActivationKey) config.customActivationKey = items.customActivationKey;
    if (items.zoomSpeed) config.zoomSpeed = Number(items.zoomSpeed);
    if (items.maxZoom) config.maxZoom = Number(items.maxZoom);
    if (items.hideScrollbars !== undefined) config.hideScrollbars = items.hideScrollbars;
    if (items.keyboardZoomEnabled !== undefined) config.keyboardZoomEnabled = items.keyboardZoomEnabled;
    if (items.kbdZoomIn) config.kbdZoomIn = items.kbdZoomIn;
    if (items.kbdZoomOut) config.kbdZoomOut = items.kbdZoomOut;
    if (items.kbdPanUp) config.kbdPanUp = items.kbdPanUp;
    if (items.kbdPanDown) config.kbdPanDown = items.kbdPanDown;
    if (items.keyboardPanEnabled !== undefined) config.keyboardPanEnabled = items.keyboardPanEnabled;
    if (items.keyboardPanModifier) config.keyboardPanModifier = items.keyboardPanModifier;
    if (items.customPanModifier) config.customPanModifier = items.customPanModifier;
    if (items.keyboardPanStep !== undefined) config.keyboardPanStep = Number(items.keyboardPanStep);
    if (items.resetOnMediaChange !== undefined) config.resetOnMediaChange = items.resetOnMediaChange;
    if (items.expandPreviewVideos !== undefined) {
      config.expandPreviewVideos = items.expandPreviewVideos;
    } else if (items.expandVideos !== undefined) {
      config.expandPreviewVideos = items.expandVideos;
    }
    if (items.expandPlayerVideos !== undefined) config.expandPlayerVideos = items.expandPlayerVideos;
  };

  const keysToRead = [
    'enabled', 'modifierKey', 'customActivationKey', 'zoomSpeed', 'maxZoom',
    'hideScrollbars', 'keyboardZoomEnabled', 'kbdZoomIn', 'kbdZoomOut',
    'kbdPanUp', 'kbdPanDown', 'keyboardPanEnabled', 'keyboardPanModifier', 'customPanModifier', 'keyboardPanStep',
    'resetOnMediaChange', 'expandVideos', 'expandPreviewVideos', 'expandPlayerVideos'
  ];

  if (typeof chrome !== 'undefined' && chrome.storage) {
    if (chrome.storage.local) {
      chrome.storage.local.get(keysToRead, (localItems) => {
        applyStoredSettings(localItems);
      });
    }
    if (chrome.storage.sync) {
      try {
        chrome.storage.sync.get(keysToRead, (syncItems) => {
          if (!chrome.runtime.lastError && syncItems) {
            applyStoredSettings(syncItems);
          }
        });
      } catch (e) {}
    }

    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'sync' || area === 'local') {
        if (changes.enabled) config.enabled = changes.enabled.newValue;
        if (changes.modifierKey) config.modifierKey = changes.modifierKey.newValue;
        if (changes.customActivationKey) config.customActivationKey = changes.customActivationKey.newValue;
        if (changes.zoomSpeed) config.zoomSpeed = Number(changes.zoomSpeed.newValue);
        if (changes.maxZoom) config.maxZoom = Number(changes.maxZoom.newValue);
        if (changes.hideScrollbars) {
          config.hideScrollbars = changes.hideScrollbars.newValue;
          updateScrollbarState(Boolean(activeElement && activeState && activeState.scale > 1.0));
        }
        if (changes.keyboardZoomEnabled) config.keyboardZoomEnabled = changes.keyboardZoomEnabled.newValue;
        if (changes.kbdZoomIn) config.kbdZoomIn = changes.kbdZoomIn.newValue;
        if (changes.kbdZoomOut) config.kbdZoomOut = changes.kbdZoomOut.newValue;
        if (changes.kbdPanUp) config.kbdPanUp = changes.kbdPanUp.newValue;
        if (changes.kbdPanDown) config.kbdPanDown = changes.kbdPanDown.newValue;
        if (changes.keyboardPanEnabled) config.keyboardPanEnabled = changes.keyboardPanEnabled.newValue;
        if (changes.keyboardPanModifier) config.keyboardPanModifier = changes.keyboardPanModifier.newValue;
        if (changes.customPanModifier) config.customPanModifier = changes.customPanModifier.newValue;
        if (changes.keyboardPanStep) config.keyboardPanStep = Number(changes.keyboardPanStep.newValue);
        if (changes.resetOnMediaChange) config.resetOnMediaChange = changes.resetOnMediaChange.newValue;
        if (changes.expandPreviewVideos) config.expandPreviewVideos = changes.expandPreviewVideos.newValue;
        if (changes.expandVideos && !changes.expandPreviewVideos) config.expandPreviewVideos = changes.expandVideos.newValue;
        if (changes.expandPlayerVideos) config.expandPlayerVideos = changes.expandPlayerVideos.newValue;
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
  let pointerDownInPlayer = false;
  let lastMouseX = -1;
  let lastMouseY = -1;
  const heldKeyCodes = new Set();
  let isRightClickHeld = false;
  let lastRightClickZoomTime = 0;
  let wasZoomedWithRightClick = false;
  let wasZoomedWithSideButton = false;

  // Zoom badge element
  let badgeEl = null;
  let badgeTimer = null;

  function getOrCreateBadge() {
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    const targetParent = (fs && fs instanceof Element && fs.tagName.toLowerCase() !== 'video')
      ? fs
      : document.documentElement;

    if (!badgeEl || badgeEl.parentElement !== targetParent) {
      if (badgeEl && badgeEl.parentElement) {
        badgeEl.parentElement.removeChild(badgeEl);
      }
      badgeEl = document.createElement('div');
      badgeEl.className = 'mza-zoom-badge';
      targetParent.appendChild(badgeEl);
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
    if (config.modifierKey === 'custom' && config.customActivationKey) {
      const c = config.customActivationKey;
      if (c.code === 'MouseRight') {
        const isDown = isRightClickHeld || (e.buttons & 2) !== 0;
        if (isDown) {
          wasZoomedWithRightClick = true;
          lastRightClickZoomTime = Date.now();
        }
        return isDown;
      }
      if (c.code === 'MouseMiddle') return (e.buttons & 4) !== 0;
      if (c.code === 'MouseBack') {
        const isDown = (e.buttons & 8) !== 0;
        if (isDown) wasZoomedWithSideButton = true;
        return isDown;
      }
      if (c.code === 'MouseForward') {
        const isDown = (e.buttons & 16) !== 0;
        if (isDown) wasZoomedWithSideButton = true;
        return isDown;
      }

      if (c.ctrl && !(e.ctrlKey || e.metaKey)) return false;
      if (c.alt && !e.altKey) return false;
      if (c.shift && !e.shiftKey) return false;
      if (c.meta && !e.metaKey) return false;

      if (c.code) {
        return heldKeyCodes.has(c.code);
      }
      const ctrlMatch = Boolean(c.ctrl) === Boolean(e.ctrlKey || e.metaKey);
      const altMatch = Boolean(c.alt) === Boolean(e.altKey);
      const shiftMatch = Boolean(c.shift) === Boolean(e.shiftKey);
      const metaMatch = Boolean(c.meta) === Boolean(e.metaKey);
      return ctrlMatch && altMatch && shiftMatch && metaMatch;
    }
    return e.ctrlKey || e.metaKey;
  }

  function getElementClassString(el) {
    if (!el || !(el instanceof Element)) return '';
    return typeof el.className === 'string' ? el.className : (el.getAttribute('class') || '');
  }

  function getParentAcrossShadow(node) {
    if (!node) return null;
    if (node.parentElement) return node.parentElement;
    const root = node.getRootNode ? node.getRootNode() : null;
    if (root && typeof ShadowRoot !== 'undefined' && root instanceof ShadowRoot) {
      return root.host || null;
    }
    return null;
  }

  function isDescendantOrSelf(el, ancestor) {
    let cur = el;
    while (cur) {
      if (cur === ancestor) return true;
      cur = cur.parentNode || (typeof ShadowRoot !== 'undefined' && cur instanceof ShadowRoot ? cur.host : null);
    }
    return false;
  }

  function isSpacerOrTransparentShield(el) {
    if (!el || !(el instanceof Element)) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (tag === 'img' && el.complete && el.naturalWidth > 0 && el.naturalWidth <= 2 && el.naturalHeight <= 2) {
      return true;
    }
    return false;
  }

  function isVisible(el) {
    if (!el || !(el instanceof Element) || !el.isConnected) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return false;
    const style = window.getComputedStyle(el);
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      parseFloat(style.opacity) > 0.02
    );
  }

  function getVisibleClippedRect(el, stopAtAncestor = null) {
    if (!el || !(el instanceof Element) || !el.isConnected) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width < 10 || rect.height < 10) return null;

    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    const inFullscreen = Boolean(fs && (fs === el || isDescendantOrSelf(el, fs)));

    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    let left = Math.max(rect.left, 0);
    let top = Math.max(rect.top, 0);
    let right = Math.min(rect.right, vpW);
    let bottom = Math.min(rect.bottom, vpH);

    if (right <= left || bottom <= top) return null;

    // Fullscreen element is in Top Layer; nothing above it clips it
    if (inFullscreen && el === fs) {
      const width = right - left;
      const height = bottom - top;
      return { left, top, right, bottom, width, height, area: width * height };
    }

    const effectiveStopAt = stopAtAncestor || (inFullscreen ? fs : null);

    const elStyle = window.getComputedStyle(el);
    if (elStyle.position !== 'fixed') {
      let childIsAbsolute = elStyle.position === 'absolute';
      let p = getParentAcrossShadow(el);
      while (p && p !== document.documentElement) {
        if (p === effectiveStopAt || (inFullscreen && p === fs)) break;
        const pStyle = window.getComputedStyle(p);
        const isPositioned = pStyle.position !== 'static' || pStyle.transform !== 'none' || pStyle.filter !== 'none' || pStyle.contain === 'paint';
        const clipX = pStyle.overflowX === 'hidden' || pStyle.overflowX === 'clip' || pStyle.overflowX === 'scroll' || pStyle.overflowX === 'auto';
        const clipY = pStyle.overflowY === 'hidden' || pStyle.overflowY === 'clip' || pStyle.overflowY === 'scroll' || pStyle.overflowY === 'auto';

        if (!childIsAbsolute || isPositioned || pStyle.overflowX === 'clip' || pStyle.overflowY === 'clip') {
          if (clipX || clipY) {
            const pRect = p.getBoundingClientRect();
            if (clipX && (!childIsAbsolute || isPositioned || pStyle.overflowX === 'clip')) {
              left = Math.max(left, pRect.left);
              right = Math.min(right, pRect.right);
            }
            if (clipY && (!childIsAbsolute || isPositioned || pStyle.overflowY === 'clip')) {
              top = Math.max(top, pRect.top);
              bottom = Math.min(bottom, pRect.bottom);
            }
            if (right <= left || bottom <= top) return null;
          }
          if (isPositioned) {
            childIsAbsolute = pStyle.position === 'absolute';
          }
        }

        if (p === effectiveStopAt || (inFullscreen && p === fs) || pStyle.position === 'fixed') break;
        p = getParentAcrossShadow(p);
      }
    }

    const width = right - left;
    const height = bottom - top;
    if (width < 10 || height < 10) return null;
    return { left, top, right, bottom, width, height, area: width * height };
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
    const str = `${getElementClassString(el)} ${el.id || ''} ${el.getAttribute('data-testid') || ''} ${el.getAttribute('aria-label') || ''}`.toLowerCase();
    if (/watermark|wm-layer|wm_|protect|shield|stamp|backdrop|vignette|click-blocker|click-catcher/i.test(str)) {
      return true;
    }
    return false;
  }

  function isOpaqueBackground(el) {
    if (!el || el === document.body || el === document.documentElement) return false;
    const style = window.getComputedStyle(el);
    if (parseFloat(style.opacity) < 0.85) return false;
    const bg = style.backgroundColor;
    if (!bg || bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') return false;
    const match = bg.match(/rgba?\(\s*[\d.]+\s*,\s*[\d.]+\s*,\s*[\d.]+(?:\s*[,/]\s*([\d.]+))?\s*\)/i);
    if (!match) return false;
    const alpha = match[1] !== undefined ? parseFloat(match[1]) : 1;
    return alpha >= 0.85;
  }

  function isInlineViewerElement(el) {
    if (!el || !(el instanceof Element)) return false;
    const role = el.getAttribute ? el.getAttribute('role') : null;
    const className = getElementClassString(el).toLowerCase();
    return (
      role === 'dialog' ||
      el.hasAttribute('aria-modal') ||
      className.includes('modal') ||
      className.includes('lightbox') ||
      className.includes('viewer') ||
      className.includes('dialog') ||
      className.includes('carousel') ||
      className.includes('slider') ||
      className.includes('swiper') ||
      className.includes('player') ||
      className.includes('pswp') ||
      className.includes('fancybox')
    );
  }

  function collectMediaNodes(container, includeShadow = false) {
    const results = [];
    const seen = new Set();

    function scan(root) {
      if (!root || !root.querySelectorAll) return;
      const nodes = root.querySelectorAll('video, img, picture, canvas');
      for (const n of nodes) {
        if (!seen.has(n)) {
          seen.add(n);
          results.push(n);
        }
      }
      if (includeShadow) {
        const all = root.querySelectorAll('*');
        for (const el of all) {
          if (el.shadowRoot) {
            scan(el.shadowRoot);
          }
        }
      }
    }

    if (includeShadow && container instanceof Element && container.shadowRoot) {
      scan(container.shadowRoot);
    }
    scan(container);
    return results;
  }

  function findLargestMedia(container = document, minSize = 50) {
    const includeShadow = container !== document;
    const stopAt = container === document ? null : container;

    if (container instanceof Element && isMediaNode(container)) {
      const resolved = resolveMediaNode(container);
      if (isVisible(resolved) && !isWatermarkOrOverlay(resolved) && !isSpacerOrTransparentShield(resolved)) {
        if (getVisibleClippedRect(resolved, stopAt)) return resolved;
      }
    }

    const candidates = collectMediaNodes(container, includeShadow);
    let bestVideo = null;
    let bestVideoArea = 0;
    let bestImg = null;
    let bestImgArea = 0;
    let bestCanvas = null;
    let bestCanvasArea = 0;

    for (const item of candidates) {
      const el = resolveMediaNode(item);
      if (!isVisible(el) || isWatermarkOrOverlay(el) || isSpacerOrTransparentShield(el)) continue;
      const clipped = getVisibleClippedRect(el, stopAt);
      if (!clipped) continue;

      const tag = el.tagName.toLowerCase();
      if (tag === 'video') {
        if (clipped.width < Math.min(minSize, 40) || clipped.height < Math.min(minSize, 40)) continue;
        if (clipped.area > bestVideoArea) {
          bestVideoArea = clipped.area;
          bestVideo = el;
        }
      } else if (tag === 'img') {
        if (clipped.width < minSize || clipped.height < minSize) continue;

        // Prefer real high-res images over data: URIs or low-res thumbnail placeholders
        const isDataUri = (el.src || '').startsWith('data:');
        const isEncryptedTbn = (el.src || '').includes('encrypted-tbn');
        const isLowResPlaceholder = isDataUri || isEncryptedTbn;
        const currentIsPlaceholder = bestImg && ((bestImg.src || '').startsWith('data:') || (bestImg.src || '').includes('encrypted-tbn'));

        const naturalArea = (el.naturalWidth || 0) * (el.naturalHeight || 0);
        const bestNaturalArea = bestImg ? ((bestImg.naturalWidth || 0) * (bestImg.naturalHeight || 0)) : 0;

        let shouldReplace = false;
        if (!bestImg) {
          shouldReplace = true;
        } else if (currentIsPlaceholder && !isLowResPlaceholder && naturalArea > 0) {
          shouldReplace = true;
        } else if (!currentIsPlaceholder && isLowResPlaceholder) {
          shouldReplace = false;
        } else if (clipped.area > bestImgArea * 1.25) {
          shouldReplace = true;
        } else if (Math.abs(clipped.area - bestImgArea) < bestImgArea * 0.3) {
          if (naturalArea > bestNaturalArea * 1.5) {
            shouldReplace = true;
          } else if (naturalArea >= bestNaturalArea && (el.compareDocumentPosition(bestImg) & Node.DOCUMENT_POSITION_PRECEDING)) {
            shouldReplace = true;
          }
        } else if (clipped.area > bestImgArea) {
          shouldReplace = true;
        }

        if (shouldReplace) {
          bestImgArea = clipped.area;
          bestImg = el;
        }
      } else if (tag === 'canvas') {
        if (clipped.width < Math.max(minSize, 80) || clipped.height < Math.max(minSize, 80)) continue;
        if (clipped.area > bestCanvasArea) {
          bestCanvasArea = clipped.area;
          bestCanvas = el;
        }
      }
    }

    if (bestVideo) {
      // Only let a tiny video thumbnail lose to a giant primary image in the same viewer
      if (!bestImg || bestVideoArea >= bestImgArea * 0.25 || (bestVideoArea >= 30000 && bestVideoArea >= bestImgArea * 0.15)) {
        return bestVideo;
      }
      return bestImg;
    }
    if (bestImg) return bestImg;
    if (bestCanvas) return bestCanvas;

    // Fallback for viewer containers using CSS background-image
    if (container !== document && container.querySelectorAll) {
      let bestBg = null;
      let bestBgArea = 0;
      const els = container.querySelectorAll('*');
      for (const el of els) {
        if (!hasBackgroundImage(el) || !isVisible(el) || isWatermarkOrOverlay(el)) continue;
        const clipped = getVisibleClippedRect(el, stopAt);
        if (!clipped || clipped.width < 80 || clipped.height < 80) continue;
        if (clipped.area > bestBgArea) {
          bestBgArea = clipped.area;
          bestBg = el;
        }
      }
      if (bestBg) return bestBg;
    }

    return null;
  }

  const EXPLICIT_MODAL_SELECTOR = [
    'dialog[open]',
    '[role="dialog"]:not([aria-hidden="true"])',
    '[aria-modal="true"]:not([aria-hidden="true"])',
    '.pswp--open',
    '.fancybox__container',
    '.fancybox-container',
    '.lg-outer.lg-show',
    '.mfp-wrap',
    '.glightbox-container',
    '.yarl__root',
    '.ril__outer',
    '#baguetteBox-overlay.visible',
    '#colorbox',
    '.viewer-container',
    '.modal.show',
    '.modal.active',
    '.modal.open',
    '.modal.is-active',
    '.lightbox.active',
    '.lightbox.open',
    '.lightbox.show',
    '.medium-zoom-image--opened',
    'shreddit-media-lightbox',
    '[class*="lightbox"]:not([aria-hidden="true"])',
    '[class*="media-viewer"]:not([aria-hidden="true"])',
    '[class*="mediaviewer"]:not([aria-hidden="true"])',
    '[class*="image-viewer"]:not([aria-hidden="true"])',
    '[class*="photo-viewer"]:not([aria-hidden="true"])',
    '[id*="MediaViewer"]:not([aria-hidden="true"])',
    '[id*="lightbox"]:not([aria-hidden="true"])',
    '[jsname="W25tbd"]',
    '[jsname="r5xl4"]',
    'div[jsname="netEmf"]'
  ].join(', ');

  function isAppShellElement(el) {
    if (!el || el === document.body || el === document.documentElement) return true;
    const id = (el.id || '').toLowerCase();
    return id === 'app' || id === 'root' || id === '__next' || id === '__nuxt';
  }

  function getNumericZIndex(el) {
    const z = parseInt(window.getComputedStyle(el).zIndex, 10);
    return Number.isNaN(z) ? 0 : z;
  }

  function isActuallyOpenOverlay(el) {
    if (!el || !isVisible(el)) return false;
    if (el.closest && el.closest('[aria-hidden="true"]')) return false;
    if (isAppShellElement(el)) return false;

    const tag = (el.tagName || '').toLowerCase();
    if (tag === 'dialog' && el.hasAttribute('open')) return true;
    if (el.getAttribute('aria-modal') === 'true') return true;
    if (el.getAttribute('role') === 'dialog') return true;
    if (el.classList.contains('medium-zoom-image--opened')) return true;
    if (el.matches && el.matches(
      '.pswp--open, .fancybox__container, .fancybox-container, .lg-outer.lg-show, .mfp-wrap, ' +
      '.glightbox-container, .yarl__root, .ril__outer, #baguetteBox-overlay.visible, .viewer-container, ' +
      '.modal.show, .modal.active, .modal.open, .modal.is-active, .lightbox.active, .lightbox.open, .lightbox.show, shreddit-media-lightbox'
    )) {
      return true;
    }

    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    let cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      const style = window.getComputedStyle(cur);
      if (style.position === 'fixed') {
        const rect = cur.getBoundingClientRect();
        if (rect.width >= vpW * 0.4 && rect.height >= vpH * 0.4) return true;
        if (getNumericZIndex(cur) >= 10) return true;
      }
      if (style.position === 'absolute' && getNumericZIndex(cur) >= 50) {
        const rect = cur.getBoundingClientRect();
        if (rect.width >= vpW * 0.5 && rect.height >= vpH * 0.5) return true;
      }
      cur = getParentAcrossShadow(cur);
    }
    return false;
  }

  function findOpenModalInRoot(root) {
    if (!root || !root.querySelectorAll) return null;
    const candidates = Array.from(root.querySelectorAll(EXPLICIT_MODAL_SELECTOR));
    const valid = [];

    for (const el of candidates) {
      if (!isActuallyOpenOverlay(el)) continue;
      const media = findLargestMedia(el, 80);
      if (!media) continue;
      valid.push({ viewer: el, media, z: getNumericZIndex(el) });
    }

    if (valid.length === 0) return null;

    // Prefer outermost container of the same modal so inner sub-containers (e.g. z-indexed thumbnail strips) don't trap us,
    // while preferring higher z-index / later DOM order across distinct stacked modals.
    const topLevel = valid.filter((item) => !valid.some((other) => other !== item && other.viewer.contains(item.viewer)));
    const pool = topLevel.length > 0 ? topLevel : valid;
    pool.sort((a, b) => a.z - b.z);
    return pool[pool.length - 1];
  }

  function getOpenModalViewer() {
    // 1. Native Fullscreen API
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (fs && fs.isConnected) {
      const fsMedia = findLargestMedia(fs, 50);
      if (fsMedia) return { viewer: fs, media: fsMedia };
    }

    // 2. Explicit ARIA dialogs, <dialog open>, known lightbox/viewer modals
    const explicit = findOpenModalInRoot(document);
    if (explicit) return explicit;

    // 3. Generic viewport-center overlay / Tailwind modal / Shadow DOM modal check
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const centerElements = document.elementsFromPoint(vpW / 2, vpH / 2) || [];
    let hasFixedBackdrop = false;

    for (const el of centerElements) {
      if (isAppShellElement(el) || el.classList.contains('mza-zoom-badge')) continue;
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed') {
        const r = el.getBoundingClientRect();
        if (r.width >= vpW * 0.6 && r.height >= vpH * 0.6 && getNumericZIndex(el) >= 1) {
          hasFixedBackdrop = true;
          break;
        }
      }
    }

    for (const el of centerElements) {
      if (isAppShellElement(el) || el.classList.contains('mza-zoom-badge')) continue;

      if (el.shadowRoot) {
        const shadowModal = findOpenModalInRoot(el.shadowRoot);
        if (shadowModal) return shadowModal;
      }

      const style = window.getComputedStyle(el);
      if (style.position === 'fixed' && isVisible(el)) {
        const r = el.getBoundingClientRect();
        const z = getNumericZIndex(el);
        const isLargeOverlay = r.width >= vpW * 0.5 && r.height >= vpH * 0.5 && z >= 10;
        const isCenteredDialogOverBackdrop = hasFixedBackdrop && z >= 10;
        if (isLargeOverlay || isCenteredDialogOverBackdrop) {
          const media = findLargestMedia(el, 100);
          if (media) return { viewer: el, media };
        }
      }
    }

    return null;
  }

  function getFocusedMedia() {
    const focused = document.activeElement;
    if (!focused || focused === document.body || focused === document.documentElement) return null;

    // Direct video, img, canvas
    if (isMediaNode(focused) && isVisible(focused) && getVisibleClippedRect(focused)) {
      return resolveMediaNode(focused);
    }

    // Video player container
    const playerContainer = focused.closest('.html5-video-player, #movie_player, [class*="player"]');
    if (playerContainer) {
      const vid = playerContainer.querySelector('video');
      if (vid && isVisible(vid) && getVisibleClippedRect(vid)) return vid;
    }

    // Focused card, item, link, or container with media (e.g. YouTube card, Google Images result)
    const card = focused.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer, [role="article"], [class*="card"], [class*="item"], [class*="thumb"], [class*="preview"], [class*="gallery"], [class*="viewer"]');
    const searchRoot = card || focused;
    if (searchRoot && searchRoot.querySelectorAll) {
      const media = findLargestMedia(searchRoot, 40);
      if (media) return resolveMediaNode(media);
    }

    return null;
  }

  function getVisiblePrimaryPlayer() {
    const players = document.querySelectorAll('#movie_player, .html5-video-player');
    let bestVid = null;
    let bestArea = 0;
    for (const player of players) {
      if (!isVisible(player)) continue;
      const pRect = getVisibleClippedRect(player);
      if (!pRect || pRect.width < 360 || pRect.height < 200) continue;
      const vid = player.querySelector('video');
      if (!vid || !isVisible(vid)) continue;
      const vRect = getVisibleClippedRect(vid);
      if (!vRect || vRect.area < pRect.area * 0.3) continue;
      if (vRect.area > bestArea) {
        bestArea = vRect.area;
        bestVid = vid;
      }
    }
    return bestVid;
  }

  function getViewportCenterMedia() {
    const vpW = window.innerWidth;
    const vpH = window.innerHeight;
    const cx = vpW / 2;
    const cy = vpH / 2;

    const centerEl = findDirectMediaAtPoint(cx, cy, null, { minSize: 100 });
    if (centerEl) return centerEl;

    const candidates = document.querySelectorAll('video, img, canvas');
    let best = null;
    let bestDist = Infinity;

    for (const el of candidates) {
      if (!isVisible(el) || isWatermarkOrOverlay(el) || isSpacerOrTransparentShield(el)) continue;
      const rect = el.getBoundingClientRect();
      if (rect.width < 120 || rect.height < 90) continue;
      if (rect.right <= 10 || rect.bottom <= 10 || rect.left >= vpW - 10 || rect.top >= vpH - 10) continue;

      const elCx = rect.left + rect.width / 2;
      const elCy = rect.top + rect.height / 2;
      const dist = Math.hypot(elCx - cx, elCy - cy);
      if (dist < bestDist) {
        bestDist = dist;
        best = el;
      }
    }

    return best ? resolveMediaNode(best) : null;
  }

  function getActiveViewer(x, y) {
    const openModal = getOpenModalViewer();
    if (openModal) return openModal.viewer;

    if (x !== undefined && y !== undefined) {
      const elements = document.elementsFromPoint(x, y) || [];
      for (const el of elements) {
        if (el === document.body || el === document.documentElement) continue;
        if (isInlineViewerElement(el) && isVisible(el) && findLargestMedia(el)) return el;
        const parentViewer = el.closest(
          '[role="dialog"], [aria-modal="true"], .pswp, .viewer-container, .fancybox__container, ' +
          '[class*="lightbox"], [class*="viewer"], [class*="modal"], [class*="player"]'
        );
        if (parentViewer && isVisible(parentViewer) && findLargestMedia(parentViewer)) return parentViewer;
      }
    }

    return null;
  }

  function isCursorNearElement(el, x, y, margin = 60) {
    if (!el || !el.isConnected) return false;
    const rect = el.getBoundingClientRect();
    return (
      x >= rect.left - margin &&
      x <= rect.right + margin &&
      y >= rect.top - margin &&
      y <= rect.bottom + margin
    );
  }

  function isPointInsidePlayerOf(el, x, y) {
    if (!el || !el.isConnected) return false;
    const player = el.closest('#movie_player, .html5-video-player, .video-container, #video-preview, ytd-video-preview, #inline-preview-player, ytd-thumbnail, ytd-rich-item-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-compact-video-renderer');
    if (!player) return false;
    const r = player.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  function isActiveVideo() {
    return Boolean(activeElement && activeElement.tagName && activeElement.tagName.toLowerCase() === 'video');
  }

  function isPointInRect(rect, x, y, pad = 0) {
    if (!rect) return false;
    return x >= rect.left - pad && x <= rect.right + pad && y >= rect.top - pad && y <= rect.bottom + pad;
  }

  function isInsideActiveVideoFrame(e) {
    if (!isActiveVideo() || !activeState) return false;
    if (isPointInRect(activeState.origRect, e.clientX, e.clientY, 8)) return true;
    return isPointInRect(activeElement.getBoundingClientRect(), e.clientX, e.clientY, 8);
  }

  function isNativeVideoControlsClick(e) {
    if (!isActiveVideo() || !activeElement.hasAttribute('controls')) return false;
    const liveRect = activeElement.getBoundingClientRect();
    const origRect = activeState && activeState.origRect;
    const inLiveBar = isPointInRect(liveRect, e.clientX, e.clientY) && e.clientY >= liveRect.bottom - 65;
    const inOrigBar = origRect && isPointInRect(origRect, e.clientX, e.clientY) && e.clientY >= origRect.bottom - 65;
    return Boolean(inLiveBar || inOrigBar);
  }

  function isVideoPlayerContainer(el, mediaEl) {
    if (!el || !(el instanceof Element) || el === document.body || el === document.documentElement) return false;
    if (!isDescendantOrSelf(mediaEl, el)) return false;

    const cls = getElementClassString(el).toLowerCase();
    if (
      el.id === 'movie_player' ||
      cls.includes('player') ||
      cls.includes('video-container') ||
      cls.includes('video-wrap') ||
      cls.includes('video-box') ||
      el.classList.contains('html5-video-player') ||
      el.classList.contains('plyr') ||
      el.classList.contains('video-js') ||
      el.classList.contains('shaka-video-container') ||
      el.classList.contains('mejs__container') ||
      el.classList.contains('artplayer-app') ||
      el.classList.contains('dplayer')
    ) {
      return true;
    }

    const testId = (el.getAttribute('data-testid') || '').toLowerCase();
    if (testId.includes('video')) return true;

    // Tight wrapper around <video> (catches obfuscated React/Tailwind players like X/Twitter or Telegram)
    if (mediaEl.tagName && mediaEl.tagName.toLowerCase() === 'video' && activeState && activeState.origRect) {
      const r = el.getBoundingClientRect();
      const orig = activeState.origRect;
      if (r.width > 0 && r.height > 0 && r.width <= orig.width + 80 && r.height <= orig.height + 140) {
        return true;
      }
    }

    return false;
  }

  function isPreviewThumbnailVideo(videoEl) {
    if (!videoEl || !(videoEl instanceof Element) || videoEl.tagName.toLowerCase() !== 'video') {
      return false;
    }

    // Main players: YouTube watch page, shorts, full-bleed containers, embeds
    if (
      videoEl.closest(
        'ytd-watch-flexy, ytd-watch-grid, ytd-shorts, #full-bleed-container, ' +
        'ytd-player#ytd-player, #player-container-outer, [role="main"] #movie_player'
      )
    ) {
      return false;
    }

    // Embed pages or direct watch URLs
    const path = window.location.pathname || '';
    if (path.startsWith('/watch') || path.startsWith('/shorts') || path.startsWith('/embed')) {
      const inSidebar = videoEl.closest('#related, #secondary, ytd-compact-video-renderer, ytd-compact-radio-renderer');
      if (!inSidebar) {
        return false;
      }
    }

    // Explicit thumbnail preview containers in YouTube feeds/grids/home/channels
    if (
      videoEl.closest(
        'ytd-rich-item-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer, ' +
        'ytd-compact-video-renderer, ytd-thumbnail, ytd-moving-thumbnail-renderer, ytd-video-preview, ' +
        '#inline-preview-player, [class*="moving-thumbnail"], [class*="thumbnail-preview"], [class*="video-card"], [class*="preview"]'
      )
    ) {
      return true;
    }

    // On YouTube, if not on /watch or /shorts or /embed, any video in browse/home/feed is a preview
    if (window.location.hostname.includes('youtube.com') && !path.startsWith('/watch') && !path.startsWith('/shorts') && !path.startsWith('/embed')) {
      return true;
    }

    // Standalone / primary players (width >= 400 and not inside a card)
    const player = videoEl.closest('#movie_player, .html5-video-player, .video-js, .plyr');
    if (player) {
      const rect = player.getBoundingClientRect();
      if (rect.width >= 400 && rect.height >= 225) {
        return false;
      }
    }

    return false;
  }

  function isEventOnActiveMedia(e) {
    if (!activeElement || !activeElement.isConnected) return false;
    const path = e.composedPath ? e.composedPath() : [];
    if (path.includes(activeElement)) return true;

    // Direct hit inside the live zoomed element bounding box
    if (isPointInRect(activeElement.getBoundingClientRect(), e.clientX, e.clientY)) {
      return true;
    }

    // Direct hit inside the original media bounding box
    if (activeState && activeState.origRect && isPointInRect(activeState.origRect, e.clientX, e.clientY)) {
      return true;
    }

    // Check if event target is inside player container of activeElement
    for (const el of path) {
      if (isVideoPlayerContainer(el, activeElement)) {
        return true;
      }
    }

    // For zoomed videos, clicks inside the original player frame (e.g. sibling/portal seekbars) stay in the player
    if (isInsideActiveVideoFrame(e)) {
      return true;
    }

    const target = e.target;
    if (target && target instanceof Element) {
      if (activeElement.parentElement && activeElement.parentElement.contains(target)) {
        return true;
      }
      if (isWatermarkOrOverlay(target)) {
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
      if (isVideoPlayerContainer(el, activeElement)) {
        return true;
      }
    }

    if (isPointInRect(activeElement.getBoundingClientRect(), e.clientX, e.clientY)) {
      return true;
    }

    return false;
  }

  // Detect real interactive player controls (buttons, bars, sliders, seekbars) so clicks work normally while zoomed
  function isControlElement(target) {
    if (!target || !(target instanceof Element)) return false;

    // If the click is directly on activeElement or inside it, it is definitely the zoomed media, never a control!
    if (activeElement && (target === activeElement || activeElement.contains(target))) {
      return false;
    }

    // If an <a> tag directly wraps or contains activeElement, it is the media's link wrapper, not a UI control button!
    const link = target.closest('a');
    if (link && activeElement && (link.contains(activeElement) || activeElement.contains(link))) {
      return false;
    }

    const tag = (target.tagName || '').toLowerCase();
    if (tag === 'button' || tag === 'input' || tag === 'select') return true;
    const role = target.getAttribute ? target.getAttribute('role') : null;
    if (role === 'button' || role === 'slider' || role === 'menuitem' || role === 'menuitemradio' || role === 'menuitemcheckbox') {
      return true;
    }

    if (target.closest('button, input, select, [role="button"], [role="slider"], [role="menuitem"], [role="menuitemradio"], [role="menuitemcheckbox"], .ytp-popup, .ytp-panel, .vjs-menu, .plyr__menu')) {
      return true;
    }

    // Compact player control bars (height <= 110px) so we never match a full-player overlay wrapper
    const controlBar = target.closest(
      '.ytp-chrome-bottom, .ytp-chrome-top, .vjs-control-bar, .plyr__controls, ' +
      '[class*="control"], [class*="progress"], [class*="timeline"], [class*="seek"], [class*="scrubber"], [class*="slider"], [class*="volume"], [class*="toolbar"]'
    );
    if (controlBar) {
      const barRect = controlBar.getBoundingClientRect();
      if (barRect.height > 0 && barRect.height <= 110) {
        return true;
      }
    }

    // Small clickable icons/elements with cursor: pointer (outside the zoomed media)
    if (activeState && activeState.origRect) {
      const tRect = target.getBoundingClientRect();
      const isSmall = tRect.width < activeState.origRect.width * 0.5 && tRect.height <= 90;
      if (isSmall && window.getComputedStyle(target).cursor === 'pointer' && !activeElement.contains(target)) {
        return true;
      }
    }

    return false;
  }

  function findDirectMediaAtPoint(x, y, e, options = {}) {
    const { minSize = 0, exclude = null } = options;
    const elements = document.elementsFromPoint(x, y) || [];
    const path = (e && e.composedPath) ? e.composedPath() : [];

    // Collect top visible layer elements before hitting an opaque barrier that does not contain media
    const topElements = [];
    for (const el of elements) {
      topElements.push(el);
      if (!isMediaNode(el) && !isWatermarkOrOverlay(el) && isOpaqueBackground(el)) {
        const hasMediaInside = el.querySelector('video, img, picture, canvas');
        if (!hasMediaInside) {
          break;
        }
      }
    }

    const isValidCandidate = (el, minW, minH) => {
      if (!el || el === exclude) return false;
      if (exclude && isDescendantOrSelf(el, exclude)) return false;
      if (!isVisible(el) || isWatermarkOrOverlay(el) || isSpacerOrTransparentShield(el)) return false;
      const clipped = getVisibleClippedRect(el);
      if (!clipped) return false;
      const reqW = Math.max(minW, minSize);
      const reqH = Math.max(minH, minSize);
      return clipped.width >= reqW && clipped.height >= reqH ? clipped : false;
    };

    // 1. VIDEO PRIORITY: direct <video> at point, in composedPath, in shadowRoot, or child of wrapper at point
    for (const el of topElements) {
      if (el.tagName && el.tagName.toLowerCase() === 'video' && isValidCandidate(el, 40, 40)) {
        return el;
      }
    }

    for (const el of path) {
      if (!el || !(el instanceof Element)) continue;
      if (el.tagName && el.tagName.toLowerCase() === 'video' && isValidCandidate(el, 40, 40)) {
        return el;
      }
      if (el.shadowRoot) {
        const vid = el.shadowRoot.querySelector('video');
        if (vid && isValidCandidate(vid, 40, 40)) return vid;
      }
    }

    // Check if any element at point is inside a card/feed item with an active video preview (e.g. YouTube moving thumbnail!)
    for (const el of elements) {
      if (!el || !(el instanceof Element)) continue;
      const card = el.closest(
        'ytd-thumbnail, ytd-moving-thumbnail-renderer, #inline-preview-player, #mouseover-overlay, ' +
        'ytd-rich-grid-media, ytd-rich-item-renderer, ytd-video-renderer, ytd-compact-video-renderer, ytd-grid-video-renderer, ' +
        '[class*="thumbnail"], [class*="preview"], [class*="video-card"]'
      );
      if (card) {
        const vid = card.querySelector('video');
        if (vid && isValidCandidate(vid, 40, 40) && isCursorNearElement(vid, x, y, 40)) {
          return vid;
        }
      }
    }

    for (const el of topElements) {
      if (el === document.body || el === document.documentElement) continue;
      const vid = el.querySelector('video');
      if (vid && isValidCandidate(vid, 40, 40) && isCursorNearElement(vid, x, y, 20)) {
        return vid;
      }
    }

    // 2. IMAGE PRIORITY AT POINT: direct <img> / <picture> in top visible layers
    let bestImgUnderCursor = null;
    let bestImgArea = 0;

    for (const el of topElements) {
      if (el.tagName && (el.tagName.toLowerCase() === 'img' || el.tagName.toLowerCase() === 'picture')) {
        const candidate = resolveMediaNode(el);
        const clipped = isValidCandidate(candidate, 50, 50);
        if (clipped && clipped.area > bestImgArea) {
          bestImgArea = clipped.area;
          bestImgUnderCursor = candidate;
        }
      }
    }
    if (bestImgUnderCursor) return bestImgUnderCursor;

    // Check composedPath / shadowRoot for images
    for (const el of path) {
      if (!el || !(el instanceof Element)) continue;
      if (el.tagName && el.tagName.toLowerCase() === 'img' && isValidCandidate(el, 50, 50)) {
        return el;
      }
      if (el.shadowRoot) {
        const shadowImg = el.shadowRoot.querySelector('img');
        if (shadowImg && isValidCandidate(shadowImg, 50, 50)) return shadowImg;
      }
    }

    // Check immediate child images under a wrapper overlay at point (strictly near cursor)
    for (const el of topElements) {
      if (el === document.body || el === document.documentElement) continue;
      const children = el.querySelectorAll('img, picture');
      for (const item of children) {
        const candidate = resolveMediaNode(item);
        if (!isCursorNearElement(candidate, x, y, 20)) continue;
        const clipped = isValidCandidate(candidate, 50, 50);
        if (clipped && clipped.area > bestImgArea) {
          bestImgArea = clipped.area;
          bestImgUnderCursor = candidate;
        }
      }
      if (bestImgUnderCursor) return bestImgUnderCursor;
    }

    // 3. Sibling wrapper (only tightly under/next to cursor)
    for (const el of topElements) {
      if (el === document.body || el === document.documentElement) continue;
      const parent = el.parentElement;
      if (parent && parent !== document.body && parent !== document.documentElement) {
        const vid = parent.querySelector('video');
        if (vid && isValidCandidate(vid, 40, 40) && isCursorNearElement(vid, x, y, 30)) return vid;

        const siblingMedia = parent.querySelector('img');
        if (siblingMedia && isValidCandidate(siblingMedia, 50, 50) && isCursorNearElement(siblingMedia, x, y, 15)) {
          return siblingMedia;
        }
      }
    }

    // 4. CANVAS PRIORITY (substantial size >= 80x80)
    for (const el of topElements) {
      if (el.tagName && el.tagName.toLowerCase() === 'canvas' && isValidCandidate(el, 80, 80)) {
        return el;
      }
    }

    // 5. Background image element
    for (const el of topElements) {
      if (hasBackgroundImage(el) && !isWatermarkOrOverlay(el) && el !== exclude) {
        const clipped = getVisibleClippedRect(el);
        const req = Math.max(80, minSize);
        if (clipped && clipped.width >= req && clipped.height >= req) return el;
      }
    }

    return null;
  }

  // Find any active, playing, or hover preview video overlapping the cursor
  // (handles videos with pointer-events: none, overlay scrims, or dynamic players like YouTube #inline-preview-player)
  function findActiveVideoAtPoint(x, y) {
    const candidateVideos = new Set(document.querySelectorAll('video'));

    // Check YouTube preview player containers (both light DOM and shadowRoot)
    const previewContainers = document.querySelectorAll(
      '#inline-preview-player, ytd-video-preview, ytd-moving-thumbnail-renderer, ytd-player, [id*="preview-player"]'
    );
    for (const container of previewContainers) {
      if (container.shadowRoot) {
        const shadowVid = container.shadowRoot.querySelector('video');
        if (shadowVid) candidateVideos.add(shadowVid);
      }
      const vid = container.querySelector('video');
      if (vid) candidateVideos.add(vid);
    }

    let bestVideo = null;
    let bestScore = -1;

    for (const vid of candidateVideos) {
      if (!vid || !vid.isConnected) continue;

      const rect = vid.getBoundingClientRect();
      const style = window.getComputedStyle(vid);
      if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) < 0.05) {
        continue;
      }

      // Check if cursor is directly within the video bounds
      let inBounds = (rect.width >= 30 && rect.height >= 30 && isPointInRect(rect, x, y, 15));

      // Or inside the video player / preview container bounds
      if (!inBounds) {
        const player = vid.closest('#inline-preview-player, ytd-video-preview, .html5-video-player, ytd-moving-thumbnail-renderer, [class*="player"]');
        if (player) {
          const pRect = player.getBoundingClientRect();
          if (pRect.width >= 30 && pRect.height >= 30 && isPointInRect(pRect, x, y, 15)) {
            inBounds = true;
          }
        }
      }

      if (inBounds) {
        let score = 10;
        // Playing videos get top priority
        if (!vid.paused || vid.currentTime > 0) score += 50;
        if (vid.readyState >= 1) score += 20;
        if (vid.closest('#inline-preview-player, ytd-video-preview, ytd-moving-thumbnail-renderer')) score += 30;

        if (score > bestScore) {
          bestScore = score;
          bestVideo = vid;
        }
      }
    }

    return bestVideo;
  }

  // Dedicated YouTube feed media finder:
  // When a card is hovered and its preview (HTML5 video or moving WebP animated thumbnail) is active,
  // this GUARANTEES we target that active preview element instead of the static background thumbnail!
  function findYouTubeHoverMedia(x, y) {
    if (!window.location.hostname.includes('youtube.com')) return null;

    // 1. Check all videos across the page: if any video is active/playing under cursor or its card, target it!
    const allVideos = document.querySelectorAll('video');
    for (const vid of allVideos) {
      if (!vid || !vid.isConnected) continue;
      const vStyle = window.getComputedStyle(vid);
      if (vStyle.display === 'none' || vStyle.visibility === 'hidden' || parseFloat(vStyle.opacity) < 0.05) continue;

      const vr = vid.getBoundingClientRect();
      const container = vid.closest(
        '#inline-preview-player, ytd-video-preview, #video-preview, .html5-video-player, ytd-moving-thumbnail-renderer, ' +
        'ytd-rich-item-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer, ytd-compact-video-renderer, ' +
        '[class*="player"], [class*="preview"]'
      ) || vid;
      const cr = container.getBoundingClientRect();

      const inBounds = (vr.width >= 30 && vr.height >= 30 && isPointInRect(vr, x, y, 40)) ||
                       (cr.width >= 30 && cr.height >= 30 && isPointInRect(cr, x, y, 40));

      if (inBounds) {
        // If it's playing or has buffered frames, it is 100% the active preview video
        if (!vid.paused || vid.currentTime > 0 || vid.readyState >= 1) {
          return vid;
        }
      }
    }

    // 2. Check cards under cursor for active video or moving WebP thumbnail
    const elements = document.elementsFromPoint(x, y) || [];
    for (const el of elements) {
      if (!el || !(el instanceof Element)) continue;
      const card = el.closest(
        'ytd-rich-item-renderer, ytd-rich-grid-media, ytd-video-renderer, ytd-grid-video-renderer, ' +
        'ytd-compact-video-renderer, ytd-playlist-video-renderer, ytd-reel-item-renderer, ytd-notification-renderer'
      );
      if (!card) continue;

      // 2a. Active or ready video preview inside this card
      const cardVid = card.querySelector('video');
      if (cardVid && cardVid.isConnected) {
        const vr = cardVid.getBoundingClientRect();
        if (vr.width >= 30 && vr.height >= 30 && isPointInRect(vr, x, y, 40)) {
          const vStyle = window.getComputedStyle(cardVid);
          if (vStyle.display !== 'none' && vStyle.visibility !== 'hidden' && parseFloat(vStyle.opacity) > 0.05) {
            return cardVid;
          }
        }
      }

      // 2b. Active moving animated thumbnail (WebP preview in ytd-moving-thumbnail-renderer)
      const movingImg = card.querySelector(
        '#hover-overlays ytd-moving-thumbnail-renderer img, ytd-moving-thumbnail-renderer #thumbnail, ytd-moving-thumbnail-renderer img'
      );
      if (movingImg && movingImg.isConnected) {
        const mr = movingImg.getBoundingClientRect();
        if (mr.width >= 40 && mr.height >= 40 && isPointInRect(mr, x, y, 30)) {
          const mStyle = window.getComputedStyle(movingImg);
          if (mStyle.display !== 'none' && mStyle.visibility !== 'hidden' && parseFloat(mStyle.opacity) > 0.05) {
            return movingImg;
          }
        }
      }

      // 2c. Static thumbnail image in this card (when preview hasn't started or is not available)
      const staticImg = card.querySelector('ytd-thumbnail img, #thumbnail img, yt-image img');
      if (staticImg && staticImg.isConnected) {
        const sr = staticImg.getBoundingClientRect();
        if (sr.width >= 40 && sr.height >= 40 && isPointInRect(sr, x, y, 30)) {
          return staticImg;
        }
      }
    }

    return null;
  }

  // Priority search for media
  function findTargetMedia(e) {
    const x = e.clientX;
    const y = e.clientY;

    // 0. Active element lock during continuous zooming:
    // When an element is already active and zoomed (> 1.0), KEEP ZOOMING IT!
    // Never switch targets or bounce between <img> and <video> mid-zoom!
    if (activeElement && activeState && activeState.scale > 1.0 && activeElement.isConnected) {
      if (isCursorNearElement(activeElement, x, y, 200) || isPointInsidePlayerOf(activeElement, x, y) || isWheelOverActiveMedia(e)) {
        return activeElement;
      }
    }

    // 1. YouTube card media detection (prioritizes active video / moving WebP preview over static thumbnail)
    if (window.location.hostname.includes('youtube.com')) {
      const ytMedia = findYouTubeHoverMedia(x, y);
      if (ytMedia) {
        return ytMedia;
      }
    }

    // 2. ACTIVE VIDEO UNDER CURSOR:
    // When hovering over an active/playing video or hover preview (e.g. YouTube feed card),
    // always prioritize the video over any static background thumbnail or wrapper underneath!
    const activeVideo = findActiveVideoAtPoint(x, y);
    if (activeVideo) {
      return activeVideo;
    }

    // 2. Direct media under cursor (always top priority when hovering an image/video/canvas)
    const directMedia = findDirectMediaAtPoint(x, y, e);
    if (directMedia) {
      return directMedia;
    }

    // 2. Currently active zoomed element (keep focus if cursor is near it or within its player)
    if (activeElement && activeState && activeState.scale > 1.0 && activeElement.isConnected && isVisible(activeElement) && getVisibleClippedRect(activeElement)) {
      if (isCursorNearElement(activeElement, x, y, 160) || isPointInsidePlayerOf(activeElement, x, y)) {
        return activeElement;
      }
    }

    // 3. Open modal / lightbox / viewer (prioritize if cursor is inside or near it)
    const openModal = getOpenModalViewer();
    if (openModal && openModal.media) {
      return resolveMediaNode(openModal.media);
    }

    // 4. Inline viewer / player container directly under cursor
    const inlineViewer = getActiveViewer(x, y);
    if (inlineViewer) {
      const viewerMedia = findLargestMedia(inlineViewer);
      if (viewerMedia) {
        return resolveMediaNode(viewerMedia);
      }
    }

    // 5. Focused video player / media element (document.activeElement)
    const focusedMedia = getFocusedMedia();
    if (focusedMedia) {
      return focusedMedia;
    }

    // 6. Visible primary video player
    const primaryPlayer = getVisiblePrimaryPlayer();
    if (primaryPlayer) {
      return primaryPlayer;
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
        if (item.modZ) {
          if (item.prevZIndex) {
            item.el.style.setProperty('z-index', item.prevZIndex, item.prevZIndexPriority || '');
          } else {
            item.el.style.removeProperty('z-index');
          }
          if (item.prevPosition) {
            item.el.style.setProperty('position', item.prevPosition, item.prevPositionPriority || '');
          } else {
            item.el.style.removeProperty('position');
          }
        }
        if (item.modContain) {
          if (item.prevContain) {
            item.el.style.setProperty('contain', item.prevContain, item.prevContainPriority || '');
          } else {
            item.el.style.removeProperty('contain');
          }
        }
        if (item.modClip) {
          if (item.prevClipPath) {
            item.el.style.setProperty('clip-path', item.prevClipPath, item.prevClipPathPriority || '');
          } else {
            item.el.style.removeProperty('clip-path');
          }
        }
      }
    }

    if (activeState && activeState.elevatedControls) {
      for (const item of activeState.elevatedControls) {
        if (item.prevZIndex) {
          item.el.style.setProperty('z-index', item.prevZIndex, item.prevZIndexPriority || '');
        } else {
          item.el.style.removeProperty('z-index');
        }
      }
    }

    if (badgeEl) {
      badgeEl.classList.remove('mza-visible');
    }

    activeElement = null;
    activeState = null;
    isDragging = false;
    pointerDownInPlayer = false;
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

  function hasMediaSwitchedAway(el) {
    if (!el || !el.isConnected || !isVisible(el)) return true;
    if (el.closest && el.closest('[aria-hidden="true"], [inert]')) return true;

    // For videos: an active playing video never switches away unless detached or hidden
    if (el.tagName && el.tagName.toLowerCase() === 'video') {
      return false;
    }

    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (fs && (fs === el || isDescendantOrSelf(el, fs))) {
      return false;
    }

    const clipped = getVisibleClippedRect(el);
    if (!clipped) return true;

    // When overflow:hidden was temporarily lifted on carousel/gallery containers, check if the slide wrapper moved outside
    if (activeState && activeState.overflowParents && activeState.overflowParents.length > 0) {
      const container = activeState.overflowParents[activeState.overflowParents.length - 1].el;
      const trackParent = el.parentElement;
      if (container && container.isConnected && trackParent && trackParent.isConnected && trackParent !== container) {
        const cRect = container.getBoundingClientRect();
        const tRect = trackParent.getBoundingClientRect();
        const horizOverlap = Math.min(cRect.right, tRect.right) - Math.max(cRect.left, tRect.left);
        const vertOverlap = Math.min(cRect.bottom, tRect.bottom) - Math.max(cRect.top, tRect.top);
        if (horizOverlap < 10 || vertOverlap < 10) return true;
      }
    }

    return false;
  }

  // Observe media src and container slide changes to reset zoom when switching slides/videos
  function observeMediaChanges(el) {
    if (mediaObserver) {
      mediaObserver.disconnect();
      mediaObserver = null;
    }

    mediaObserver = new MutationObserver((mutations) => {
      if (!config.resetOnMediaChange) return;
      for (const m of mutations) {
        if (m.target === el) {
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
        } else if (hasMediaSwitchedAway(el)) {
          resetZoom(el);
          return;
        }
      }
    });

    mediaObserver.observe(el, {
      attributes: true,
      attributeFilter: ['src', 'srcset', 'poster', 'data-src'],
      childList: true
    });

    // Only observe ancestor style/class for non-video elements (e.g. image carousel slides).
    // Videos constantly mutate player classes (like .ytp-autohide) which must not trigger zoom resets!
    const isVideo = el.tagName && el.tagName.toLowerCase() === 'video';
    if (!isVideo) {
      let ancestor = el.parentElement;
      let depth = 0;
      while (ancestor && ancestor !== document.body && ancestor !== document.documentElement && depth < 4) {
        mediaObserver.observe(ancestor, {
          attributes: true,
          attributeFilter: ['style', 'class', 'hidden', 'aria-hidden', 'inert']
        });
        ancestor = ancestor.parentElement;
        depth++;
      }
    }
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
        if (!activeElement.isConnected || !isVisible(activeElement)) {
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
    if (config.modifierKey === 'custom' && config.customActivationKey && config.customActivationKey.code === 'MouseRight') {
      wasZoomedWithRightClick = true;
      lastRightClickZoomTime = Date.now();
    }
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
        overflowParents: [],
        elevatedControls: []
      };

      const isVideo = targetMedia.tagName && targetMedia.tagName.toLowerCase() === 'video';
      const inModal = Boolean(targetMedia.closest('[role="dialog"], [aria-modal="true"], dialog[open], .modal, .lightbox, .pswp, .viewer, [class*="viewer"], [class*="lightbox"], [class*="modal"]'));
      const isFullscreen = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      const isPreviewVideo = isVideo && isPreviewThumbnailVideo(targetMedia);
      const isPlayerVideo = isVideo && !isPreviewVideo;

      // Expand condition:
      // - Images expand by default
      // - Feed/card preview videos expand if expandPreviewVideos is enabled
      // - Standalone/main player videos expand if expandPlayerVideos is enabled
      let shouldExpand = false;
      if (!inModal && !isFullscreen) {
        if (!isVideo) {
          shouldExpand = true;
        } else if (isPreviewVideo && config.expandPreviewVideos) {
          shouldExpand = true;
        } else if (isPlayerVideo && config.expandPlayerVideos) {
          shouldExpand = true;
        }
      }
      const computed = window.getComputedStyle(targetMedia);
      if (computed.position === 'static') {
        targetMedia.style.position = 'relative';
      }
      // Elevate zIndex for images and feed preview videos (so preview video renders above card overlays/badges)
      if (shouldExpand && (!isVideo || isPreviewVideo)) {
        targetMedia.style.zIndex = '2147483646';
      }
      if (shouldExpand && !isVideo) {
        targetMedia.style.pointerEvents = 'auto';
      }
      targetMedia.classList.add('mza-zoomed');

      // Lift overflow:hidden and containment on direct container parents for inline thumbnails and expanded videos
      if (shouldExpand) {
        let p = getParentAcrossShadow(targetMedia);
        let depth = 0;
        while (p && p !== document.body && p !== document.documentElement && depth < 20) {
          if (!(p instanceof Element)) {
            p = getParentAcrossShadow(p);
            continue;
          }
          const pStyle = window.getComputedStyle(p);
          const isScrollableY = (pStyle.overflowY === 'auto' || pStyle.overflowY === 'scroll') && p.scrollHeight > p.clientHeight;
          const isScrollableX = (pStyle.overflowX === 'auto' || pStyle.overflowX === 'scroll') && p.scrollWidth > p.clientWidth;

          const modX = !isScrollableX && (pStyle.overflowX === 'hidden' || pStyle.overflowX === 'clip');
          const modY = !isScrollableY && (pStyle.overflowY === 'hidden' || pStyle.overflowY === 'clip');
          const modContain = Boolean(pStyle.contain && pStyle.contain !== 'none');
          const modClip = Boolean(pStyle.clipPath && pStyle.clipPath !== 'none');

          // DO NOT elevate z-index on inner video wrappers of main player (.html5-video-container),
          // otherwise it covers the player controls (.ytp-chrome-bottom) which are siblings inside #movie_player!
          const isInnerVideoWrapper = isVideo && !isPreviewVideo && (
            p.classList.contains('html5-video-container') ||
            (pStyle.position === 'absolute' && p.parentElement && (p.parentElement.id === 'movie_player' || p.parentElement.classList.contains('html5-video-player')))
          );
          const modZ = !isInnerVideoWrapper;

          activeState.overflowParents.push({
            el: p,
            modX: modX,
            modY: modY,
            modZ: modZ,
            modContain: modContain,
            modClip: modClip,
            prevPosition: p.style.position,
            prevPositionPriority: p.style.getPropertyPriority('position'),
            prevZIndex: p.style.zIndex,
            prevZIndexPriority: p.style.getPropertyPriority('z-index'),
            prevOverflowX: p.style.overflowX,
            prevOverflowXPriority: p.style.getPropertyPriority('overflow-x'),
            prevOverflowY: p.style.overflowY,
            prevOverflowYPriority: p.style.getPropertyPriority('overflow-y'),
            prevContain: p.style.contain,
            prevContainPriority: p.style.getPropertyPriority('contain'),
            prevClipPath: p.style.clipPath,
            prevClipPathPriority: p.style.getPropertyPriority('clip-path')
          });

          if (modX) p.style.setProperty('overflow-x', 'visible', 'important');
          if (modY) p.style.setProperty('overflow-y', 'visible', 'important');
          if (modContain) p.style.setProperty('contain', 'none', 'important');
          if (modClip) p.style.setProperty('clip-path', 'none', 'important');
          if (modZ) {
            if (pStyle.position === 'static') p.style.setProperty('position', 'relative', 'important');
            p.style.setProperty('z-index', '2147483640', 'important');
          }

          // If this is a video player, elevate its control bars above the zoomed video
          if (isVideo && (p.id === 'movie_player' || p.classList.contains('html5-video-player'))) {
            const playerBars = p.querySelectorAll('.ytp-chrome-bottom, .ytp-gradient-bottom, .ytp-chrome-top');
            for (const bar of playerBars) {
              activeState.elevatedControls.push({
                el: bar,
                prevZIndex: bar.style.zIndex,
                prevZIndexPriority: bar.style.getPropertyPriority('z-index')
              });
              bar.style.setProperty('z-index', bar.classList.contains('ytp-chrome-bottom') ? '2147483645' : '2147483644', 'important');
            }
          }

          p = getParentAcrossShadow(p);
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

  function isResetNavigationControl(el) {
    if (!el || !(el instanceof Element)) return false;
    const btn = el.closest ? (el.closest('button, a, [role="button"]') || el) : el;
    const cls = getElementClassString(btn).toLowerCase();
    const aria = (btn.getAttribute ? (btn.getAttribute('aria-label') || '') : '').toLowerCase();
    const title = (btn.getAttribute ? (btn.getAttribute('title') || '') : '').toLowerCase();
    const testId = (btn.getAttribute ? (btn.getAttribute('data-testid') || '') : '').toLowerCase();
    const combined = `${cls} ${aria} ${title} ${testId}`;

    if (/\b(play|pause|mute|unmute|volume|fullscreen|caption|subtitle|quality|speed|settings|pip|rewind|seek|seconds|chapters?)\b/.test(combined)) {
      return false;
    }

    return (
      cls.includes('swiper-button') || cls.includes('slick-arrow') ||
      cls.includes('pswp__button--arrow') || cls.includes('gallery-next') ||
      cls.includes('gallery-prev') || cls.includes('nav-btn') ||
      /\b(close|dismiss|next|prev|previous|carousel-control|slider-arrow)\b/.test(combined) ||
      /(arrow|chevron)[-_]?(left|right|prev|next)|(left|right|prev|next)[-_]?(arrow|chevron|btn|button)/.test(combined)
    );
  }

  function scheduleMediaSwitchCheck(prevEl) {
    if (!prevEl || !config.resetOnMediaChange) return;
    [60, 250, 450].forEach((delay) => {
      setTimeout(() => {
        if (config.resetOnMediaChange && activeElement === prevEl && hasMediaSwitchedAway(prevEl)) {
          resetZoom(prevEl);
        }
      }, delay);
    });
  }

  // Pointer & Mouse Down handling
  function onPointerDown(e) {
    if (!activeElement || !activeState || activeState.scale <= 1.0) return;
    if (e.button !== 0 && e.button !== 1) return;

    const onPlayer = isEventOnActiveMedia(e);
    if (e.type === 'pointerdown' || !pointerDownInPlayer) {
      pointerDownInPlayer = isActiveVideo() && (onPlayer || isNativeVideoControlsClick(e));
    }

    // Allow user to click real controls (close button, arrows, player bars) without dragging or shifting layout before click completes
    if (isControlElement(e.target) || isNativeVideoControlsClick(e)) {
      return;
    }

    // Only capture drag if clicking inside active media area; outside clicks pass cleanly to onClick
    if (!onPlayer) {
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
    const startedInPlayer = pointerDownInPlayer;
    pointerDownInPlayer = false;

    if (hasDragged) {
      hasDragged = false;
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      return;
    }

    if (activeElement && activeState && activeState.scale > 1.0) {
      const clickedEl = e.target;
      if (clickedEl !== activeElement && !isDescendantOrSelf(clickedEl, activeElement) && isResetNavigationControl(clickedEl)) {
        if (config.resetOnMediaChange) {
          resetZoom(activeElement);
        }
        return;
      }

      // Keep zoom when clicking/scrubbing inside a video player (seekbar, timeline, play/pause, controls)
      const onPlayer = isEventOnActiveMedia(e) || (isActiveVideo() && (startedInPlayer || isNativeVideoControlsClick(e)));
      if (!onPlayer) {
        resetZoom(activeElement);
        return;
      }

      // Check after click in case the click closed a lightbox/modal or slid carousel off-screen
      scheduleMediaSwitchCheck(activeElement);
    }
  }

  function onDoubleClick(e) {
    if (!activeElement || !activeState || activeState.scale <= 1.0) return;
    if (isControlElement(e.target) || isNativeVideoControlsClick(e)) return;
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
    if (e.type === 'keyup' && e.code) {
      heldKeyCodes.delete(e.code);
    }
    if (blockedKeyCodes.has(e.code)) {
      blockKeyEvent(e);
      if (e.type === 'keyup') {
        blockedKeyCodes.delete(e.code);
      }
    }
  }

  function matchesPanModifier(e, mod) {
    if (mod === 'none') return !e.ctrlKey && !e.altKey && !e.metaKey;
    if (mod === 'shift') return e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey;
    if (mod === 'alt') return e.altKey && !e.ctrlKey && !e.metaKey;
    if (mod === 'ctrl') return (e.ctrlKey || e.metaKey) && !e.altKey;
    if (mod === 'custom' && config.customPanModifier) {
      const c = config.customPanModifier;
      if (c.code === 'MouseBack') return (e.buttons & 8) !== 0;
      if (c.code === 'MouseForward') return (e.buttons & 16) !== 0;
      if (c.code === 'MouseMiddle') return (e.buttons & 4) !== 0;
      if (c.code === 'MouseRight') return (e.buttons & 2) !== 0;
      const ctrlMatch = Boolean(c.ctrl) === Boolean(e.ctrlKey || e.metaKey);
      const altMatch = Boolean(c.alt) === Boolean(e.altKey);
      const shiftMatch = Boolean(c.shift) === Boolean(e.shiftKey);
      const metaMatch = Boolean(c.meta) === Boolean(e.metaKey);
      if (c.code) {
        return ctrlMatch && altMatch && shiftMatch && metaMatch && (e.code === c.code || heldKeyCodes.has(c.code));
      }
      return ctrlMatch && altMatch && shiftMatch && metaMatch;
    }
    return false;
  }

  const KEYBOARD_PAN_DELTAS = {
    ArrowUp: [0, 1],
    ArrowDown: [0, -1],
    ArrowLeft: [1, 0],
    ArrowRight: [-1, 0]
  };

  function applyKeyboardPan(e, dx, dy, speedBoost = 1) {
    if (!activeElement || !activeState) return;
    if (!activeElement.isConnected || !isVisible(activeElement)) {
      resetZoom(activeElement);
      return;
    }
    blockKeyEvent(e);
    if (e.code) blockedKeyCodes.add(e.code);
    const baseStep = Number(config.keyboardPanStep) || 200;
    const step = Math.max(10, Math.round(baseStep * config.wheelPanSpeed)) * speedBoost;
    activeState.panX += dx * step;
    activeState.panY += dy * step;
    applyTransform(activeElement, activeState.scale, activeState.panX, activeState.panY);
  }

  // Keyboard zoom + arrow pan + navigation resets
  function onKeyDown(e) {
    if (e.code && !isTypingTarget(e.target)) {
      heldKeyCodes.add(e.code);
    }
    if (config.enabled && config.keyboardZoomEnabled && !isTypingTarget(e.target)) {
      const isZoomIn = matchesKeyCombo(e, config.kbdZoomIn);
      const isZoomOut = !isZoomIn && matchesKeyCombo(e, config.kbdZoomOut);

      if (isZoomIn || isZoomOut) {
        const openModal = getOpenModalViewer();
        let target = null;

        if (activeElement && activeElement.isConnected && isVisible(activeElement) && getVisibleClippedRect(activeElement)) {
          if (!openModal || isDescendantOrSelf(activeElement, openModal.viewer)) {
            target = activeElement;
          } else {
            resetZoom(activeElement);
          }
        }

        if (!target && openModal && openModal.media) {
          target = resolveMediaNode(openModal.media);
        }
        if (!target) {
          target = getFocusedMedia();
        }
        if (!target) {
          target = getVisiblePrimaryPlayer();
        }
        if (!target && lastMouseX >= 0 && lastMouseY >= 0) {
          target = findTargetMedia({ clientX: lastMouseX, clientY: lastMouseY });
        }
        if (!target) {
          target = getViewportCenterMedia();
        }

        if (target) {
          blockKeyEvent(e);
          if (e.code) blockedKeyCodes.add(e.code);
          const factor = isZoomIn ? config.zoomSpeed : (1 / config.zoomSpeed);
          applyZoomStep(target, factor, null, null);
          return;
        }
      }

      if (activeElement && activeState && activeState.scale > 1.0) {
        const isPanLeft = matchesKeyCombo(e, config.kbdPanUp);
        const isPanRight = !isPanLeft && matchesKeyCombo(e, config.kbdPanDown);
        if (isPanLeft || isPanRight) {
          applyKeyboardPan(e, isPanLeft ? 1 : -1, 0, 1);
          return;
        }
      }
    }

    const panDir = KEYBOARD_PAN_DELTAS[e.key] || KEYBOARD_PAN_DELTAS[e.code];
    const isImageZoomed = Boolean(activeElement && activeElement.tagName && activeElement.tagName.toLowerCase() !== 'video');
    const allowPlainArrowsOnImage = isImageZoomed && !e.ctrlKey && !e.altKey && !e.metaKey;
    if (
      config.enabled &&
      config.keyboardPanEnabled &&
      panDir &&
      activeElement &&
      activeState &&
      activeState.scale > 1.0 &&
      !isTypingTarget(e.target) &&
      (matchesPanModifier(e, config.keyboardPanModifier) || allowPlainArrowsOnImage)
    ) {
      const speedBoost = ((config.keyboardPanModifier === 'none' || allowPlainArrowsOnImage) && e.shiftKey) ? 2.5 : 1;
      applyKeyboardPan(e, panDir[0], panDir[1], speedBoost);
      return;
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
      if (config.resetOnMediaChange) {
        resetZoom(activeElement);
      }
      return;
    }

    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && config.resetOnMediaChange && !isTypingTarget(e.target)) {
      scheduleMediaSwitchCheck(activeElement);
    }
  }

  function onFullscreenChange() {
    if (activeElement && activeState) {
      resetZoom(activeElement);
    }
  }

  // Clear stuck drag states on Alt+Tab or window blur
  function onWindowBlur() {
    isDragging = false;
    hasDragged = false;
    isRightClickHeld = false;
    pointerDownInPlayer = false;
    heldKeyCodes.clear();
    blockedKeyCodes.clear();
    document.documentElement.classList.remove('mza-dragging-active');
    if (activeElement) {
      activeElement.classList.remove('mza-dragging');
      if (!activeElement.isConnected || !isVisible(activeElement)) {
        resetZoom(activeElement);
      }
    }
  }

  function preventSideButtonNavigation(e) {
    if (e.button === 3 || e.button === 4) {
      const code = config.customActivationKey && config.customActivationKey.code;
      const isConfiguredSideButton = (code === 'MouseBack' && e.button === 3) || (code === 'MouseForward' && e.button === 4);
      if (isConfiguredSideButton || wasZoomedWithSideButton) {
        if (wasZoomedWithSideButton || activeElement || (lastMouseX >= 0 && lastMouseY >= 0 && findTargetMedia({ clientX: lastMouseX, clientY: lastMouseY }))) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
        if (e.type === 'mouseup' || e.type === 'pointerup' || e.type === 'auxclick') {
          wasZoomedWithSideButton = false;
        }
      }
    }
  }

  // Listeners with capture phase
  window.addEventListener('wheel', onWheel, { capture: true, passive: false });
  document.addEventListener('wheel', onWheel, { capture: true, passive: false });

  window.addEventListener('pointerdown', preventSideButtonNavigation, { capture: true });
  window.addEventListener('mousedown', preventSideButtonNavigation, { capture: true });
  window.addEventListener('pointerup', preventSideButtonNavigation, { capture: true });
  window.addEventListener('mouseup', preventSideButtonNavigation, { capture: true });
  window.addEventListener('auxclick', preventSideButtonNavigation, { capture: true });

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
  function blockContextMenu(e) {
    const isCustomRight = config.modifierKey === 'custom' && config.customActivationKey && config.customActivationKey.code === 'MouseRight';
    const wasRecentlyZoomed = wasZoomedWithRightClick || (Date.now() - lastRightClickZoomTime < 1500);
    const mediaAtPoint = findDirectMediaAtPoint(e.clientX, e.clientY, e);
    const isOverMedia = Boolean(activeElement || mediaAtPoint || isEventOnActiveMedia(e));

    if (wasRecentlyZoomed || (isCustomRight && isOverMedia)) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      wasZoomedWithRightClick = false;

      // Close YouTube/HTML5 video context menus if already created
      document.querySelectorAll('.ytp-contextmenu, .ytp-popup').forEach((m) => {
        m.style.display = 'none';
      });
      return false;
    }
  }

  function onRightMouseDown(e) {
    if (e.button === 2) {
      isRightClickHeld = true;
      if (config.modifierKey === 'custom' && config.customActivationKey && config.customActivationKey.code === 'MouseRight') {
        const isOverMedia = Boolean(activeElement || findDirectMediaAtPoint(e.clientX, e.clientY, e));
        if (isOverMedia) {
          e.preventDefault();
        }
      }
    }
  }

  function onRightMouseUp(e) {
    if (e.button === 2) {
      isRightClickHeld = false;
    }
    if (e.button === 2) {
      const isCustomRight = config.modifierKey === 'custom' && config.customActivationKey && config.customActivationKey.code === 'MouseRight';
      const wasRecentlyZoomed = wasZoomedWithRightClick || (Date.now() - lastRightClickZoomTime < 1500);
      const isOverMedia = Boolean(activeElement || findDirectMediaAtPoint(e.clientX, e.clientY, e) || isEventOnActiveMedia(e));
      if (wasRecentlyZoomed || (isCustomRight && isOverMedia)) {
        e.stopPropagation();
        e.stopImmediatePropagation();
        document.querySelectorAll('.ytp-contextmenu, .ytp-popup').forEach((m) => {
          m.style.display = 'none';
        });
      }
    }
  }

  window.addEventListener('pointerdown', onRightMouseDown, { capture: true });
  window.addEventListener('mousedown', onRightMouseDown, { capture: true });
  window.addEventListener('contextmenu', blockContextMenu, { capture: true });
  document.addEventListener('contextmenu', blockContextMenu, { capture: true });
  window.addEventListener('pointerup', onRightMouseUp, { capture: true });
  window.addEventListener('mouseup', onRightMouseUp, { capture: true });
  window.addEventListener('blur', onWindowBlur);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) onWindowBlur();
  });
  document.addEventListener('fullscreenchange', onFullscreenChange, { capture: true });
  document.addEventListener('webkitfullscreenchange', onFullscreenChange, { capture: true });
})();
