# ARCHITECTURE.md — AI Labs by Nimbus

## Stack
- Static site: plain HTML, CSS, vanilla JS. No framework, no bundler, no build step.
- Runtime: `server.js` — a minimal Node `http` static file server (no Express, no deps).
- `package.json` scripts: `start` / `dev` → `node server.js`. Docker files exist but aren't needed for local dev.

## Server routing (`server.js`)
- `GET /` → `index.html`
- `GET /explore` and `/explore/` → `explore.html`
- `GET /cms` and `/admin` → `cms.html` (Content Management Matrix panel)
- REST API:
  - `GET /api/v1/content` → retrieves full JSON site content
  - `POST /api/v1/content` → updates JSON, automatically syncs `assets/explore/explore-data.js`, and creates timestamped backup in `data/backups/`
  - `GET /api/v1/products` → headless products API conforming to `CMS_SPECIFICATION.md` Mode B
  - `GET /api/v1/media` → scans and returns assets library
  - `POST /api/v1/media/upload` → uploads image/media files directly into `assets/uploads/`
  - `GET /api/v1/backups` & `POST /api/v1/backups/restore` → revision snapshots and rollbacks
- Any other path → served directly from disk (e.g. `/explore.html`, `/style.css`, `/assets/...`).
- Unmatched paths → plain `404 Not Found`.
- MIME map covers html/css/js/png/jpg/svg/webmanifest/webm/mp4/woff(2)/ttf/webp.
- `POST /save-video` writes an uploaded webm to `assets/research-cognition.webm` (used to seed the Dapper hero video).

## Homepage (`index.html`)
- `#preloader` curtain reveal → `#hero` (18 stacked PNG layers, parallax + cloud drift in `script.js`)
  → `#dapper` (500vh sticky pinned "kinetic" section, 5 chapters, `dapper.css` + `script.js`)
  → `#contact` footer (mountain `bg-footer.png`).
- `script.js` owns: preloader, hero parallax render loop, Dapper sticky controller,
  Chapter-4 video controls + auto-advance, mobile nav, footer magnetic button, scroll reveal, SW registration.
- Design tokens are defined in `style.css` `:root`. Dapper chapter palette is in `dapper.css` `:root`.

## Explore page (`explore.html` + `explore.css` + `explore.js`)
Purpose: a distinct, art-directed "Products & Services" catalogue that still reads as Nimbus.
Art direction: **"The Nimbus Stratosphere"** — an atmospheric observatory.

## Services & Business Audit page (`audit.html` + `audit.css` + `audit.js`)
Purpose: flagship full-spectrum AI services, architecture audit, and enterprise diagnostic page.
Art direction: **Clay.global-inspired AI Innovation Showcase** — large typography hero, alternating left/right service cards with interactive procedural 3D canvas stages (Orbs, Swarms, Matrix, Waves, Lattice), smooth parallax translateY scroll movement, multi-column operational industries matrix (Fintech, B2B, Sovereign Infra, Healthcare, Logistics), and minimalist global research nodes "Let's Talk" contact footer.
- Served at `/services`, `/services/`, `/audit`, and `/business-audit`.
- Linked directly from Homepage ("Book Audit" hero CTA + nav), Explore header, and CMS Matrix.

Files:
- `explore.html` — page shell. Reuses `style.css` (tokens, header, buttons, footer, preloader,
  reveal) and adds `explore.css`. Hero copy is static placeholder; product/service entries are rendered by JS.
- `explore.css` — page-scoped styles, prefixed `xp-`. Sections: hero/aurora/canvas, kinetic bridge,
  product observatory viewer + rail tabs, services accordion, closing CTA, footer extras, responsive + reduced-motion.
- `explore.js` — IIFE. Responsibilities:
  1. preloader curtain reveal
  2. header scroll state + mobile drawer
  3. **canvas atmosphere field** (drifting motes, pointer parallax; 92 desktop / 34 mobile; paused off-screen, tab-hidden, and under reduced-motion)
  4. **product observatory**: builds `role="tablist"` rail + updates the viewer visual (procedural
     `--v1/--v2/--v3` palette + `data-pattern`) and copy panel (`role="tabpanel"`, `aria-live`); arrow/Home/End keys.
  5. **services spectrum**: builds accordion rows (button `aria-expanded` + body); one open at a time.
  6. kinetic bridge: rAF-throttled horizontal translate on scroll.
  7. scroll-reveal observer, footer magnetic button, meta counts, year, SW registration.
- `assets/explore/explore-data.js` — **single source of truth for placeholder content**
  (`window.NIMBUS_EXPLORE_DATA = { meta, products[], services[] }`). Rendered by `explore.js`.
  Visuals are procedural (palette + pattern + glyph); set `visual.image` to a local path to use a real image.

Static assets (all original / in-repo, no third-party):
- `assets/explore/contour.svg` — topographic contour horizon motif.
- `assets/explore/horizon-ridge.svg` — layered mountain ridge silhouette (brand continuity).
- `assets/explore/grain.svg` — feTurbulence film grain.

## Navigation wiring
- Homepage hero CTA `#hero-btn-primary` → `./explore`; homepage desktop + mobile nav gained an "Explore" link.
- Explore header links back to `./`, and to `#products`, `#services`, `#contact`. Footer links to `./` and in-page anchors.

## Known constraints
- No frontend dependencies by design; do not add one for a decorative effect.
- The clean `/explore` route requires the Node server (`file://` opening `explore.html` still renders but
  the `./explore` link won't resolve off-server).
