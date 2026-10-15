/**
 * NIMBUS LABS — EXPLORE PAGE CONTENT CONFIGURATION
 * ----------------------------------------------------------------------------
 * PLACEHOLDER CONTENT. Every entry below is temporary and intentionally
 * obvious ("Product 01", "Temporary product description."). Replace the values
 * here to update the page — no component edits required.
 *
 * Each `visual` entry is a procedural placeholder (no external image files):
 *   palette : [base, mid, accent] CSS color strings for the visual composition
 *   pattern : one of 'orbit' | 'contour' | 'grid' | 'aurora' | 'pulse'
 *   glyph   : short mono label rendered inside the visual
 *
 * To use a real image instead, set `visual.image` to a local asset path
 * (e.g. './assets/explore/product-01.jpg') — the renderer will use it and keep
 * `palette`/`pattern` as the loading fallback.
 */
(function (global) {
  'use strict';

  global.NIMBUS_EXPLORE_DATA = {
    meta: {
      kicker: 'FIELD CATALOGUE — 2026',
      titleLineOne: 'EXPLORE',
      titleLineTwo: 'PRODUCTS & SERVICES',
      lead: 'A temporary overview of what the Nimbus Labs frontier programme will ship. Replace this copy and the entries below with the real catalogue.',
      productsCount: 5,
      servicesCount: 4,
      note: 'Placeholder catalogue · content pending'
    },

    /* ---------------- PRODUCTS (temporary) ---------------- */
    products: [
      {
        id: 'product-01',
        label: 'Product 01',
        category: 'Placeholder Category A',
        status: 'In design',
        summary: 'Temporary product summary for the first catalogue entry.',
        description: 'Placeholder long-form product copy. Describe the real capability, the problem it removes and who it is for. Replace together with the accompanying visual.',
        features: ['Placeholder feature one', 'Placeholder feature two', 'Placeholder feature three'],
        link: '#',
        visual: { palette: ['#6459e8', '#a855f7', '#e25c80'], pattern: 'orbit', glyph: 'P—01' }
      },
      {
        id: 'product-02',
        label: 'Product 02',
        category: 'Placeholder Category B',
        status: 'Concepted',
        summary: 'Temporary product summary for the second catalogue entry.',
        description: 'Placeholder long-form product copy. Describe the real capability, the problem it removes and who it is for. Replace together with the accompanying visual.',
        features: ['Placeholder feature one', 'Placeholder feature two'],
        link: '#',
        visual: { palette: ['#5eead4', '#6459e8', '#2f122e'], pattern: 'contour', glyph: 'P—02' }
      },
      {
        id: 'product-03',
        label: 'Product 03',
        category: 'Placeholder Category C',
        status: 'Concepted',
        summary: 'Temporary product summary for the third catalogue entry.',
        description: 'Placeholder long-form product copy. Describe the real capability, the problem it removes and who it is for. Replace together with the accompanying visual.',
        features: ['Placeholder feature one', 'Placeholder feature two', 'Placeholder feature three', 'Placeholder feature four'],
        link: '#',
        visual: { palette: ['#e25c80', '#a855f7', '#020016'], pattern: 'aurora', glyph: 'P—03' }
      },
      {
        id: 'product-04',
        label: 'Product 04',
        category: 'Placeholder Category D',
        status: 'Exploration',
        summary: 'Temporary product summary for the fourth catalogue entry.',
        description: 'Placeholder long-form product copy. Describe the real capability, the problem it removes and who it is for. Replace together with the accompanying visual.',
        features: ['Placeholder feature one', 'Placeholder feature two'],
        link: '#',
        visual: { palette: ['#7c72ff', '#5eead4', '#05021a'], pattern: 'grid', glyph: 'P—04' }
      },
      {
        id: 'product-05',
        label: 'Product 05',
        category: 'Placeholder Category E',
        status: 'Exploration',
        summary: 'Temporary product summary for the fifth catalogue entry.',
        description: 'Placeholder long-form product copy. Describe the real capability, the problem it removes and who it is for. Replace together with the accompanying visual.',
        features: ['Placeholder feature one', 'Placeholder feature two', 'Placeholder feature three'],
        link: '#',
        visual: { palette: ['#f8b4c4', '#e25c80', '#6459e8'], pattern: 'pulse', glyph: 'P—05' }
      }
    ],

    /* ---------------- SERVICES (temporary) ---------------- */
    services: [
      {
        id: 'service-01',
        label: 'Service 01',
        title: 'Placeholder Service Name',
        summary: 'Temporary one-line description of the first service offering.',
        detail: 'Placeholder service detail. Explain the engagement model, typical scope, timeline and deliverables. Replace with the real service narrative.',
        features: ['Placeholder deliverable', 'Placeholder deliverable'],
        accent: '#6459e8'
      },
      {
        id: 'service-02',
        label: 'Service 02',
        title: 'Placeholder Service Name',
        summary: 'Temporary one-line description of the second service offering.',
        detail: 'Placeholder service detail. Explain the engagement model, typical scope, timeline and deliverables. Replace with the real service narrative.',
        features: ['Placeholder deliverable', 'Placeholder deliverable', 'Placeholder deliverable'],
        accent: '#5eead4'
      },
      {
        id: 'service-03',
        label: 'Service 03',
        title: 'Placeholder Service Name',
        summary: 'Temporary one-line description of the third service offering.',
        detail: 'Placeholder service detail. Explain the engagement model, typical scope, timeline and deliverables. Replace with the real service narrative.',
        features: ['Placeholder deliverable', 'Placeholder deliverable'],
        accent: '#e25c80'
      },
      {
        id: 'service-04',
        label: 'Service 04',
        title: 'Placeholder Service Name',
        summary: 'Temporary one-line description of the fourth service offering.',
        detail: 'Placeholder service detail. Explain the engagement model, typical scope, timeline and deliverables. Replace with the real service narrative.',
        features: ['Placeholder deliverable', 'Placeholder deliverable', 'Placeholder deliverable'],
        accent: '#a855f7'
      }
    ]
  };
})(window);
