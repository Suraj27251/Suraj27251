# Portfolio Website

A single-page portfolio built from the profile README. Static files, no build step, no
dependencies — open `index.html` and it runs.

## Run it

```bash
# simplest — just open it
start index.html

# or serve it (recommended, so the clipboard API works on localhost)
python -m http.server 8000
# → http://localhost:8000
```

The copy-to-clipboard buttons need a secure context. Over `file://` most browsers block
`navigator.clipboard`, so the code falls back to `document.execCommand('copy')`; serving
over `localhost` or HTTPS makes the modern path available.

To publish, upload the `portfolio/` folder to GitHub Pages, Netlify, Vercel or any
static host. No configuration needed.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Whole page — semantic HTML5, one document, no templating |
| `css/style.css` | All styling. Tokens in `:root`, components in numbered sections |
| `js/main.js` | All behaviour, ~250 lines, IIFE, no globals |
| `DESIGN.md` | The design system this was built against — read it before restyling |

## How it's built

**No framework, no build, no libraries.** Three files, plain ES5-compatible JS, CSS
custom properties. It loads in well under a second and works offline apart from the two
CDN fonts, the Bootstrap Icons sprite and one Unsplash image.

**Theming** is a token swap. Every colour is a CSS variable in `:root`; the light theme
lives entirely in `[data-theme="light"]` on `<html>` and re-declares the same names.
Component rules never mention a colour directly. To add a third theme, add one more
attribute block.

**Motion is tier L2** — scroll reveals, a morphing navbar, spotlight cards, an aurora
background, animated counters and chart draws. Deliberately no scroll-jacking, no
pinning, no WebGL and no `filter: blur()` on moving elements, because those are what
turns an impressive page into a janky one on a mid-range laptop.

**Everything degrades.** The scroll-reveal hidden state is gated behind an `.io-ok`
class that only exists if `IntersectionObserver` does. With JS off — or in a browser
where IO callbacks never arrive — every element is simply visible. A 4-second watchdog
catches that second case. Content is never contingent on an animation running.

**`prefers-reduced-motion`** is fully implemented: aurora drift, marquee, orbit rings,
pulses and the hero mask reveal all stop, counters resolve to final values, and skill
bars and chart rings jump to their end state.

## Editing content

All copy lives in `index.html` as plain text — no data file, no JSON. Search for the
section and edit.

**Numbers** that animate are marked up like this:

```html
<span data-count="40">0</span>
```

`data-count` is the target value; `data-decimals="2"` handles decimals. Nothing else
needs changing.

**Progress bars** read their target from `data-level`:

```html
<span class="skill-fill" data-level="92"></span>
```

**The OTIF rings** carry their own arc length in `data-len`, precomputed from the
percentage and the circle's circumference:

```html
<circle class="donut-seg donut-overall" cx="100" cy="100" r="80" data-len="241.0" />
```

To change a percentage, recompute `data-len` = `2 × π × r × percent`. For `r=80` the
full circle is `502.65`, so 47.95% → `241.0`.

## Accessibility

- Skip-to-content link, landmark elements, one `<h1>`
- All decorative layers — aurora orbs, orbit rings, marquee — are `aria-hidden="true"`
- Every chart has an `aria-label` describing the values in words, so the data is available
  without sight
- Focus-visible outlines on every interactive element
- Verified: no horizontal overflow and no touch target under 44×44px at 360, 390, 768,
  1024 and 1440px

## Content accuracy

Every figure on the page is taken from `README.md` and traceable to it — the OTIF
percentages, order and line counts, query counts, requirement counts, response-time
change and hours saved. The BPMN swimlane and the radar chart are labelled as conceptual
and self-assessed respectively; the BPMN figure is explicitly captioned as an
illustration of the redesign, not a screenshot of the real model. No invented clients,
testimonials or metrics.

If you replace the radar with real proficiency data, update the `aria-label` too.

## Browser support

Current Chrome, Edge, Firefox and Safari. Uses `IntersectionObserver`,
`backdrop-filter`, CSS custom properties, `aspect-ratio`, `mask-image` and `clamp()` —
all baseline-supported. `backdrop-filter` and `mask-image` degrade to solid backgrounds,
which is why surfaces always declare a background colour underneath the blur.