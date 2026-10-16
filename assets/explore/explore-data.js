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

    /* ---------------- PRODUCTS ---------------- */
    products: [
      {
        id: 'product-01',
        label: 'Nimbus Horizon',
        badge: 'Flagship Architecture',
        category: 'Autonomous Systems & Infrastructure',
        status: 'Active Programme',
        summary: 'Frontier computational foundation and autonomous problem-solving architecture.',
        description: 'Nimbus Horizon delivers dedicated, mission-critical autonomous intelligence. Rather than paying enterprise licenses for bloated generic software suites, Horizon isolates the core bottleneck and runs precision agents targeted exclusively at solving that problem.',
        features: [
          'Autonomous task decomposition & dependency resolution',
          'Real-time neural synthesis & deterministic verification',
          'Direct problem-targeted compute allocation',
          'Self-healing orchestration workflows'
        ],
        link: '#contact',
        image: './assets/explore/supercomputer.jpg',
        theme: 'plum',
        bg: '#2f122e',
        contrast: 'dark',
        visual: { palette: ['#6459e8', '#5eead4', '#f43f5e'], pattern: 'orbit', glyph: 'HORIZON' }
      },
      {
        id: 'product-02',
        label: 'Frontier Reasoning Core',
        badge: 'Cognitive Engine',
        category: 'Synthetic Intelligence & Reasoning Engines',
        status: 'Active Programme',
        summary: 'Deep logical synthesis engine engineered for complex operational decisions.',
        description: 'Bypasses standard pattern prediction in favor of continuous step-by-step cognitive deduction. Solves domain-specific analytical problems where off-the-shelf LLMs hallucinate or fail.',
        features: [
          'Formal symbolic verification & proof loops',
          'Multi-hop causal reasoning trees',
          'Zero-hallucination domain guardrails',
          'Deterministic structured execution'
        ],
        link: '#contact',
        image: './assets/explore/neural.jpg',
        theme: 'rose',
        bg: '#e25c80',
        contrast: 'dark',
        visual: { palette: ['#5eead4', '#6459e8', '#2f122e'], pattern: 'contour', glyph: 'REASONING' }
      },
      {
        id: 'product-03',
        label: 'Autonomous Swarm Fabric',
        badge: 'Distributed Systems',
        category: 'Decentralized Multi-Agent Systems',
        status: 'In Deployment',
        summary: 'Cooperative multi-agent mesh delivering coordinated task execution at scale.',
        description: 'Enables hundreds of specialized agents to negotiate, distribute tasks, and solve complex business operations concurrently with consensus-driven output.',
        features: [
          'Decentralized peer-to-peer agent consensus',
          'Dynamic load-balancing & role handoffs',
          'Fault-tolerant state checkpoints',
          'Sub-second inter-agent messaging'
        ],
        link: '#contact',
        image: './assets/explore/server.jpg',
        theme: 'violet',
        bg: '#6459e8',
        contrast: 'dark',
        visual: { palette: ['#e25c80', '#a855f7', '#020016'], pattern: 'aurora', glyph: 'SWARMS' }
      },
      {
        id: 'product-04',
        label: 'Synthetic Intelligence Matrix',
        badge: 'Enterprise Platform',
        category: 'Enterprise Cognitive Deployment',
        status: 'In Design',
        summary: 'On-premise secure cognitive layer directly mapped to your private operational data.',
        description: 'Integrates natively into your private infrastructure to analyze, model, and automate proprietary workflows without sending internal data to public multi-tenant clouds.',
        features: [
          'Zero-leak air-gapped deployment architecture',
          'Native integration with legacy data stores',
          'Custom specialized fine-tuned adapter weights',
          'Audit-grade compliance & telemetry'
        ],
        link: '#contact',
        image: './assets/explore/technology.jpg',
        theme: 'cognition',
        bg: '#fcf7f8',
        contrast: 'light',
        visual: { palette: ['#7c72ff', '#5eead4', '#05021a'], pattern: 'grid', glyph: 'MATRIX' }
      },
      {
        id: 'product-05',
        label: 'Quantum-Edge Protocol',
        badge: 'Low-Latency Compute',
        category: 'Edge & Accelerated Infrastructure',
        status: 'Exploration',
        summary: 'Ultra-low latency micro-models engineered for sub-millisecond edge execution.',
        description: 'Stripped-down, quantized neural runtimes designed for edge devices, embedded controllers, and instant sub-millisecond response loops.',
        features: [
          '4-bit & 2-bit quantized neural weights',
          'Direct hardware accelerator kernel compilation',
          'Sub-5ms inference turnaround',
          'Offline-first sovereign edge autonomy'
        ],
        link: '#contact',
        image: './assets/explore/abstract.jpg',
        theme: 'midnight',
        bg: '#020016',
        contrast: 'dark',
        visual: { palette: ['#f8b4c4', '#e25c80', '#6459e8'], pattern: 'pulse', glyph: 'EDGE-AI' }
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
