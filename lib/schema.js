'use strict';

/**
 * Site content schema v2.
 *
 * v2 is additive: every v1 key (meta, products[], services[], homepage{}) is
 * preserved untouched, and the new sections (site, pages) are layered on top.
 * migrate() deep-merges the defaults into existing content so an old
 * site-content.json gains the new keys without losing a single edited value.
 */

const SCHEMA_VERSION = 2;

// Fields that hold authored HTML. They are sanitized on save and rendered
// with the |safe filter.
const RICH_TEXT_PATHS = [
  'pages.explore.closing.title',
  'pages.audit.hero.title',
  'pages.audit.contact.heading',
  'pages.home.hero.title',
  'services'
];

function defaultContent() {
  return {
    schemaVersion: SCHEMA_VERSION,

    meta: {
      kicker: 'FIELD CATALOGUE — 2026',
      titleLineOne: 'SOLUTIONS',
      titleLineTwo: 'TAILORED FOR PROBLEM SOLVING',
      lead: 'Do not pay for the whole software, pay for your problem.',
      productsCount: 5,
      servicesCount: 5,
      note: 'Verified catalogue'
    },

    // Shared across every page: navigation, footer and contact details.
    site: {
      brand: 'AI Labs by Nimbus',

      // Header chrome repeated on every page (logo, nav, CTA, mobile menu).
      header: {
        logoImage: './assets/logo_tight.png',
        logoAlt: 'AI Labs by Nimbus',
        logoText: 'NIMBUS',
        logoSub: '/ AI LABS',
        logoHref: './',
        logoAriaLabel: 'AI Labs by Nimbus — Home',
        navAriaLabel: 'Main Navigation',
        mobileNavAriaLabel: 'Mobile Navigation',
        contactBtnText: 'Book Audit',
        menuBtnLabel: 'Open mobile menu',
        preloaderLogo: './assets/logo_tight.png',
        preloaderLogoAlt: 'AI Labs by Nimbus',
        // `active` maps a page key to the state of the item on that page, so
        // one shared list can highlight its own entry per page.
        nav: [
          { id: 'products', label: 'Products', href: './explore', active: { home: false, explore: true, audit: false } },
          { id: 'services', label: 'Audits and services', href: './services', active: { home: false, explore: false, audit: true } }
        ]
      },

      // Static asset links shared by every page.
      assets: {
        manifest: './manifest.webmanifest',
        favicon: './assets/logo_tight.png',
        appleTouchIcon: './assets/icon-192.png',
        appleAppTitle: 'Nimbus Labs',
        ogImage: './assets/logo.png'
      },
      footerGroups: [
        {
          title: 'SOLUTIONS',
          links: [
            { label: 'Home', href: './' },
            { label: 'Browse Products', href: '#products' },
            { label: 'Audits & Services', href: './services' },
            { label: 'OEM Direct Procurement', href: '#closing' }
          ]
        },
        {
          title: 'ADVISORY',
          links: [
            { label: 'Chapters Architecture', href: './#dapper' },
            { label: 'Book Diagnostic Audit', href: './services#contact' },
            { label: 'Engineering Methodology', href: './services#methodology' },
            { label: 'Direct Line', href: 'mailto:contact@ailabsnimbus.com' }
          ]
        },
        {
          title: 'SOURCE & API',
          links: [
            { label: 'GitHub Repository', href: 'https://github.com/touhid95/Nimbus_labs', external: true },
            { label: 'Products API', href: './api/v1/products', external: true },
            { label: 'Telemetry Feed', href: './api/v1/content', external: true }
          ]
        }
      ],
      footer: {
        brandTitle: 'AI LABS BY NIMBUS',
        brandDesc: 'Sovereign AI engineering hub & autonomous systems research. We build decentralized multi-agent architectures and negotiate direct enterprise OEM compute access.',
        brandLogo: './assets/logo_tight.png',
        copyrightYear: 2026,
        copyrightText: 'AI Labs by Nimbus. All rights reserved.',
        copyrightSuffix: '· Sovereign AI Engineering Hub & Autonomous Systems.',
        talkHeading: 'Let’s build what you actually need.',
        ctaText: 'Book Diagnostic Audit',
        email: 'contact@ailabsnimbus.com',
        emailHref: 'mailto:contact@ailabsnimbus.com',
        note: 'Direct access to Principal Systems Engineers · Under 24h response time',
        locationBadge: 'AI Labs by Nimbus',
        locationCity: 'Dhaka, Bangladesh',
        locationAddressLine1: 'Gulshan 2, Dhaka 1212',
        locationAddressLine2: 'Bangladesh · Sovereign AI Engineering Hub & Autonomous Systems',
        navAriaLabel: 'Footer Nav',
        legal: [
          { label: 'Privacy', href: '#' },
          { label: 'Terms', href: '#' },
          { label: 'Security Proofs', href: '#' }
        ]
      }
    },

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
        visual: {
          palette: ['#6459e8', '#5eead4', '#f43f5e'],
          pattern: 'orbit',
          glyph: 'HORIZON'
        }
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
        visual: {
          palette: ['#5eead4', '#6459e8', '#2f122e'],
          pattern: 'contour',
          glyph: 'REASONING'
        }
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
        visual: {
          palette: ['#e25c80', '#a855f7', '#020016'],
          pattern: 'aurora',
          glyph: 'SWARMS'
        }
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
        visual: {
          palette: ['#7c72ff', '#5eead4', '#05021a'],
          pattern: 'grid',
          glyph: 'MATRIX'
        }
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
        visual: {
          palette: ['#f8b4c4', '#e25c80', '#6459e8'],
          pattern: 'pulse',
          glyph: 'EDGE-AI'
        }
      }
    ],

    // Services carry both the catalogue fields used by /explore and the
    // richer card fields used by the services & audit page.
    services: [
      {
        id: 'service-01',
        label: 'Service 01',
        kicker: '01 / OPERATIONAL DIAGNOSTICS',
        title: 'AI Business & Algorithmic Audit',
        summary: '14-day computational audit isolating precision bottlenecks and drafting an autonomous deployment blueprint.',
        detail: 'Enterprise ROI and computational architecture are inseparable. We deconstruct workflow telemetry, isolate your single costliest operational bottleneck, and benchmark dedicated compute vs. token ROI before writing production code.',
        text: 'Enterprise ROI and computational architecture are inseparable. Instead of locking into multi-million-dollar annual software subscriptions for generic feature bloat, our systems researchers embed across your operations to conduct an exhaustive 14-day computational audit. We deconstruct workflow telemetry, isolate the single costliest bottleneck, and engineer a dedicated autonomous blueprint targeted exclusively at eliminating it.',
        features: [
          'Workflow latency profiling',
          'Bottleneck decomposition & dependency trees',
          'Token economics vs. dedicated compute ROI'
        ],
        capabilities: [
          'Workflow Latency Profiling',
          'Bottleneck Decomposition & Trees',
          'Token Economics vs. Dedicated Compute',
          'Sovereign Air-Gap Feasibility',
          'Algorithmic Proof-of-Concept',
          'Executive Blueprint & Fixed Roadmap'
        ],
        image: './assets/explore/supercomputer.jpg',
        figure: 'orbs',
        accent: '#6459e8'
      },
      {
        id: 'service-02',
        label: 'Service 02',
        kicker: '02 / DISTRIBUTED REASONING',
        title: 'Autonomous Multi-Agent Swarms',
        summary: 'Decentralized self-governing agent meshes executing concurrent operations with sub-second finality.',
        detail: 'Specialized multi-agent swarms operating on continuous causal verification loops and symbolic proofs to eliminate probabilistic hallucination and drift.',
        text: 'We engineer self-governing multi-agent meshes that independently negotiate, decompose complex multi-stage objectives, and execute concurrent operations with sub-second finality. Bypassing the probabilistic drift and hallucinations of generic LLMs, our agent swarms operate on continuous causal verification loops backed by formal symbolic proofs.',
        features: [
          'Decentralized peer-to-peer consensus',
          'Dynamic autonomous task decomposition',
          'Microsecond inter-agent event bus'
        ],
        capabilities: [
          'Decentralized Peer Consensus',
          'Autonomous Task Decomposition',
          'Microsecond Inter-Agent Event Bus',
          'Temporal Memory Graphs & Vectors',
          'Deterministic Guardrails & Proofs',
          'Self-Healing Orchestration'
        ],
        image: './assets/explore/neural.jpg',
        figure: 'flatCircles',
        accent: '#5eead4'
      },
      {
        id: 'service-03',
        label: 'Service 03',
        kicker: '03 / PRIVATE INFRASTRUCTURE',
        title: 'Sovereign AI Platforms',
        summary: 'Turnkey air-gapped cognitive intelligence layers operating strictly inside private hardware perimeters.',
        detail: 'Mission-critical inference clusters deployed on bare-metal hardware with zero external API leakage, bespoke weight fine-tuning, and audit-grade compliance.',
        text: 'Mission-critical institutions cannot risk proprietary trade secrets, customer records, or classified telemetry on public multi-tenant cloud APIs. We deploy turnkey, air-gapped cognitive intelligence layers operating strictly inside your private hardware perimeters — delivering frontier model capabilities with zero external data egress and audit-grade compliance.',
        features: [
          'Air-gapped bare-metal cluster topology',
          'Zero-egress network architecture',
          'Bespoke domain weight adaptation'
        ],
        capabilities: [
          'Air-Gapped Bare-Metal Clusters',
          'Zero-Egress Network Architecture',
          'Bespoke Domain Weight Adaptation',
          'On-Premise GPU Acceleration',
          'SOC2, HIPAA & Defense Compliance',
          'Native Legacy Database Bridges'
        ],
        image: './assets/explore/technology.jpg',
        figure: 'squares',
        accent: '#e25c80'
      },
      {
        id: 'service-04',
        label: 'Service 04',
        kicker: '04 / SPATIAL INTELLIGENCE',
        title: 'Synthetic Perception & Vision',
        summary: 'High-dimensional spatial latent models and real-time edge visual inspection pipelines.',
        detail: 'Bridging computational neuroscience with spatial intelligence to automate physical robotics, defense telemetry, and high-frequency visual inspection.',
        text: 'Bridging computational neuroscience with spatial latent representations. We build real-time visual inspection pipelines, physical robotics sensor fusion, and generative synthetic dataset generators engineered for mission-critical automation across industrial robotics, sovereign defense systems, and high-frequency digital workflows.',
        features: [
          'Spatial latent world modeling',
          'Sub-5ms edge visual inference',
          'Generative synthetic training datasets'
        ],
        capabilities: [
          'Spatial Latent Modeling',
          'Sub-5ms Visual Inference',
          'Generative Synthetic Training Data',
          'Heterogeneous Multimodal Fusion',
          'Real-Time Edge Anomaly Swarms',
          'Hardened Robotics Edge Runtimes'
        ],
        image: './assets/explore/abstract.jpg',
        figure: 'doubleCone',
        accent: '#a855f7'
      },
      {
        id: 'service-05',
        label: 'Service 05',
        kicker: '05 / BARE-METAL COMPUTE',
        title: 'Accelerated Systems Engineering',
        summary: 'Custom CUDA & Triton kernel compilation for 4-bit and 2-bit quantized neural runtimes.',
        detail: 'Compiling neural intelligence directly onto silicon. Eliminates runtime frameworks, slashes inference power consumption by 80%, and yields sub-millisecond throughput.',
        text: 'Deploying neural runtimes directly on bare silicon. We fuse custom CUDA and Triton kernels with stripped-down 4-bit and 2-bit quantized neural weights — eliminating bloated runtime frameworks, reducing inference compute costs by up to 80%, and providing guaranteed deterministic throughput under peak institutional workloads.',
        features: [
          '4-bit & 2-bit quantized weight compilation',
          'Custom CUDA, Triton & Metal kernel fusion',
          'Bare-metal GPU VRAM optimization'
        ],
        capabilities: [
          '4-Bit & 2-Bit Quantized Weights',
          'Custom CUDA & Triton Kernel Fusion',
          'Bare-Metal GPU VRAM Optimization',
          'Sub-Millisecond Execution Latency',
          'Zero-Dependency Static Binaries',
          'Audit-Grade Failover Checkpoints'
        ],
        image: './assets/explore/server.jpg',
        figure: 'corners',
        accent: '#f43f5e'
      }
    ],

    // v1 block, kept for backwards compatibility with the existing CMS tab.
    homepage: {
      hero: {
        title: 'AI LABS',
        titleHighlight: 'BY NIMBUS',
        tagline: 'We study how you work, then build only what you need.',
        primaryBtnText: 'Explore Product',
        primaryBtnLink: './explore',
        secondaryBtnText: 'Book Audit',
        secondaryBtnLink: '#contact'
      },
      dapper: {
        chapters: [
          { index: 1, name: 'FRONTIER', caption: 'DECENTRALIZED MULTI-AGENT SWARMS & MULTIMODAL REASONING ENGINES' },
          { index: 2, name: 'NEURAL', caption: 'SUB-MILLISECOND INFERENCE ON HIGH-PERFORMANCE DISTRIBUTED GPU CLUSTERS' },
          { index: 3, name: 'AGENTIC', caption: 'AUTONOMOUS TASK DECOMPOSITION, TOOL SYNTHESIS & DYNAMIC MEMORY GRAPHS' },
          { index: 4, name: 'COGNITION', caption: 'HIGH-DIMENSIONAL SPATIAL LATENTS, REASONING TRACES & SYNTHETIC PERCEPTION' },
          { index: 5, name: 'NIMBUS', caption: 'HYPER-SCALABLE FOUNDATIONAL INFRASTRUCTURE FOR ARTIFICIAL SUPERINTELLIGENCE' }
        ]
      },
      footer: {
        brandTitle: 'AI LABS BY NIMBUS',
        brandDesc: 'Sovereign AI engineering hub & autonomous systems research. We build decentralized multi-agent architectures and negotiate direct enterprise OEM compute access.',
        copyrightText: '© 2026 AI Labs by Nimbus. All rights reserved.',
        statusText: ''
      }
    },

    pages: {
      home: {
        meta: {
          title: 'AI Labs by Nimbus | Frontier Artificial Intelligence & Autonomous Systems',
          description: 'AI Labs by Nimbus researches next-generation generative models, collaborative multi-agent architectures, and hyper-scalable deep learning systems.',
          ogTitle: 'AI Labs by Nimbus | Frontier Intelligence',
          ogDescription: 'Pioneering the next frontier of artificial intelligence, autonomous agentic systems, and neural architectures.',
          ogType: 'website',
          themeColor: '#020016'
        },
        // Header CTA target differs per page (cross-page link vs. local anchor).
        headerCtaHref: './services#contact',
        hero: {
          title: 'AI LABS',
          titleHighlight: 'BY NIMBUS',
          tagline: 'We study how you work, then build only what you need.',
          primaryBtnText: 'Explore Product',
          primaryBtnLink: './explore',
          primaryBtnAriaLabel: 'Explore Nimbus Labs products and services',
          secondaryBtnText: 'Book Audit',
          secondaryBtnLink: './audit',
          preloaderStatus: 'INITIALIZING NIMBUS NEURAL CLUSTER...',
          // The 18-layer parallax scenery stack, back to front.
          layers: [
            { id: 'layer-01', className: 'hero-01', src: './assets/hero-01.png', alt: 'Sky background' },
            { id: 'layer-02', className: 'hero-02', src: './assets/hero-02.png', alt: 'Mountain ridges 2' },
            { id: 'layer-03', className: 'hero-03', src: './assets/hero-03.png', alt: 'Mountain ridges 3' },
            { id: 'layer-04', className: 'hero-04', src: './assets/hero-04.png', alt: 'Mountain ridges 4' },
            { id: 'layer-05', className: 'hero-05', src: './assets/hero-05.png', alt: 'Foothills 5' },
            { id: 'layer-06', className: 'hero-06', src: './assets/hero-06.png', alt: 'Pine ridges 6' },
            { id: 'layer-cloud1', className: 'hero-cloud1', src: './assets/hero-cloud1.png', alt: 'Cloud atmosphere 1' },
            { id: 'layer-cloud2', className: 'hero-cloud2', src: './assets/hero-cloud2.png', alt: 'Cloud atmosphere 2' },
            { id: 'layer-cloud3', className: 'hero-cloud3', src: './assets/hero-cloud3.png', alt: 'Cloud atmosphere 3' },
            { id: 'layer-cloud4', className: 'hero-cloud4', src: './assets/hero-cloud4.png', alt: 'Cloud atmosphere 4' },
            { id: 'layer-cloud5', className: 'hero-cloud5', src: './assets/hero-cloud5.png', alt: 'Cloud atmosphere 5' },
            { id: 'layer-cloud6', className: 'hero-cloud6', src: './assets/hero-cloud6.png', alt: 'Cloud atmosphere 6' },
            { id: 'layer-cloud7', className: 'hero-cloud7', src: './assets/hero-cloud7.png', alt: 'Cloud atmosphere 7' },
            { id: 'layer-cloud8', className: 'hero-cloud8', src: './assets/hero-cloud8.png', alt: 'Cloud atmosphere 8' },
            { id: 'layer-07', className: 'hero-07', src: './assets/hero-07.png', alt: 'Ridge forest 7' },
            { id: 'layer-08', className: 'hero-08', src: './assets/hero-08.png', alt: 'Foreground hills 8' },
            { id: 'layer-09', className: 'hero-09', src: './assets/hero-09.png', alt: 'Valley slopes 9' },
            { id: 'layer-10', className: 'hero-10', src: './assets/hero-10.png', alt: 'Near pine trees 10' }
          ]
        },
        dapper: {
          subheader: 'AI LABS BY NIMBUS',
          chapterCount: 5,
          chapterPrefix: 'CHAPTER',
          chapterStart: '01',
          chapterSeparator: '/',
          captionPrefix: '//',
          tagTop: 'FRONTIER COGNITION',
          tagBottom: 'RESEARCH DOMAINS',
          tagPrefix: 'CHAPTER 0',
          tagSeparator: '//',
          video: {
            src: 'assets/research-cognition.webm',
            type: 'video/webm'
          },
          controls: {
            pauseLabel: 'Pause',
            resumeLabel: 'Resume',
            soundLabel: 'Sound',
            mutedLabel: 'Muted',
            pauseAriaLabel: 'Pause or Resume Video',
            pauseTitle: 'Pause / Resume',
            soundAriaLabel: 'Toggle Sound',
            soundTitle: 'Mute / Unmute',
            groupAriaLabel: 'Video Controls'
          }
        },
        footerNav: [
          { label: 'Products', href: './explore', linkClass: 'f-link' },
          { label: 'Audits & Services', href: './services', linkClass: 'f-link' },
          { label: 'Chapters', href: '#dapper', linkClass: 'f-link' },
          { label: 'Book Audit', href: './services#contact', linkClass: 'f-link' }
        ],
        footerCtaLink: './services#contact'
      },
      explore: {
        meta: {
          title: 'Solutions Catalogue // AI Labs by Nimbus',
          description: 'Explore the Nimbus Labs solutions catalogue: autonomous systems, reasoning cores, agent swarms and edge inference.',
          ogTitle: 'Explore Products & Services | AI Labs by Nimbus',
          ogDescription: 'A field catalogue of upcoming Nimbus Labs products and services.',
          ogType: 'website',
          themeColor: '#020016'
        },
        headerCtaHref: './services#contact',
        hero: {
          eyebrow: 'Fast, Precise, Reliable, to the Point',
          titleLineOne: 'SOLUTIONS',
          titleLineTwo: 'Tailored for Problem Solving',
          lead: 'Do not pay for the whole software, pay for your problem.',
          primaryBtnText: 'Browse Solutions',
          primaryBtnLink: '#products',
          secondaryBtnText: 'Book Audit',
          secondaryBtnLink: './audit',
          preloaderStatus: 'OPENING NIMBUS FIELD CATALOGUE...',
          decor: {
            contour: './assets/explore/contour.svg',
            ridge: './assets/explore/horizon-ridge.svg'
          },
          rail: ['SOLUTIONS', 'PRODUCTS', 'CONTACT'],
          metaLabels: ['Tailored Solutions', 'Flagship Deployments', 'Active Programme'],
          scrollHint: 'Scroll to explore'
        },
        // Ecosystem marquee. `icon` points at a sprite symbol that ships with
        // the template (ai-icon-<id>), never at authored markup.
        aiStripAriaLabel: 'Supported AI Ecosystem',
        a11y: {
          bridgeAriaLabel: 'Feature marquee',
          railAriaLabel: 'Product Showcase Links',
          productsAriaLabel: 'Solutions Matrix',
          layersAriaLabel: 'Product showcase slides'
        },
        aiStrip: [
          { icon: 'chatgpt', name: 'ChatGPT', badge: 'OEM DIRECT', category: 'Reasoning & Neural Chat' },
          { icon: 'claude', name: 'Claude', badge: 'ENTERPRISE OEM', category: 'Cognitive Architecture' },
          { icon: 'gemini', name: 'Gemini', badge: 'OEM DIRECT', category: 'Multimodal Foundation' },
          { icon: 'perplexity', name: 'Perplexity', badge: 'OEM DIRECT', category: 'Real-Time Synthesis' },
          { icon: 'grok', name: 'Grok', badge: 'ENTERPRISE OEM', category: 'Real-Time Compute' },
          { icon: 'cursor', name: 'Cursor', badge: 'OEM DIRECT', category: 'AI Development Studio' },
          { icon: 'copilot', name: 'Copilot', badge: 'ENTERPRISE OEM', category: 'Pair Programming' },
          { icon: 'devin-ai', name: 'Devin AI', badge: 'OEM DIRECT', category: 'Autonomous Engineer' },
          { icon: 'midjourney', name: 'Midjourney', badge: 'OEM DIRECT', category: 'Visual Synthesis' },
          { icon: 'adobe-firefly', name: 'Adobe Firefly', badge: 'ENTERPRISE OEM', category: 'Commercial Media Models' },
          { icon: 'grammarly', name: 'Grammarly', badge: 'OEM DIRECT', category: 'Communication Engine' },
          { icon: 'notebooklm', name: 'NotebookLM', badge: 'OEM DIRECT', category: 'Grounded Research Core' }
        ],
        noscript: {
          title: 'JavaScript is required for the interactive catalogue.',
          body: 'This Explore catalogue renders its product and service entries with JavaScript. Enable JavaScript to view the placeholder catalogue.'
        },
        // Strings assembled at runtime by explore.js.
        ui: {
          chapterPrefix: '// CHAPTER 0',
          chapterSeparator: ' / ',
          chapterDash: '—',
          deployLabel: 'Deploy',
          exploreLabel: 'Explore',
          productFallback: 'Product',
          productCodePrefix: 'PRD-',
          defaultBrandTag: 'SOLUTIONS',
          categoryFallback: 'SYSTEMS'
        },
        closing: {
          eyebrow: '// OEM ENTERPRISE PROCUREMENT · ZERO RETAIL SEAT TAX',
          titleLineOne: 'BUY AT OEM.',
          titleLineTwo: 'Consult us before procuring enterprise AI.',
          sub: 'Most organizations overpay by 30% to 65% across bloated SaaS suites and mismatched cloud tiers. We audit your workflows, benchmark model utility against your actual operational bottlenecks, and negotiate direct sovereign OEM agreements tailored to your exact compute scale.',
          primaryBtnText: 'Consult Before Buying',
          primaryBtnLink: 'mailto:contact@ailabsnimbus.com?subject=Enterprise%20AI%20OEM%20Procurement%20Advisory',
          secondaryBtnText: 'Book Diagnostic Audit',
          secondaryBtnLink: './services#contact',
          tertiaryBtnText: 'Back to Home',
          tertiaryBtnLink: './'
        },
        legal: [
          { label: 'Security Proofs', href: 'mailto:contact@ailabsnimbus.com' },
          { label: 'Advisory Terms', href: 'mailto:contact@ailabsnimbus.com' }
        ]
      },
      audit: {
        meta: {
          title: 'Services & Business Audit // AI Labs by Nimbus',
          description: 'AI Labs by Nimbus delivers full-spectrum AI product strategy, operational business audits, autonomous multi-agent systems, sovereign intelligence, and accelerated systems engineering.',
          ogTitle: 'Services & Business Audit // AI Labs by Nimbus',
          ogDescription: 'A full-spectrum enterprise AI innovation and autonomous systems engineering partner. We study how you work, then build only what you need.',
          ogType: 'website',
          themeColor: '#ffffff'
        },
        headerCtaHref: '#contact',
        servicesHeading: 'Services and Audit Spectrum',
        hero: {
          titleLines: ['Autonomous AI', 'engineering partner'],
          lead: 'Skip bloated SaaS and per-seat taxes. We audit your workflows, isolate your costliest bottleneck, and engineer dedicated autonomous systems to eliminate it — with 100% sovereign code ownership.',
          proof: [
            '14-Day Diagnostic Audit',
            '100% Sovereign Air-Gap Feasibility',
            'Bare-Metal Silicon Compilation',
            'Zero Vendor Lock-In'
          ]
        },
        framework: {
          kicker: 'OUR ENGAGEMENT FRAMEWORK',
          title: 'From diagnosis to sovereign deployment.',
          lead: 'We reject 12-month software consulting retainers. We operate on a fixed-scope, high-velocity 3-stage delivery lifecycle designed to produce working systems, not slides.',
          stages: [
            {
              index: 1,
              step: 'STAGE 01',
              title: 'The 14-Day Audit',
              text: 'We embed with your engineering leadership, deconstruct workflow telemetry, benchmark latency sinkholes, and calculate dedicated compute vs. token ROI before writing production code.'
            },
            {
              index: 2,
              step: 'STAGE 02',
              title: 'The 30-Day Sandbox',
              text: 'We deploy an air-gapped prototype targeted directly at the isolated bottleneck in your private staging environment. Real operational stress tests with zero synthetic fluff.'
            },
            {
              index: 3,
              step: 'STAGE 03',
              title: 'Sovereign Production Handoff',
              text: 'Turnkey bare-metal deployment inside your private perimeter. 100% source code, model weights, and architectural documentation handoff with zero recurring vendor lock-in.'
            }
          ]
        },
        industries: {
          kicker: '// IMPACT DOMAINS · FIELD TELEMETRY',
          title: 'Mission-Critical Sectors',
          ariaLabel: 'Mission-Critical Sectors',
          lead: 'We partner with forward-thinking enterprises, sovereign institutions, and quantitative funds facing complex computational bottlenecks.',
          sectorStart: '01',
          sectorCount: 6,
          sectors: [
            {
              index: 1,
              chapter: '// SECTOR 01 / 06 — CAPITAL MARKETS',
              name: 'Fintech & Quantitative Finance',
              bg: '#2f122e',
              color: '#ffffff',
              members: [
                'High-Frequency Execution Kernels',
                'Autonomous Risk Modeling',
                'Deterministic Compliance Proofs',
                'Real-Time Fraud Swarms',
                'Algorithmic Portfolio Synthesis',
                'Sub-Millisecond Settlement Telemetry'
              ]
            },
            {
              index: 2,
              chapter: '// SECTOR 02 / 06 — ENTERPRISE SYSTEMS',
              name: 'B2B & Enterprise Infrastructure',
              bg: '#e25c80',
              color: '#ffffff',
              members: [
                'Autonomous Workflow Mesh',
                'Proprietary Knowledge Bridges',
                'Air-Gapped Operational Copilots',
                'Automated ERP Synthesis',
                'Deterministic Document Verification',
                'Zero-Cloud API Migrations'
              ]
            },
            {
              index: 3,
              chapter: '// SECTOR 03 / 06 — DEFENSE & SECURITY',
              name: 'Sovereign & Critical Infrastructure',
              bg: '#6459e8',
              color: '#ffffff',
              members: [
                'Air-Gapped SCADA Telemetry',
                'Offline-First Edge Controllers',
                'Hardware-Isolated Runtimes',
                'Formal Mathematical Proofs',
                'Zero-Leak Threat Elimination',
                'Grid Load Balancing'
              ]
            },
            {
              index: 4,
              chapter: '// SECTOR 04 / 06 — HARDWARE ACCELERATION',
              name: 'Technology & Compute Platforms',
              bg: '#0f3d3e',
              color: '#ffffff',
              members: [
                'Distributed GPU Orchestration',
                'Sub-5ms Inference Compilation',
                'Decentralized Consensus Buses',
                'Quantized Neural Kernels',
                'Zero-Dependency Static Architectures',
                'Bare-Metal Optimization'
              ]
            },
            {
              index: 5,
              chapter: '// SECTOR 05 / 06 — BIOMEDICAL COGNITION',
              name: 'Healthcare & Life Sciences',
              bg: '#3a102a',
              color: '#ffffff',
              members: [
                'Computational Neuroscience',
                'Air-Gapped Clinical Trial Telemetry',
                'Protein Latent Modeling',
                'HIPAA Sovereign Perimeters',
                'Diagnostic Review Acceleration',
                'Zero-Data-Retention Pipelines'
              ]
            },
            {
              index: 6,
              chapter: '// SECTOR 06 / 06 — ROBOTICS & MOBILITY',
              name: 'Autonomous Logistics & Mobility',
              bg: '#020016',
              color: '#ffffff',
              members: [
                'Swarm Routing Consensus',
                'Real-Time Fleet Balancing',
                'Decentralized Warehouse Depots',
                'Predictive Latency Resolution',
                'Sub-Second Dispatch Loops',
                'Fault-Tolerant Checkpoints'
              ]
            }
          ]
        },
        contact: {
          heading: 'Let’s build what you actually need.'
        },
        footerNav: [
          { label: 'Products', href: './explore', linkClass: 'f-link' },
          { label: 'Audits & Services', href: './services', linkClass: 'f-link is-active' },
          { label: 'Methodology', href: '#methodology', linkClass: 'f-link' },
          { label: 'Industries', href: '#services-industries', linkClass: 'f-link' },
          { label: 'Chapters', href: './#dapper', linkClass: 'f-link' },
          { label: 'Book Audit', href: '#contact', linkClass: 'f-link' }
        ],
        footerCtaLink: '#contact'
      },

      // Admin sign-in screen.
      login: {
        meta: {
          title: 'Admin Access — AI Labs by Nimbus'
        },
        kicker: '// Nimbus Control Plane',
        title: 'Admin Access',
        subtitle: 'Authenticate to open the CMS Matrix. Sessions expire after 8 hours and are bound to this browser.',
        passwordLabel: 'Passphrase',
        passwordPlaceholder: 'Enter admin passphrase',
        revealLabel: 'Show',
        hideLabel: 'Hide',
        revealAriaLabel: 'Show passphrase',
        hideAriaLabel: 'Hide passphrase',
        submitLabel: 'Enter Matrix',
        busyLabel: 'Authenticating…',
        backLinkText: 'Return to site',
        backLinkHref: '/',
        errorEmpty: 'Enter the admin passphrase to continue.',
        errorInvalid: 'Invalid passphrase. Access denied.',
        errorAuth: 'Authentication failed.',
        errorNetwork: 'Network error. Check that the server is running.',
        errorNotConfigured: 'Admin access is not configured on the server. Set ADMIN_PASSWORD in .env and restart.',
        statusSuccess: 'Authenticated. Opening the CMS Matrix…'
      }
    }
  };
}

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function clone(value) {
  if (Array.isArray(value)) return value.map(clone);
  if (isPlainObject(value)) {
    const out = {};
    Object.keys(value).forEach(function (key) {
      out[key] = clone(value[key]);
    });
    return out;
  }
  return value;
}

/**
 * Deep merge: existing values always win, defaults only fill the gaps.
 * Arrays are taken from the existing value as a whole.
 */
function mergeDefaults(defaults, value) {
  if (value === undefined || value === null) return clone(defaults);
  if (!isPlainObject(defaults) || !isPlainObject(value)) {
    return Array.isArray(defaults) ? clone(value) : value;
  }

  const out = clone(defaults);
  Object.keys(value).forEach(function (key) {
    if (isPlainObject(out[key]) && isPlainObject(value[key])) {
      out[key] = mergeDefaults(out[key], value[key]);
    } else if (value[key] !== undefined) {
      out[key] = clone(value[key]);
    }
  });
  return out;
}

/**
 * Upgrade any content document to the current schema without losing data.
 * @param {Object} content
 * @returns {Object} migrated content
 */
function migrate(content) {
  const defaults = defaultContent();
  const source = isPlainObject(content) ? content : {};
  const migrated = mergeDefaults(defaults, source);

  // Services are enriched per index so the audit cards keep their copy even
  // when the catalogue was edited before the v2 fields existed.
  const serviceDefaults = defaults.services || [];
  const sourceServices = Array.isArray(source.services) ? source.services : serviceDefaults;
  migrated.services = sourceServices.map(function (service, index) {
    const fallback = serviceDefaults[index];
    return fallback ? mergeDefaults(fallback, service) : service;
  });

  // Keep the legacy homepage.footer mirror in sync with the shared footer.
  migrated.homepage.footer = clone(migrated.site.footer);

  migrated.schemaVersion = SCHEMA_VERSION;
  return migrated;
}

module.exports = {
  SCHEMA_VERSION: SCHEMA_VERSION,
  RICH_TEXT_PATHS: RICH_TEXT_PATHS,
  defaultContent: defaultContent,
  migrate: migrate,
  mergeDefaults: mergeDefaults,
  clone: clone
};
