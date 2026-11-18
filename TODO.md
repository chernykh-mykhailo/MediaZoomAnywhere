# Media Zoom Anywhere — Roadmap & TODO

## 1. Feature: Expand Feed Preview Videos Outside Card Frame

### Status
**Temporarily disabled and hidden from Options UI** (v1.x).
Preview videos in feeds (such as YouTube, X/Twitter, Reddit) currently zoom within their player container boundaries using hardware-accelerated CSS `transform`.

---

### Problem Description & Root Cause Analysis

When "Expand preview video outside frame" is attempted on dynamic feed cards:
1. **Container DOM Mutations Trigger Player Tear-down:**
   - On YouTube feed cards (`ytd-rich-item-renderer`), the inline preview player (`#inline-preview-player` inside `<ytd-video-preview>`) is a dynamically mounted Web Component managed by Polymer.
   - When the extension traversed parents up to `body` and changed `overflow-x/y: visible !important`, `position: relative !important`, and `z-index: 2147483640 !important`, YouTube's internal observers and pointer scrim (`.ytp-inline-preview-scrim`) detected mouseleave / layout disruption.
   - YouTube reacted by immediately unmounting or destroying the `#inline-preview-player` instance, causing the video element to vanish and falling back to the static thumbnail `<img>`.

2. **Timing & Element Lock Contention:**
   - If the user began rolling the wheel before YouTube finished initializing and buffering the video stream (typically 200–500ms delay after hover), target detection could lock onto the static thumbnail `<img>`.
   - Modifying styles on the static image prevented the video player from mounting cleanly.

3. **Chrome Video Compositing:**
   - Chrome's Blink compositor (`cc::VideoLayerImpl`) handles `<video>` surfaces differently from `<img>`. CSS `scale: X` independent properties are ignored or delayed on hardware-accelerated video layers; standard `transform: translate(...) scale(...) !important` must always be used.

---

### Proposed Architectural Solutions for Future Implementation

#### Option A: Floating Portal / Mirror Overlay (Recommended)
- Instead of mutating the host website's complex card hierarchy (which triggers site-specific unmount logic), create an isolated, top-level floating portal container appended to `document.documentElement` or `document.body`.
- **Mechanism:**
  - Either mirror the active playing video into the floating portal using `HTMLMediaElement.captureStream()` attached to an overlay `<video>`, or draw onto an off-screen `<canvas>`.
  - Apply arbitrary zoom, pan, and expansion in this detached overlay layer without touching the host site's cards or scrims.
  - When zoom returns to 100% or user moves away, destroy the overlay.

#### Option B: Minimal Inner-Only Wrapper Expansion
- Restrict overflow removal strictly to immediate video wrappers (e.g., `.html5-video-container`) while strictly avoiding any style changes to parent cards (`ytd-rich-item-renderer`, `ytd-thumbnail`, `#dismissible`, etc.).
- Prevent z-index elevation on cards to keep YouTube's hover scrims active.

#### Option C: Synthetic Event Interception
- Intercept and suppress synthetic `mouseleave` / `pointerleave` events emitted by YouTube's scrim during active zoom gestures.

---

### Verification Checklist (When Resuming Work)
- [ ] YouTube Home feed cards (`ytd-rich-item-renderer`)
- [ ] YouTube Subscriptions / Channel grids
- [ ] X / Twitter timeline autoplay videos
- [ ] Reddit feed inline video cards
- [ ] No flicker or fallback to thumbnail during continuous wheel zoom
- [ ] Clean reset on outside click or escape
