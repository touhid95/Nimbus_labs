# ASSET_SOURCES.md — external & original assets

## Summary
The Explore page uses **no third-party stock imagery, video, icons, or libraries**.
All decorative visuals are either reused from the existing in-repo brand assets or
were **created originally for this work** (procedural CSS / canvas + hand-authored SVG).
Nothing was scraped, and no external asset URLs are embedded.

## Original assets created for this work (in `assets/explore/`)
| Asset | Type | Origin | License |
|-------|------|--------|---------|
| `contour.svg` | topographic contour-line motif | Hand-authored for this project | Same as repo (MIT) |
| `horizon-ridge.svg` | layered mountain ridge silhouette | Hand-authored for this project | Same as repo (MIT) |
| `grain.svg` | film-grain texture (`feTurbulence`) | Hand-authored for this project | Same as repo (MIT) |
| `explore-data.js` | placeholder content config | Authored for this project | Same as repo (MIT) |

The hero "atmosphere" particle field is drawn at runtime on `<canvas>` in `explore.js`;
it has no external asset.

## Reused existing project assets
Reused as-is (already in the repo, no new licensing implications):
- `assets/logo_tight.png`, `assets/logo.png`, `assets/icon-192.png`
- `assets/bg-footer.png`

## Third-party code / fonts
- **Fonts** are loaded from Google Fonts (Outfit, Plus Jakarta Sans, JetBrains Mono) via the
  existing `<link>` tags already used by the homepage. Google Fonts are served under the
  SIL Open Font License. This was pre-existing in `index.html`; the Explore page reuses it.
- **No JS/CSS libraries** were added. All behaviour is vanilla.

## If real media is added later
- Prefer local, self-hosted, compressed assets (WebP/AVIF for images, WebM/MP4 for video).
- Record every added third-party asset here with: source URL, author, license, and
  attribution requirements.
- Do not hotlink external images or embed URLs with unclear rights.
