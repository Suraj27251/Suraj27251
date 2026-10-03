# DESIGN.md

> Dark aurora control-room for a Business Analyst who thinks in systems, data and root causes.

## 1. Visual Theme & Atmosphere

**Style**: Dark Tech / Aurora Gradient
**Keywords**: deep-space navy, aurora bloom, glass panels, data-grid, precise, luminous, layered, calm-authority
**Tone**: Confident, analytical, quietly premium — NOT neon-arcade, NOT corporate-stock, NOT playful-toy
**Feel**: Like standing in front of a live operations dashboard at 2am — dark room, glowing traces of data, everything calm and accounted for.

**Interaction Tier**: L2 Flowing Interactive
**Dependencies**: CSS only + vanilla JS (IntersectionObserver, rAF-throttled pointermove). No GSAP, no Lenis, no WebGL — keeps 60fps on mid-range hardware.

## 2. Color Palette & Roles

```css
:root {
  /* Backgrounds */
  --bg:              #070B18;   /* page base — deep space navy */
  --bg-elev:         #0B1224;   /* alternate section base */
  --surface:         rgba(255,255,255,0.035);
  --surface-alt:     rgba(255,255,255,0.055);
  --surface-hover:   rgba(255,255,255,0.075);

  /* Borders */
  --border:          rgba(148,180,255,0.11);
  --border-hover:    rgba(124,214,255,0.42);

  /* Text */
  --text:            #EAF1FF;
  --text-secondary:  #A6B4CE;
  --text-tertiary:   #6E7E9C;

  /* Accent — aurora cyan → violet */
  --accent:          #4CC9F0;
  --accent-2:        #7C5CFF;
  --accent-3:        #2BE0C8;
  --accent-hover:    #7FDBFF;

  /* RGB variants for rgba() */
  --bg-rgb:          7,11,24;
  --accent-rgb:      76,201,240;
  --accent-2-rgb:    124,92,255;
  --accent-3-rgb:    43,224,200;

  /* Semantic */
  --warning:         #FFB020;   /* "success" maps to --accent-3 (mint); no separate token */
}
```

**Color Rules:**
- Zero hardcoded hex in component CSS — every color resolves through a variable.
- One gradient family (`--accent` → `--accent-2`) is the only decorative gradient. Semantic colors never appear in gradients.
- Aurora orbs use accent RGB at 6–14% alpha only. They are atmosphere, never content.
- Light theme is a token swap on `[data-theme="light"]` — no component-level overrides. It also re-declares `--sh-subtle` / `--sh-elev` / `--sh-lift`, retints ring/bar tracks and drops `.aurora-orb` opacity to `.28`, because dark-mode shadows and full-strength orbs look wrong on white.
- The only raw hex permitted outside the token blocks is an opaque `#000` stop inside a `mask-image` gradient (masks need alpha, not colour), plus the print stylesheet's ink colours.

## 3. Typography Rules

**Font Stack:**
```css
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
```

| Role | Font | Size | Weight | Line Height | Letter Spacing |
|------|------|------|--------|-------------|----------------|
| Hero H1 | Sora | clamp(2.75rem, 7vw, 5.25rem) | 800 | 1.02 | -0.035em |
| Section H2 | Sora | clamp(2rem, 4vw, 2.9rem) | 700 | 1.1 | -0.028em |
| H3 / card title | Sora | 1.25rem | 600 | 1.3 | -0.015em |
| Body | Inter | 1rem | 400 | 1.7 | 0 |
| Label / eyebrow | Inter | 0.75rem | 600 | 1 | 0.18em (uppercase) |
| Mono / metric | JetBrains Mono | 0.9rem | 500 | 1.5 | 0 |

**Typography Rules:**
- Heading weight ≥ 600. Body never below 400.
- Uppercase + letterspacing reserved exclusively for eyebrows/labels — never for headings.
- Numbers in metrics always use JetBrains Mono for tabular alignment.
- **NEVER use**: script/handwriting faces, condensed display faces, more than 3 families.

**Text Decoration:**
- Hero H1: gradient fill on the name span only (`--accent` → `--accent-2`), `background-clip: text`. The rest stays solid `--text`.
- Section H2: NO gradient, NO shadow. Solid `--text`. Understated rule so the gradient keeps its impact in one place.
- Metric numbers: solid `--text` with a soft accent glow (text-shadow at 30% alpha) — never gradient.

## 4. Component Stylings

### Buttons
```css
.btn {
  display: inline-flex; align-items: center; gap: .6rem;
  padding: .85rem 1.6rem; border-radius: 999px;
  font: 600 .9rem/1 'Inter', sans-serif; letter-spacing: .01em;
  border: 1px solid transparent; cursor: pointer;
  transition: transform .28s cubic-bezier(.2,.8,.2,1),
              box-shadow .28s, background .28s, border-color .28s, color .28s;
}
.btn-primary { background: linear-gradient(120deg, var(--accent), var(--accent-2)); color: #04121C; }
.btn-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 34px -10px rgba(var(--accent-2-rgb), .7); }
.btn-primary:active { transform: translateY(-1px) scale(.985); }
.btn-secondary { background: var(--surface); border-color: var(--border); color: var(--text); backdrop-filter: blur(10px); }
.btn-secondary:hover { background: var(--surface-hover); border-color: var(--border-hover); transform: translateY(-3px); }
.btn-ghost { background: transparent; border-color: var(--border); color: var(--text-secondary); }
.btn-ghost:hover { color: var(--text); border-color: var(--accent); background: var(--surface); }
.btn:focus-visible { outline: 2px solid var(--accent); outline-offset: 3px; }
.btn:disabled { opacity: .45; pointer-events: none; filter: saturate(.4); }
```

### Cards
```css
.card {
  position: relative; overflow: hidden;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 20px; padding: 1.75rem;
  backdrop-filter: blur(12px);
  transition: transform .4s cubic-bezier(.2,.8,.2,1), border-color .4s, background .4s;
}
.card::before {           /* spotlight — rAF-throttled --mx/--my */
  content: ''; position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(340px circle at var(--mx,50%) var(--my,0%),
              rgba(var(--accent-rgb),.13), transparent 62%);
  opacity: 0; transition: opacity .35s;
}
.card:hover { transform: translateY(-6px); border-color: var(--border-hover); background: var(--surface-alt); }
.card:hover::before { opacity: 1; }
.card:focus-within { border-color: var(--border-hover); }
```

### Navigation
```css
.navbar { position: fixed; inset: 0 0 auto; z-index: 100;
  transition: background .35s, border-color .35s, backdrop-filter .35s, padding .35s; }
.navbar.scrolled { background: rgba(var(--bg-rgb), .72); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border); }
.nav-link { position: relative; color: var(--text-secondary); transition: color .25s; }
.nav-link::after { content:''; position:absolute; left:0; bottom:-6px; height:2px; width:100%;
  background: linear-gradient(90deg,var(--accent),var(--accent-2));
  transform: scaleX(0); transform-origin: left; transition: transform .32s cubic-bezier(.2,.8,.2,1); }
.nav-link:hover, .nav-link.active { color: var(--text); }
.nav-link:hover::after, .nav-link.active::after { transform: scaleX(1); }
```

### Links
```css
a { color: var(--accent); text-decoration: none;
    transition: color .25s, opacity .25s; }
a:hover { color: var(--accent-hover); }
/* underline wipes in from left on hover */
.link-wipe { background-image: linear-gradient(var(--accent),var(--accent));
  background-size: 0% 1px; background-position: 0 100%; background-repeat: no-repeat;
  transition: background-size .35s cubic-bezier(.2,.8,.2,1), color .25s; }
.link-wipe:hover { background-size: 100% 1px; }
```

### Tags / Badges
```css
.tag { display:inline-flex; align-items:center; gap:.4rem;
  padding:.35rem .8rem; border-radius:999px;
  background: rgba(var(--accent-rgb),.09); border:1px solid rgba(var(--accent-rgb),.22);
  color: var(--accent); font:500 .74rem/1 'Inter',sans-serif; letter-spacing:.02em;
  transition: background .25s, border-color .25s, transform .25s; }
.tag:hover { background: rgba(var(--accent-rgb),.17); border-color: rgba(var(--accent-rgb),.45); transform: translateY(-2px); }
```

### Metric Card
```css
.metric { text-align:center; padding:2rem 1.25rem; }
.metric-value { font: 800 clamp(2.4rem,5vw,3.6rem)/1 'JetBrains Mono',monospace;
  background: linear-gradient(135deg,var(--accent),var(--accent-2));
  -webkit-background-clip:text; background-clip:text; color:transparent; }
```

### Skill Bar
```css
.skill-track { height:6px; border-radius:999px; background: rgba(255,255,255,.06); overflow:hidden; }
.skill-fill { height:100%; width:0; border-radius:999px;
  background: linear-gradient(90deg,var(--accent),var(--accent-2));
  transition: width 1.1s cubic-bezier(.22,1,.36,1); }
```

### Section Marker
```css
.eyebrow { display:inline-flex; align-items:center; gap:.55rem;
  font:600 .74rem/1 'Inter',sans-serif; letter-spacing:.18em; text-transform:uppercase;
  color: var(--accent); margin-bottom:1rem; }
.eyebrow::before { content:''; width:26px; height:1px;
  background: linear-gradient(90deg,transparent,var(--accent)); }
```

## 5. Layout Principles

**Container:**
- Max width: 1200px
- Padding: 24px (desktop) / 20px (tablet) / 18px (mobile)
- Narrow variant (prose): 720px

**Spacing Scale:**
- Section padding: `clamp(72px, 10vw, 130px) 0`
- Component gap: 20px (tight) / 32px (cards) / 64px (major blocks)
- Card internal padding: 28px desktop / 20px mobile

**Grid:**
```css
.grid { display:grid; gap:1.5rem; }
.grid-2 { grid-template-columns: repeat(2,1fr); }
.grid-3 { grid-template-columns: repeat(3,1fr); }   /* projects bento uses explicit spans */
.grid-4 { grid-template-columns: repeat(4,1fr); }   /* metrics */
```

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat | no shadow, `--surface` | chips, tags |
| Subtle | `0 2px 10px rgba(var(--bg-rgb),.3)` | timeline entries |
| Elevated | `0 18px 44px -18px rgba(var(--bg-rgb),.85)` | cards at rest |
| Hover lift | `0 26px 60px -20px rgba(var(--accent-2-rgb),.42)` | cards on hover, primary button |
| Glass | `backdrop-filter: blur(12px)` + 1px `--border` | nav, floating panels |

Only two shadow "weights" for cards (rest + hover). Anything heavier reads as a modal.

## 7. Animation & Interaction

**Motion Philosophy**: Everything moves because it is *revealed*, never because it is *decorated*. Motion is used to direct attention — opacity, transform and one background-position flow only.

**Tier**: L2

### Dependencies
```html
<!-- none. Zero JS animation libraries. -->
```

### Base Setup
```js
// 1. reveal observer — one shared IntersectionObserver for all .reveal nodes
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-visible');
    io.unobserve(e.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -60px' });
document.querySelectorAll('.reveal').forEach((n, i) => {
  n.style.setProperty('--d', `${(i % 6) * 70}ms`);   // stagger
  io.observe(n);
});
```

### Entrance Animation
```css
@keyframes maskReveal { from { opacity:0; clip-path: inset(0 0 100% 0); transform: translateY(20px); }
                        to   { opacity:1; clip-path: inset(0 0 0 0);   transform:none; } }

/* Progressive enhancement gate — see note below */
html.io-ok .reveal { opacity:0; transform: translateY(28px);
  transition: opacity .8s var(--d,0ms) cubic-bezier(.22,1,.36,1),
              transform .8s var(--d,0ms) cubic-bezier(.22,1,.36,1); }
html.io-ok .reveal.is-visible { opacity:1; transform:none; }
.hero-title .line > span { display:inline-block; animation: maskReveal .95s cubic-bezier(.22,1,.36,1) both; }
```

**Reveal gate (important).** The hidden state is scoped to `html.io-ok`, a class added by a tiny inline `<head>` script **only** when `IntersectionObserver` exists. Consequences:
- JS disabled → class absent → every element renders visible. No blank page.
- IO present but callbacks never delivered (some embedded webviews, headless renderers) → a 4s watchdog in `main.js` sees that nothing revealed, removes `io-ok`, and force-reveals everything.

Without this, a default `opacity: 0` on 42 nodes means any IO-less browser renders a permanently blank page below the hero. The reveal animation is an enhancement, never a precondition for content.

### Scroll Behavior
```js
// nav scroll state + active section (rAF-throttled)
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    navbar.classList.toggle('scrolled', scrollY > 40);
    ticking = false;
  });
}, { passive: true });

// counters — ease-out cubic on rAF, fires once
const ease = t => 1 - Math.pow(1 - t, 3);
function countUp(node) {
  const target = +node.dataset.count, dur = 1600, t0 = performance.now();
  const dec = +(node.dataset.decimals || 0);
  (function step(now) {
    const p = Math.min((now - t0) / dur, 1);
    node.textContent = (target * ease(p)).toFixed(dec);
    if (p < 1) requestAnimationFrame(step);
  })(t0);
}

// skill bars — width driven by data-level once visible
// spotlight — pointermove rAF-throttled, only under (hover:hover)
```

### Hover & Focus States
- All interactive elements: `hover` lift/tint + `:focus-visible` 2px accent outline at 3px offset.
- Spotlight cards: opacity 0 → 1 on `::before` over .35s.
- Marquee band: pure CSS `translateX` keyframes, duplicated track for seamless loop.
- Theme toggle: icon crossfade + 40° rotation, .35s.

### Special Effects
1. **Aurora background** — 3 blurred orbs, CSS-only `translate`/`scale` keyframes, 22–34s loops, ≤14% alpha, `will-change: transform` (never `filter`).
2. **Mouse-follow spotlight** on hero + cards — CSS vars `--mx/--my` written in rAF. Disabled on touch via `matchMedia('(hover:hover)')`.
3. **Aurora marquee band** — scrolling keyword strip between Hero and About. ⭐ *The 巧思: it carries live role keywords, so the decoration doubles as content.*
4. **Counters + skill bars** — triggered once on reveal.
5. **Copy-to-clipboard** on email/phone with a sparkle micro-animation on success. ⭐ *巧思 #2.*
6. **Custom SVG data visuals** — animated OTIF donut, churn bars, 6-axis skills radar, BPMN swimlane. All pure SVG, stroke-dashoffset animated on reveal.

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
  .reveal { opacity: 1 !important; transform: none !important; clip-path: none !important; }
  .aurora-orb, .marquee-track { animation: none !important; }
  .skill-fill { width: var(--level) !important; }
  .aurora-bg { background: var(--bg); }   /* heavy bg → static gradient */
}
```

## 8. Do's and Don'ts

### Do
- ✅ Keep every color behind a CSS variable so the light-theme swap is one block.
- ✅ Give each scroll reveal a stagger of ≤70ms — visible rhythm, never a queue.
- ✅ Animate `transform` and `opacity` only; reserve `background-position` for the gradient flow.
- ✅ Pair every interactive element with a `:focus-visible` outline so the site is fully keyboard-navigable.
- ✅ Use inline SVG for all data visuals so charts are crisp, themeable and dependency-free.
- ✅ Keep hero above the fold on a 1366×768 laptop: headline, role, and both primary CTAs must all be visible without scrolling.
- ✅ Write alt text that carries meaning; decorative orbs and SVGs get `aria-hidden="true"`.

### Don't
- ❌ No `filter: blur()` on moving elements — it forces a repaint every frame and tanks mid-range GPUs. Static blur on a non-animating layer only.
- ❌ No `backdrop-filter` above 14px, and never on a full-width scrolling band.
- ❌ No scroll-jacking, no `Lenis`, no pinned sections, no `ScrollTrigger`. Native `scroll-behavior: smooth` only.
- ❌ No WebGL, no Three.js, no canvas particle systems — L2 does not need a render loop, and one continuous rAF loop is the only rAF budget spent.
- ❌ No rainbow gradients. One gradient family (cyan→violet) plus one mint semantic accent, globally.
- ❌ No gradient text on section headings or body copy — gradient is reserved for the hero name and metric numbers.
- ❌ No horizontal overflow below 600px. Test at 360px, not 390px.
- ❌ No emoji as UI iconography — icons come from Bootstrap Icons; emoji appear only as decorative accents inside section headings where they add warmth, and always paired `aria-hidden`.
- ❌ No fabricated metrics, clients or testimonials. Every number on the page traces back to the source README.
- ❌ No `!important` overrides outside the reduced-motion block.

## 9. Responsive Behavior

**Breakpoints:**
| Name | Width | Key Changes |
|------|-------|-------------|
| Desktop | > 1024px | Full nav inline; hero 2-col (1.1fr / .9fr); projects 3-col bento; metrics 4-up; education 2-col |
| Tablet | 768–1024px | Hero stacks, visual below text; projects 2-col; metrics 2×2; education single col |
| Mobile | < 768px | Burger menu (44×44 hit area); metrics 2-up; timeline left-rail collapses; marquee font shrinks |
| Small | < 400px | Metrics 1-up; project cards lose bento spans; section padding tightens |

**Touch Targets:** minimum 44×44px — nav links get `padding: 10px 0`, chips and copy buttons get min-height 44px on coarse pointers.

**Collapsing Strategy:** Bento spans collapse in order of importance (wide → half → full). The timeline rail moves from a left vertical line to a compact left-dot marker. The hero profile card drops its floating chips below 768px and animates them statically to avoid layout jitter.

```css
@media (max-width: 1024px) {
  .hero-inner { grid-template-columns: 1fr; }
  .grid-3, .grid-4 { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 768px) {
  .nav-menu { position: fixed; inset: 64px 0 auto; flex-direction: column;
              background: rgba(var(--bg-rgb),.96); backdrop-filter: blur(18px);
              transform: translateY(-12px); opacity: 0; pointer-events: none;
              transition: opacity .3s, transform .3s; }
  .nav-menu.open { opacity: 1; transform: none; pointer-events: auto; }
  .section { padding: clamp(64px,14vw,96px) 0; }
}
@media (max-width: 600px) {
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .metrics { grid-template-columns: repeat(2,1fr); }
  .hero-buttons .btn { width: 100%; justify-content: center; }
}
@media (max-width: 400px) { .metrics { grid-template-columns: 1fr; } }
```