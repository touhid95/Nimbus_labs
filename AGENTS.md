# AGENTS.md — Nimbus Labs (AI Labs by Nimbus)

Stable working instructions for any coding agent/model on this repo. Keep this file
about **durable conventions**, not about the current task (put task state in
`PROJECT_STATE.md` / `TASKS.md`).

## What this project is
A **zero-dependency static PWA** for "AI Labs by Nimbus". No framework, no bundler,
no build step. Plain HTML + CSS + vanilla JS served by a tiny custom Node server.

- Home: `index.html` (18-layer parallax mountain/cloud hero + "Dapper" kinetic pinned section + footer)
- Explore page: `explore.html` → served at `/explore` (added by this work)

## Run it
```bash
npm start          # or: node server.js   → http://localhost:3000/
npm run dev        # same as start
```
There are **no lint/typecheck/test scripts**. The closest thing to "build" is
`node server.js`. Do not add a bundler unless a task explicitly requires it.

Serve pages through `server.js` when testing routes. Opening `explore.html` via
`file://` works for the page itself, but the clean `/explore` route only works
through the Node server.

## Verify your changes (do this before claiming done)
1. `node --check <file>.js` on every JS file you touch.
2. Start the server and check HTTP 200 for the routes you changed:
   `node server.js` then request `/`, `/explore`, `/explore.html`, and any new assets.
3. Headless Edge is available at
   `C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe` and supports
   `--headless=new --dump-dom <url>` and `--screenshot=out.png --window-size=W,H <url>`.
   Use it (or CDP on `--remote-debugging-port`) to confirm rendering, check for
   console errors, and detect horizontal overflow. There is no Puppeteer/Playwright
   dependency; do not add heavy browser tooling just for a check.

## Conventions
- **Vanilla JS only**, wrapped in an IIFE with `'use strict'`. Match
  `script.js` / `explore.js` style. No ES module imports in browser code.
- **CSS design tokens** live in `:root` in `style.css` (`--primary: #6459e8`, `--black: #020016`,
  `--secondary: #a855f7`, `--accent: #f43f5e`, fonts, etc.). Reuse them; don't invent a second palette.
- **Fonts**: Outfit (headings), Plus Jakarta Sans (body), JetBrains Mono (HUD/mono labels).
- **Motion**: transform/opacity only, `will-change` sparingly, throttle scroll work with
  `requestAnimationFrame`, and always honor `prefers-reduced-motion`.
- **Accessibility**: semantic HTML, real buttons for actions, keyboard support,
  visible focus, no hover-only essential actions.
- **Placeholder content** lives in data files (`assets/explore/explore-data.js`), rendered by
  JS. Keep content separate from layout.
- Don't fabricate business facts (names, stats, clients, testimonials). Use obvious
  placeholders ("Product 01", "Temporary product description.").
- Preserve the existing homepage. Only touch it to wire navigation/infrastructure.

## Don'ts
- No new runtime dependencies unless a task justifies it (this project is intentionally dependency-free).
- No secrets/keys in the repo.
- No `$(...)`, `&&`, or bash-isms — the shell is **Windows PowerShell 5.1**.
- Don't rewrite unrelated files; don't delete existing assets without checking their use.

## Where things are
See `ARCHITECTURE.md` for the file map and the Explore page internals, and
`PROJECT_STATE.md` for the current verified status.
