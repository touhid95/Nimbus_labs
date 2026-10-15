# TASKS.md

## Done
- [x] Inspect existing site (stack, tokens, fonts, nav, hero, Dapper, assets, server).
- [x] Establish Explore art direction ("The Nimbus Stratosphere") reusing brand identity.
- [x] Create original SVG assets: `contour.svg`, `horizon-ridge.svg`, `grain.svg`.
- [x] Create placeholder content config `assets/explore/explore-data.js` (products + services).
- [x] Build `explore.html` (hero, kinetic bridge, product observatory, services spectrum, closing, footer).
- [x] Build `explore.css` (tokens, hero/aurora/canvas, viewer, accordion, responsive, reduced-motion).
- [x] Build `explore.js` (canvas field, product tabs, service accordion, bridge, reveal, magnetic, SW).
- [x] Wire homepage `#hero-btn-primary` + nav "Explore" link → `./explore`.
- [x] Add `/explore` + `/explore/` routes to `server.js`.
- [x] Verify: JS syntax, HTTP 200 routes, CDP overflow/interaction/console checks at 5 viewports.
- [x] Write continuity docs (`AGENTS.md`, `ARCHITECTURE.md`, `PROJECT_STATE.md`, `ASSET_SOURCES.md`).

## Next (content + polish)
- [ ] Human visual review; adjust colour/rhythm if needed.
- [ ] Replace placeholder products/services in `assets/explore/explore-data.js` with real content;
      set `visual.image` to real local image paths where desired.
- [ ] Replace hero copy in `explore.html` with final copy.
- [ ] Point product `link` fields to real destinations (currently `#` → "Enquire" fallback).
- [ ] Optional: add Explore link to the homepage footer link groups.
- [ ] Optional: real focus-style audit and cross-browser (Firefox/Safari) pass.

## Notes / constraints
- Keep zero runtime dependencies.
- Keep content in `explore-data.js`, not in components.
- Do not fabricate business facts; placeholder copy only.
