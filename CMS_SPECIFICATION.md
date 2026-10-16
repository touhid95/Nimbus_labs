# CMS Specification — AI Labs by Nimbus (Solutions Showcase)

This document provides the definitive data model, validation rules, delivery mechanisms, and frontend contract for any Content Management System (CMS) or admin panel managing the **Solutions Showcase** on `/explore`.

---

## 1. Architectural Role & Overview

The `/explore` page is a zero-dependency static PWA that showcases Nimbus Labs' flagship products through a **kinetic curtain presentation** (Dapper pinned 500vh stage) and a **kinetic marquee bridge** (`.xp-bridge`).

```mermaid
graph LR
    subgraph CMS_Backend [CMS / Admin Panel]
        ADMIN[Content Editor UI]
        STORE[(Database / Content Store)]
        ADMIN --> STORE
    end

    subgraph Delivery_Pipelines [Data Delivery]
        STORE -->|Mode A: Static Export| EXPORT_FILE["assets/explore/explore-data.js (or products.json)"]
        STORE -->|Mode B: Headless API| API_ENDPOINT["GET /api/v1/products"]
    end

    subgraph Frontend_App [AI Labs by Nimbus: /explore]
        EXP_JS[explore.js]
        EXP_JS -->|Loads Data| MARQUEE[Kinetic Marquee Bridge: Alternating Fill/Outline]
        EXP_JS -->|Renders Layers| STAGE[Pinned Dapper Curtain Stage: (N * 100)vh]
        EXP_JS -->|Syncs Nav Tag| BRAND_TAG[#brand-status-tag]
    end

    EXPORT_FILE -.-> EXP_JS
    API_ENDPOINT -.-> EXP_JS
```

---

## 2. Product Entity Data Model

Each product entry represents an autonomous system or AI infrastructure deployment.

### JSON Schema / TypeScript Interface

```typescript
export interface NimbusProduct {
  /**
   * Unique URL-friendly slug used for DOM IDs and anchor deep-linking.
   * e.g., "product-01", "nimbus-horizon"
   * Regex: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
   */
  id: string;

  /**
   * Display name of the product.
   * Rendered in slide headings, marquee bridge, and navbar brand status tag.
   * Max length: 45 characters.
   */
  label: string;

  /**
   * Optional category badge or deployment tag.
   * Rendered as an upper badge above the heading.
   * Max length: 30 characters.
   */
  badge?: string;

  /**
   * Technical discipline or system domain.
   * Rendered in the metadata HUD line: "// CHAPTER 0X / 05 — {category}"
   * Max length: 50 characters.
   */
  category: string;

  /**
   * Current lifecycle or deployment status.
   */
  status: 'Active Programme' | 'In Deployment' | 'In Design' | 'Exploration';

  /**
   * 1-line high-impact executive summary.
   * Max length: 120 characters.
   */
  summary: string;

  /**
   * Detailed problem-solving narrative.
   * Max length: 350 characters.
   */
  description: string;

  /**
   * 3 to 5 core technical features or differentiators.
   * Rendered as a bulleted checklist with dash prefixes.
   */
  features: string[];

  /**
   * CTA destination link (e.g., "#contact" or external deployment portal).
   */
  link: string;

  /**
   * Product showcase visual asset.
   * Path relative to workspace or full CDN URL.
   * Aspect Ratio: 16:9 recommended.
   */
  image: string;

  /**
   * Theme key corresponding to the slide aesthetic.
   */
  theme: 'plum' | 'rose' | 'violet' | 'cognition' | 'midnight' | string;

  /**
   * Slide canvas background hex color.
   * e.g., "#2f122e", "#e25c80", "#6459e8", "#fcf7f8", "#020016"
   */
  bg: string;

  /**
   * Contrast mode for typography and UI elements on this slide.
   * - "dark": White text and borders on dark background.
   * - "light": Obsidian text (#020016) on light background (e.g. Cognition White #fcf7f8).
   */
  contrast: 'dark' | 'light';

  /**
   * Procedural visual fallback configuration when image is loading or absent.
   */
  visual: {
    /** 3 CSS color strings for procedural fallback canvas [base, mid, accent] */
    palette: [string, string, string];
    /** Composition pattern */
    pattern: 'orbit' | 'contour' | 'grid' | 'aurora' | 'pulse';
    /** Short mono label (max 10 chars) rendered in HUD overlay */
    glyph: string;
  };
}
```

---

## 3. Field Constraints & Validation Rules

| Field | Type | Required | Constraints / Validation | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `String` | **Yes** | `^[a-z0-9]+(-[a-z0-9]+)*$`, unique | `"product-01"` |
| `label` | `String` | **Yes** | 3 – 45 chars, title case recommended | `"Nimbus Horizon"` |
| `badge` | `String` | No | Max 30 chars | `"Flagship Architecture"` |
| `category` | `String` | **Yes** | 3 – 50 chars | `"Autonomous Systems & Infrastructure"` |
| `status` | `Enum` | **Yes** | One of `['Active Programme', 'In Deployment', 'In Design', 'Exploration']` | `"Active Programme"` |
| `summary` | `String` | **Yes** | 20 – 120 chars | `"Frontier computational foundation and autonomous problem-solving."` |
| `description`| `String` | **Yes** | 50 – 350 chars | `"Nimbus Horizon delivers dedicated, mission-critical autonomous intelligence..."` |
| `features` | `Array<String>` | **Yes** | 2 – 5 items, each 10 – 80 chars | `["Autonomous task decomposition", "Deterministic verification"]` |
| `link` | `String` | **Yes** | Valid URL or `#anchor` | `"#contact"` |
| `image` | `URI` | **Yes** | Valid relative path or HTTPS URL, WebP/AVIF preferred | `"./assets/explore/supercomputer.jpg"` |
| `theme` | `String` | **Yes** | Slug identifying CSS theme | `"plum"` |
| `bg` | `Hex Color`| **Yes** | Valid 6-digit hex color (`^#([A-Fa-f0-9]{6})$`) | `"#2f122e"` |
| `contrast` | `Enum` | **Yes** | `'dark'` or `'light'` | `'dark'` |
| `visual.glyph`| `String`| **Yes** | 2 – 10 chars uppercase alphanumeric | `"HORIZON"` |

---

## 4. Delivery Pipelines

The CMS can feed data into the application via either of the following two mechanisms:

### Mode A: Static File Export (Current Zero-Dependency Setup)
When published, the CMS compiles the products array directly into:
`assets/explore/explore-data.js`

```javascript
(function (global) {
  'use strict';
  global.NIMBUS_EXPLORE_DATA = {
    meta: {
      kicker: 'FIELD CATALOGUE — 2026',
      titleLineOne: 'SOLUTIONS',
      titleLineTwo: 'TAILORED FOR PROBLEM SOLVING',
      lead: 'Do not pay for the whole software, pay for your problem.',
      productsCount: 5,
      note: 'Verified catalogue'
    },
    products: [
      /* Array of NimbusProduct entities */
    ]
  };
})(window);
```

### Mode B: Headless REST API Endpoint
If using a dynamic backend (e.g. Node.js, Express, Fastify, Strapi, Supabase):

- **Route**: `GET /api/v1/products`
- **Method**: `GET`
- **Headers**: `Content-Type: application/json`
- **Response Format**:

```json
{
  "status": "success",
  "data": {
    "count": 5,
    "products": [
      {
        "id": "product-01",
        "label": "Nimbus Horizon",
        "badge": "Flagship Architecture",
        "category": "Autonomous Systems & Infrastructure",
        "status": "Active Programme",
        "summary": "Frontier computational foundation and autonomous problem-solving architecture.",
        "description": "Nimbus Horizon delivers dedicated, mission-critical autonomous intelligence...",
        "features": [
          "Autonomous task decomposition & dependency resolution",
          "Real-time neural synthesis & deterministic verification",
          "Direct problem-targeted compute allocation",
          "Self-healing orchestration workflows"
        ],
        "link": "#contact",
        "image": "./assets/explore/supercomputer.jpg",
        "theme": "plum",
        "bg": "#2f122e",
        "contrast": "dark",
        "visual": {
          "palette": ["#6459e8", "#5eead4", "#f43f5e"],
          "pattern": "orbit",
          "glyph": "HORIZON"
        }
      }
    ]
  }
}
```

---

## 5. Frontend Dynamic Consumer Contract

The CMS backend does **not** need to generate HTML templates; `explore.js` dynamically binds product entities:

1. **Total Product Count & Canvas Height**:
   - The stage height dynamically scales:
     $$\text{height} = N \times 100\text{vh}$$
   - Recommended catalogue size: **3 to 8 products** for optimal scroll choreography.

2. **Kinetic Bridge Marquee Generation**:
   - `explore.js` reads `products[].label` and dynamically generates `<a class="xp-bridge__word xp-bridge__link" ...>`.
   - Alternates between solid white fill (`.is-fill`) and stroke outline (`-webkit-text-stroke`) with diamond separators (`◆`).
   - Clicking smoothly scrolls to `sectionTop + (index / (N - 1)) * totalScroll`.

3. **Dynamic Navbar Brand Status Tag**:
   - Displays `SOLUTIONS` at the top and bottom of the page.
   - When scrolling through the product showcase, automatically displays `products[activeIdx].label.toUpperCase()`.

4. **Sharp 0px Design System**:
   - All product cards, buttons, media frames, and tags use `border-radius: 0 !important`. The CMS must not emit rounded frames or pill containers.

---

## 6. Media Asset Guidelines

- **Dimensions**: Minimum $1920 \times 1080\text{px}$ (16:9 aspect ratio).
- **Format**: `.webp` (primary) or optimized `.jpg` with `.webp` fallback.
- **File Size**: Target $\le 500\text{KB}$ per image.
- **Composition**: Centered or rule-of-thirds subjects with dark or high-contrast atmosphere suitable for full-screen showcase.
