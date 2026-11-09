# 🔍 Media Zoom Anywhere

<p align="center">
  <b>🇬🇧 English</b> | <a href="README.uk.md">🇺🇦 Українська</a>
</p>

<p align="center">
  <img src="icons/icon128.png" width="96" height="96" alt="Media Zoom Anywhere Logo" />
</p>

<p align="center">
  <b>A lightweight browser extension to zoom, scroll, and pan photos and videos on any website.</b><br>
  <i>Without zooming the entire webpage or accidentally flipping carousel slides.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-brightgreen?style=flat-square" alt="Platform" />
  <img src="https://img.shields.io/badge/Browsers-Chrome%20%7C%20Brave%20%7C%20Edge%20%7C%20Arc-orange?style=flat-square" alt="Browsers" />
  <img src="https://img.shields.io/badge/License-MIT-lightgrey?style=flat-square" alt="License" />
</p>

---

## 🎯 The Problem It Solves

On many modern websites (YouTube, Instagram, Twitter/X, Reddit, e-commerce carousels, portfolio galleries):
1. **Default `Ctrl + Mouse Wheel`** zooms the **entire webpage** (text, sidebars, headers), breaking layout ergonomics.
2. Carousels and image lightboxes hijack `wheel` events: scrolling over a photo or video **flips to the next slide** instead of zooming in.
3. Video players place transparent click-catchers, captions, and control overlays on top of `<video>`, causing generic zoom tools to miss the video or break its centered alignment.

**Media Zoom Anywhere** intercepts wheel and pointer events in the capture phase, isolates them from site scripts and browser page zoom, and smoothly scales **only the target media** directly beneath your cursor.

---

## 🍏 Full macOS & Apple Trackpad Support

Built from the ground up for cross-platform workflows:
- **⌘ Command Key:** Use **`⌘ Cmd + Mouse Wheel`** (or `Ctrl`) on macOS.
- **Apple Magic Trackpad / MacBook Trackpad:**
  - **2-finger Pinch-to-Zoom:** Zooms into the specific photo or video under your cursor without scaling the browser tab.
  - **2-finger Scroll:** When zoomed in, two-finger vertical/horizontal scrolling smoothly pans across the zoomed media.
- **⌥ Option Key:** Available as an alternative activation key in the popup settings.

---

## ✨ Key Features

- 🎯 **Cursor-Anchored Zoom:** Scaling keeps the exact pixel under your mouse pointer locked in place.
- ↕️ **Wheel Pan:** When media is zoomed (> 100%), scrolling the normal mouse wheel pans **up/down** smoothly. Hold **Shift + Wheel** to pan **left/right**. (Scrolling outside the media continues to scroll the webpage normally.)
- 🖐️ **Freeform Drag & Pan:** Hold left-click anywhere on the zoomed photo or video to drag it freely.
- 🎬 **Smart Video Player Support:**
  - Works seamlessly on **YouTube**, HTML5 players, Reels, TikTok, Twitter/X videos, and more.
  - Preserves existing centering (`translate(-50%, -50%)`), bypasses `overflow: hidden`, and pierces subtitle/overlay layers.
  - Leaves playback controls (Play/Pause, timeline scrubber, volume slider) fully clickable.
- 🔄 **Smart Auto-Reset:**
  - Zooming back out to 100%;
  - Double-clicking the media;
  - Pressing `Esc`;
  - Navigating to the next slide or closing a modal/lightbox.
- ⚙️ **Bilingual Popup UI (EN / UK):** Quick enable/disable toggle, language switcher, modifier key selection, zoom speed, and max zoom limit (up to 25x).

---

## ⌨️ Controls & Shortcuts

| Action | Windows / Linux | macOS (Mac) |
|---|---|---|
| **Zoom In / Out** | `Ctrl` + Mouse Wheel | `⌘ Cmd` + Mouse Wheel <br> *(or 2-finger Pinch on Trackpad)* |
| **Pan Vertically (Up / Down)** | Normal Mouse Wheel *(while zoomed)* | 2-finger Scroll Up/Down *(while zoomed)* |
| **Pan Horizontally (Left / Right)** | `Shift` + Mouse Wheel | `Shift` + Wheel / 2-finger Side Scroll |
| **Freeform Drag** | Left-click & Drag | Trackpad / Left-click & Drag |
| **Instant Reset (100%)** | Double-click / `Esc` | Double-click / `Esc` |

---

## 📥 Installation (Chrome, Brave, Edge, Arc, Opera)

Built on **Manifest V3**, compatible with all Chromium-based browsers on **Windows, macOS, and Linux**:

1. Download this repository (click **Code -> Download ZIP** on GitHub or grab the archive from **Releases** and extract it).
2. Open your browser's Extensions page:
   - **Chrome:** `chrome://extensions/`
   - **Brave:** `brave://extensions/`
   - **Edge:** `edge://extensions/`
   - **Arc:** `arc://extensions/`
3. Enable **Developer mode** in the top-right corner.
4. Click **Load unpacked**.
5. Select the extracted folder containing `manifest.json`.
6. Done! Reload open tabs (`F5`) and start zooming.

---

## 🛠️ Technical Highlights

- **Capture-Phase Isolation:** Event listeners for `wheel`, `pointerdown`, and `pointermove` are bound on `window` in the capture phase using `stopImmediatePropagation()`, preventing page swipers and carousels from hijacking gestures.
- **Independent CSS Transform Properties:** Uses modern CSS `scale` and `translate` properties (with `!important`) so site-native `transform` centering rules (`translate(-50%, -50%)`) remain intact.
- **Overlay Piercing:** Uses `document.elementsFromPoint()` and `composedPath()` to accurately target underlying `<img>`, `<video>`, and `<canvas>` elements across Shadow DOM and player overlays.
- **Zero Tracking & Minimal Permissions:** Only requests `storage` permission to save your local preferences. No analytics, external requests, or data collection.

---

## 📄 License

Distributed under the [MIT](LICENSE) License. Contributions, issues, and feature requests are welcome!
