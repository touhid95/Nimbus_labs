# Dapper Kinetic Snap-Scroll Component | Integration Guide

> **AI Labs by Nimbus**  
> Modular kinetic snap-scroll architecture with exclusion blend typography, color-matched gradient layers, and rail translations.

---

## 1. Component Overview & Architecture

This package isolates the Dapper snap-scroll system from `M.k.'s Dapper Site.html` into a fully reusable, modular web component.

### Files in this Package:
- [`dapper.html`](file:///d:/Ai_labs_by%20Nimbus/first%20script/dapper.html): Standalone runnable preview containing the markup, exclusion navbar, viewport typography rail, and 4 snap sections.
- [`dapper.css`](file:///d:/Ai_labs_by%20Nimbus/first%20script/dapper.css): Scoped styles, CSS custom properties, exclusion blend modes, and responsive media queries.
- [`dapper.js`](file:///d:/Ai_labs_by%20Nimbus/first%20script/dapper.js): Self-contained vanilla JS controller driving rail translations, progress bar, difference background reveal, and keyboard/anchor navigation.

---

## 2. Color Palette Alignment

The Dapper color system has been mapped to match the AI Labs scenery color space:

| Slide | Section Theme | Color Token | Hex Code | Visual Context |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `FRONTIER` | `--dapper-bg-plum` | `#2f122e` | Matches bottom mountain/rock silhouette and twilight base |
| **02** | `NEURAL` | `--dapper-bg-rose` | `#e25c80` | Matches warm sunset cloud highlights and horizon glow |
| **03** | `AGENTIC` | `--dapper-bg-violet` | `#6459e8` | Matches AI Labs electric violet brand signature |
| **04** | `NIMBUS` | `--dapper-bg-midnight` | `#020016` | Matches cosmic deep space background |

---

## 3. Drop-in HTML Snippet

To integrate Dapper into any host HTML document:

```html
<!-- 1. EXCLUSION NAVBAR -->
<nav class="dapper-navbar" id="dapper-navbar">
  <div class="dapper-brand-wrapper">
    <div class="dapper-brand-static">AI LABS</div>
    <div class="dapper-brand-rail">
      <div class="dapper-brand-word active" data-index="0">FRONTIER</div>
      <div class="dapper-brand-word" data-index="1">NEURAL</div>
      <div class="dapper-brand-word" data-index="2">AGENTIC</div>
      <div class="dapper-brand-word" data-index="3">NIMBUS</div>
    </div>
  </div>

  <div class="dapper-menu-wrapper">
    <a href="#dapper-slide-1" class="dapper-nav-link active" data-target="0">Frontier<sup>1</sup></a>
    <a href="#dapper-slide-2" class="dapper-nav-link" data-target="1">Neural<sup>2</sup></a>
    <a href="#dapper-slide-3" class="dapper-nav-link" data-target="2">Agentic<sup>3</sup></a>
    <a href="#dapper-slide-4" class="dapper-nav-link" data-target="3">Nimbus<sup>4</sup></a>
  </div>
</nav>

<!-- 2. KINETIC TYPOGRAPHY & OVERLAY SYSTEM -->
<div class="dapper-viewport-overlay" id="dapper-viewport-overlay">
  <div class="dapper-header-wrapper">
    <div class="dapper-header-rail" id="dapper-header-rail">
      <h1 class="dapper-hero-text">FRONTIER</h1>
      <h1 class="dapper-hero-text">NEURAL</h1>
      <h1 class="dapper-hero-text">AGENTIC</h1>
      <h1 class="dapper-hero-text">NIMBUS</h1>
    </div>
  </div>

  <div class="dapper-subheader-wrapper left">
    <div class="dapper-subheader">AI LABS BY NIMBUS</div>
  </div>
  <div class="dapper-subheader-wrapper right">
    <div class="dapper-subheader" id="dapper-chapter-indicator">CHAPTER 01 / 04</div>
  </div>

  <div class="dapper-separator"></div>

  <div class="dapper-progress-wrapper">
    <div class="dapper-progress-bar" id="dapper-progress-bar"></div>
  </div>

  <!-- Difference Background Layers -->
  <div class="dapper-layers-stack">
    <div class="dapper-layer-bg is--1"></div>
    <div class="dapper-layer-bg is--2" id="dapper-layer-2"></div>
    <div class="dapper-layer-bg is--3" id="dapper-layer-3"></div>
    <div class="dapper-layer-bg is--4" id="dapper-layer-4"></div>
  </div>
</div>

<!-- 3. SNAP SCROLL SLIDES WITH FLOATING HUD CARDS -->
<main class="dapper-snap-container" id="dapper-snap-container">
  <!-- Slide 1: Frontier (specs + token throughput gauge) -->
  <section id="dapper-slide-1" class="dapper-snap-slide" data-index="0" data-label="FRONTIER">
    <div class="dapper-hud-container">
      <div class="hud-card hud-left">
        <!-- Architecture specs, 128k context, MMLU 91.4% -->
      </div>
      <div class="hud-card hud-right">
        <!-- Live token throughput gauge, model switcher, animated waveform -->
      </div>
    </div>
  </section>
  
  <!-- Slide 2: Neural (16,384 H100 GPU pod cluster matrix) -->
  <!-- Slide 3: Agentic (autonomous swarm radar & task counter) -->
  <!-- Slide 4: Nimbus (cloud fabric + copyable quickstart SDK code block) -->
</main>
```

---

## 4. Floating HUD Micro-Widgets Included

1. **Slide 1 (`FRONTIER`)**:
   - Left: Nimbus-Omni 400B architectural specs, FP8 precision, < 17.8ms reasoning latency.
   - Right: Real-time token throughput gauge (`2,480 tok/s`), live fluctuating waveform, and model selector pills (`Omni 400B`, `Coder 70B`, `Flash 8B`).
2. **Slide 2 (`NEURAL`)**:
   - Left: 16,384 H100 SXM5 compute specs, 3.2 Tbps InfiniBand interconnect, 32.4 ExaFLOPs.
   - Right: Live FLOPs utilization ticker (`88.6%`) and 16-pod LED health monitor grid.
3. **Slide 3 (`AGENTIC`)**:
   - Left: Graph-of-Thoughts consensus engine, Lean 4 / Z3 formal proof verification.
   - Right: Interactive 4-node swarm pipeline (`[P] Planner` → `[E] Executor` → `[V] Verifier` → `[S] Synthesizer`) and live tasks completed counter (`1,482,910+`).
4. **Slide 4 (`NIMBUS`)**:
   - Left: 34 global edge POPs, confidential enclave security, 99.995% SLA.
   - Right: Multi-language Quickstart SDK widget (`TypeScript`, `Python`, `cURL`) with one-click clipboard copy (`✓ Copied!`) and documentation action button.

---

## 5. Unification with Hero Scenery (Section 0)

When mounting inside a single continuous experience where Section 0 is the Scenery Parallax (as implemented in the root `index.html`):
1. Wrap both the Scenery Hero and Dapper sections inside `.fullpage-snap-container`.
2. Offset Dapper index by `+1` (Section 0 = Hero, Sections 1–4 = Dapper slides).
3. The Dapper overlay sets `visibility: hidden; opacity: 0;` while on Section 0, and smoothly ktransitions to `opacity: 1; visibility: visible;` as soon as the user scrolls into Section 1.

---

## 6. Verification & Testing

To test this component standalone:
1. Serve the `first script` directory with any static server:
   ```bash
   node server.js
   ```
2. Open [`http://localhost:3000/first%20script/dapper.html`](http://localhost:3000/first%20script/dapper.html) in your browser.
3. Test snap scrolling with wheel, touch, arrow keys, and top navbar anchor links.

