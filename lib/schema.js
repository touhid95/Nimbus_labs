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
        favicon: './assets/favicon.png',
        appleTouchIcon: './assets/icon-192.png',
        appleAppTitle: 'Nimbus Labs',
        ogImage: './assets/logo.png'
      },
      footerGroups: [
        {
          "title": "EXPLORE",
          "links": [
            {
              "label": "Products",
              "href": "#products"
            },
            {
              "label": "Audits & Services",
              "href": "./services"
            },
            {
              "label": "Home",
              "href": "./"
            }
          ]
        },
        {
          "title": "COMPANY",
          "links": [
            {
              "label": "What We Do",
              "href": "./#dapper"
            },
            {
              "label": "Book Audit",
              "href": "./services#contact"
            },
            {
              "label": "Contact",
              "href": "mailto:contact@ailabsnimbus.com",
              "external": true
            }
          ]
        }
      ],
      footer: {
        "brandTitle": "AI Labs by Nimbus",
        "brandDesc": "Enterprise AI, custom AI software, cloud and self-hosted AI, and OSINT & SOCMINT solutions, built around how your team works.",
        "brandLogo": "./assets/logo_tight.png",
        "copyrightYear": 2026,
        "copyrightText": "© 2026 AI Labs by Nimbus. All rights reserved.",
        "copyrightSuffix": "· Enterprise AI, Software & Intelligence Solutions.",
        "talkHeading": "Let’s build what you actually need.",
        "ctaText": "Book Diagnostic Audit",
        "email": "contact@ailabsnimbus.com",
        "emailHref": "mailto:contact@ailabsnimbus.com",
        "note": "Talk directly to the engineers who will build your system.",
        "locationBadge": "Our Office",
        "locationCity": "Dhaka, Bangladesh",
        "locationAddressLine1": "Gulshan 2, Dhaka 1212",
        "locationAddressLine2": "Bangladesh",
        "navAriaLabel": "Footer Nav",
        "legal": [],
        "statusText": "All Global Nimbus Clusters Operational",
        "tel": "+1 (415) 890-AI-LABS · Sovereign Consultations",
        "telHref": "tel:+14158902452",
        "nav": [
          {
            "label": "Solutions",
            "href": "./explore"
          },
          {
            "label": "Services & Audit",
            "href": "./services"
          },
          {
            "label": "Methodology",
            "href": "#methodology"
          },
          {
            "label": "Industries",
            "href": "#services-industries"
          },
          {
            "label": "What We Do",
            "href": "./#dapper"
          }
        ],
        "locationAddress": "Gulshan 2, Dhaka 1212\nBangladesh"
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
        "id": "service-01",
        "label": "Service 01",
        "kicker": "01 / SECURITY AUDITS",
        "title": "Security Certification Audits",
        "summary": "Find the gaps, fix them, and go into your certification audit ready.",
        "detail": "We check your systems, policies and code against the standard you are targeting and help you close every gap before the official audit.",
        "text": "We check your systems, policies and code against the standard you are targeting, such as ISO 27001 or SOC 2. You get a clear list of what is missing, a plan to fix it, and the evidence auditors will ask for.",
        "features": [
          "Gap analysis against your target standard",
          "Prioritised fix plan",
          "Evidence ready for auditors"
        ],
        "capabilities": [
          "Gap Analysis",
          "Risk Assessment",
          "Policy & Control Review",
          "Audit-Ready Evidence"
        ],
        "image": "./assets/explore/server.jpg",
        "figure": "corners",
        "accent": "#f43f5e"
      },
      {
        "id": "service-02",
        "label": "Service 02",
        "kicker": "02 / CRITICAL AI",
        "title": "AI for Critical Operations",
        "summary": "Dependable AI for work where mistakes are costly.",
        "detail": "AI systems that run on your own infrastructure, keep your data private, and are tested to behave predictably.",
        "text": "For work where mistakes are costly, we build AI that runs on your own infrastructure, keeps your data private, and is tested to behave predictably under real workloads, with people in control of key decisions.",
        "features": [
          "Private, on-premise deployment",
          "AI agents and automation",
          "Human-in-the-loop controls"
        ],
        "capabilities": [
          "Private, On-Premise Deployment",
          "AI Agents & Automation",
          "Human-in-the-Loop Controls",
          "Monitoring & Testing"
        ],
        "image": "./assets/explore/neural.jpg",
        "figure": "flatCircles",
        "accent": "#5eead4"
      },
      {
        "id": "service-03",
        "label": "Service 03",
        "kicker": "03 / INDUSTRIAL ERP",
        "title": "Industrial ERP Solutions",
        "summary": "One system for production, inventory, procurement and finance.",
        "detail": "ERP built around how your operation actually runs, connected to the tools you already use.",
        "text": "One system for production, inventory, procurement and finance. We build your ERP around how your operation actually runs, connect it to the tools you already use, and add AI where it saves real time.",
        "features": [
          "Production and inventory",
          "Procurement and supply chain",
          "Finance and reporting"
        ],
        "capabilities": [
          "Production & Inventory",
          "Procurement & Supply Chain",
          "Finance & Reporting",
          "Integration With Existing Systems"
        ],
        "image": "./assets/explore/technology.jpg",
        "figure": "squares",
        "accent": "#e25c80"
      },
      {
        "id": "service-04",
        "label": "Service 04",
        "kicker": "04 / CONSUMER TECH",
        "title": "Next-Generation Consumer Tech",
        "summary": "Consumer apps and products with smart features built in.",
        "detail": "We design and build consumer products that are fast, intuitive and ready to scale.",
        "text": "From idea to launch, we design and build consumer apps and products with smart features built in. Fast, intuitive, and ready to grow with your users.",
        "features": [
          "Product strategy and UX",
          "Web and mobile apps",
          "AI-powered features"
        ],
        "capabilities": [
          "Product Strategy & UX",
          "Web & Mobile Apps",
          "AI-Powered Features",
          "Launch & Scale"
        ],
        "image": "./assets/explore/abstract.jpg",
        "figure": "orbs",
        "accent": "#a855f7"
      }
    ],

    // v1 block, kept for backwards compatibility with the existing CMS tab.
    homepage: {
      "hero": {
        "title": "AI LABS",
        "titleHighlight": "BY NIMBUS",
        "tagline": "We study how you work, then build only what you need.",
        "primaryBtnText": "Explore Product",
        "primaryBtnLink": "./explore",
        "secondaryBtnText": "Book Audit",
        "secondaryBtnLink": "#contact"
      },
      "dapper": {
        "chapters": [
          {
            "index": 1,
            "name": "ENTERPRISE AI SOLUTIONS",
            "caption": "AI BUILT INTO YOUR OPERATIONS: WORKFLOW AUTOMATION, COPILOTS & DECISION SUPPORT FOR YOUR TEAMS"
          },
          {
            "index": 2,
            "name": "AI SOFTWARE DEVELOPMENT",
            "caption": "CUSTOM AI-POWERED APPS, AGENTS & INTEGRATIONS, FROM PROTOTYPE TO PRODUCTION"
          },
          {
            "index": 3,
            "name": "AI CLOUD SOLUTIONS",
            "caption": "SCALABLE MODEL TRAINING, INFERENCE & MLOPS ON THE CLOUD OF YOUR CHOICE"
          },
          {
            "index": 4,
            "name": "SELF-HOSTED AI",
            "caption": "PRIVATE AI MODELS ON YOUR OWN SERVERS, SO YOUR DATA NEVER LEAVES YOUR INFRASTRUCTURE"
          },
          {
            "index": 5,
            "name": "OSINT & SOCMINT SOLUTIONS",
            "caption": "OPEN-SOURCE & SOCIAL MEDIA INTELLIGENCE: MONITORING, ANALYSIS & THREAT INSIGHT"
          }
        ]
      },
      "footer": {
        "brandTitle": "AI Labs by Nimbus",
        "brandDesc": "Enterprise AI, custom AI software, cloud and self-hosted AI, and OSINT & SOCMINT solutions, built around how your team works.",
        "brandLogo": "./assets/logo_tight.png",
        "copyrightYear": 2026,
        "copyrightText": "© 2026 AI Labs by Nimbus. All rights reserved.",
        "copyrightSuffix": "· Enterprise AI, Software & Intelligence Solutions.",
        "talkHeading": "Let’s build what you actually need.",
        "ctaText": "Book Diagnostic Audit",
        "email": "contact@ailabsnimbus.com",
        "emailHref": "mailto:contact@ailabsnimbus.com",
        "note": "Talk directly to the engineers who will build your system.",
        "locationBadge": "Our Office",
        "locationCity": "Dhaka, Bangladesh",
        "locationAddressLine1": "Gulshan 2, Dhaka 1212",
        "locationAddressLine2": "Bangladesh",
        "navAriaLabel": "Footer Nav",
        "legal": [],
        "statusText": "All Global Nimbus Clusters Operational",
        "tel": "+1 (415) 890-AI-LABS · Sovereign Consultations",
        "telHref": "tel:+14158902452",
        "nav": [
          {
            "label": "Solutions",
            "href": "./explore"
          },
          {
            "label": "Services & Audit",
            "href": "./services"
          },
          {
            "label": "Methodology",
            "href": "#methodology"
          },
          {
            "label": "Industries",
            "href": "#services-industries"
          },
          {
            "label": "What We Do",
            "href": "./#dapper"
          }
        ],
        "locationAddress": "Gulshan 2, Dhaka 1212\nBangladesh"
      }
    },

    pages: {
      "home": {
        "meta": {
          "title": "AI Labs by Nimbus | Enterprise AI, Software & Intelligence Solutions",
          "description": "AI Labs by Nimbus builds enterprise AI solutions, custom AI software, AI cloud and self-hosted AI, and OSINT & SOCMINT solutions, shaped around how your team works.",
          "ogTitle": "AI Labs by Nimbus | Enterprise AI & Intelligence Solutions",
          "ogDescription": "We study how you work, then build only what you need: enterprise AI, custom AI software, cloud and self-hosted AI, and OSINT & SOCMINT.",
          "ogType": "website",
          "themeColor": "#020016"
        },
        "headerCtaHref": "./services#contact",
        "hero": {
          "title": "AI LABS",
          "titleHighlight": "BY NIMBUS",
          "tagline": "We study how you work, then build only what you need.",
          "primaryBtnText": "Explore Product",
          "primaryBtnLink": "./explore",
          "primaryBtnAriaLabel": "Explore Nimbus Labs products and services",
          "secondaryBtnText": "Book Audit",
          "secondaryBtnLink": "./audit",
          "preloaderStatus": "LOADING AI LABS BY NIMBUS...",
          "layers": [
            {
              "id": "layer-01",
              "className": "hero-01",
              "src": "./assets/hero-01.png",
              "alt": "Sky background"
            },
            {
              "id": "layer-02",
              "className": "hero-02",
              "src": "./assets/hero-02.png",
              "alt": "Mountain ridges 2"
            },
            {
              "id": "layer-03",
              "className": "hero-03",
              "src": "./assets/hero-03.png",
              "alt": "Mountain ridges 3"
            },
            {
              "id": "layer-04",
              "className": "hero-04",
              "src": "./assets/hero-04.png",
              "alt": "Mountain ridges 4"
            },
            {
              "id": "layer-05",
              "className": "hero-05",
              "src": "./assets/hero-05.png",
              "alt": "Foothills 5"
            },
            {
              "id": "layer-06",
              "className": "hero-06",
              "src": "./assets/hero-06.png",
              "alt": "Pine ridges 6"
            },
            {
              "id": "layer-cloud1",
              "className": "hero-cloud1",
              "src": "./assets/hero-cloud1.png",
              "alt": "Cloud atmosphere 1"
            },
            {
              "id": "layer-cloud2",
              "className": "hero-cloud2",
              "src": "./assets/hero-cloud2.png",
              "alt": "Cloud atmosphere 2"
            },
            {
              "id": "layer-cloud3",
              "className": "hero-cloud3",
              "src": "./assets/hero-cloud3.png",
              "alt": "Cloud atmosphere 3"
            },
            {
              "id": "layer-cloud4",
              "className": "hero-cloud4",
              "src": "./assets/hero-cloud4.png",
              "alt": "Cloud atmosphere 4"
            },
            {
              "id": "layer-cloud5",
              "className": "hero-cloud5",
              "src": "./assets/hero-cloud5.png",
              "alt": "Cloud atmosphere 5"
            },
            {
              "id": "layer-cloud6",
              "className": "hero-cloud6",
              "src": "./assets/hero-cloud6.png",
              "alt": "Cloud atmosphere 6"
            },
            {
              "id": "layer-cloud7",
              "className": "hero-cloud7",
              "src": "./assets/hero-cloud7.png",
              "alt": "Cloud atmosphere 7"
            },
            {
              "id": "layer-cloud8",
              "className": "hero-cloud8",
              "src": "./assets/hero-cloud8.png",
              "alt": "Cloud atmosphere 8"
            },
            {
              "id": "layer-07",
              "className": "hero-07",
              "src": "./assets/hero-07.png",
              "alt": "Ridge forest 7"
            },
            {
              "id": "layer-08",
              "className": "hero-08",
              "src": "./assets/hero-08.png",
              "alt": "Foreground hills 8"
            },
            {
              "id": "layer-09",
              "className": "hero-09",
              "src": "./assets/hero-09.png",
              "alt": "Valley slopes 9"
            },
            {
              "id": "layer-10",
              "className": "hero-10",
              "src": "./assets/hero-10.png",
              "alt": "Near pine trees 10"
            }
          ]
        },
        "dapper": {
          "subheader": "AI LABS BY NIMBUS",
          "chapterCount": 5,
          "chapterPrefix": "CHAPTER",
          "chapterStart": "01",
          "chapterSeparator": "/",
          "captionPrefix": "//",
          "tagTop": "WHAT WE DO",
          "tagBottom": "OUR SERVICES",
          "tagPrefix": "CHAPTER 0",
          "tagSeparator": "//",
          "video": {
            "src": "assets/research-cognition.webm",
            "type": "video/webm"
          },
          "controls": {
            "pauseLabel": "Pause",
            "resumeLabel": "Resume",
            "soundLabel": "Sound",
            "mutedLabel": "Muted",
            "pauseAriaLabel": "Pause or Resume Video",
            "pauseTitle": "Pause / Resume",
            "soundAriaLabel": "Toggle Sound",
            "soundTitle": "Mute / Unmute",
            "groupAriaLabel": "Video Controls"
          }
        },
        "footerNav": [
          {
            "label": "Products",
            "href": "./explore",
            "linkClass": "f-link"
          },
          {
            "label": "Audits & Services",
            "href": "./services",
            "linkClass": "f-link"
          },
          {
            "label": "What We Do",
            "href": "#dapper",
            "linkClass": "f-link"
          },
          {
            "label": "Book Audit",
            "href": "./services#contact",
            "linkClass": "f-link"
          }
        ],
        "footerCtaLink": "./services#contact"
      },
      "explore": {
        "meta": {
          "title": "Products // AI Labs by Nimbus",
          "description": "Products built by AI Labs by Nimbus, from school platforms and exam coaching to restaurant software, sales automation and developer tools.",
          "ogTitle": "Products | AI Labs by Nimbus",
          "ogDescription": "Real products solving real problems. Browse the Nimbus product catalogue.",
          "ogType": "website",
          "themeColor": "#020016"
        },
        "headerCtaHref": "./services#contact",
        "hero": {
          "eyebrow": "Our products",
          "titleLineOne": "PRODUCTS",
          "titleLineTwo": "Built for Real Problems",
          "lead": "Each one built to solve a real problem. Try the live ones, or book a meeting to see the rest.",
          "primaryBtnText": "Browse Products",
          "primaryBtnLink": "#products",
          "secondaryBtnText": "Book Audit",
          "secondaryBtnLink": "./audit",
          "preloaderStatus": "LOADING NIMBUS PRODUCTS...",
          "decor": {
            "contour": "./assets/explore/contour.svg",
            "ridge": "./assets/explore/horizon-ridge.svg"
          },
          "rail": [
            "PRODUCTS",
            "LIVE",
            "CONTACT"
          ],
          "metaLabels": [
            "Our catalogue",
            "products",
            "Live & in development"
          ],
          "scrollHint": "Scroll to explore"
        },
        "aiStripAriaLabel": "Security OEM vendors",
        "a11y": {
          "bridgeAriaLabel": "Feature marquee",
          "railAriaLabel": "Product Showcase Links",
          "productsAriaLabel": "Products",
          "layersAriaLabel": "Product showcase slides"
        },
        "aiStrip": [
          {
            "icon": "fortinet",
            "name": "Fortinet",
            "badge": "OEM",
            "category": "Firewall & Network Security"
          },
          {
            "icon": "palo-alto",
            "name": "Palo Alto Networks",
            "badge": "OEM",
            "category": "Next-Gen Firewall & SASE"
          },
          {
            "icon": "cyble",
            "name": "Cyble",
            "badge": "OEM",
            "category": "Threat Intelligence"
          },
          {
            "icon": "sentinelone",
            "name": "SentinelOne",
            "badge": "OEM",
            "category": "Endpoint Protection (EDR/XDR)"
          },
          {
            "icon": "f5",
            "name": "F5",
            "badge": "OEM",
            "category": "Application Delivery & WAF"
          },
          {
            "icon": "tenable",
            "name": "Tenable Nessus",
            "badge": "OEM",
            "category": "Vulnerability Scanning"
          },
          {
            "icon": "imperva",
            "name": "Imperva",
            "badge": "OEM",
            "category": "Application & Data Security"
          },
          {
            "icon": "sophos",
            "name": "Sophos",
            "badge": "OEM",
            "category": "Endpoint & Firewall Security"
          },
          {
            "icon": "trend-micro",
            "name": "Trend Micro",
            "badge": "OEM",
            "category": "Endpoint & Cloud Security"
          },
          {
            "icon": "jetpatch",
            "name": "JetPatch",
            "badge": "OEM",
            "category": "Patch Management"
          },
          {
            "icon": "zecurion",
            "name": "Zecurion",
            "badge": "OEM",
            "category": "Data Loss Prevention"
          },
          {
            "icon": "beyondtrust",
            "name": "BeyondTrust",
            "badge": "OEM",
            "category": "Privileged Access Management"
          },
          {
            "icon": "burp-suite",
            "name": "Burp Suite",
            "badge": "OEM",
            "category": "Web Application Testing"
          },
          {
            "icon": "efficientip",
            "name": "EfficientIP",
            "badge": "OEM",
            "category": "DNS, DHCP & IPAM Security"
          },
          {
            "icon": "gurucul",
            "name": "Gurucul",
            "badge": "OEM",
            "category": "Security Analytics & SIEM"
          },
          {
            "icon": "huawei",
            "name": "Huawei",
            "badge": "OEM",
            "category": "Network & Security Infrastructure"
          },
          {
            "icon": "arcon",
            "name": "ARCON",
            "badge": "OEM",
            "category": "Privileged Access Management"
          }
        ],
        "noscript": {
          "title": "JavaScript is required for the interactive catalogue.",
          "body": "Enable JavaScript to browse the products."
        },
        "ui": {
          "chapterPrefix": "// CHAPTER 0",
          "chapterSeparator": " / ",
          "chapterDash": "—",
          "deployLabel": "Deploy",
          "exploreLabel": "Explore",
          "productFallback": "Product",
          "productCodePrefix": "PRD-",
          "defaultBrandTag": "PRODUCTS",
          "categoryFallback": "SYSTEMS",
          "experienceLabel": "Experience",
          "meetingLabel": "Book a meeting"
        },
        "closing": {
          "eyebrow": "Ready when you are",
          "titleLineOne": "LET’S TALK.",
          "titleLineTwo": "See a product in action, or plan your own.",
          "sub": "Book a meeting and we’ll walk you through any product, or help you scope something new.",
          "primaryBtnText": "Book a meeting",
          "primaryBtnLink": "mailto:contact@ailabsnimbus.com?subject=Book%20a%20meeting",
          "secondaryBtnText": "Audits & Services",
          "secondaryBtnLink": "./services",
          "tertiaryBtnText": "Back to Home",
          "tertiaryBtnLink": "./",
          "title": "See further. Build with <em>Nimbus</em>."
        },
        "legal": [],
        "footerNote": ""
      },
      "audit": {
        "meta": {
          "title": "Audits & Services // AI Labs by Nimbus",
          "description": "Security certification audits, AI for critical operations, industrial ERP and next-generation consumer tech from AI Labs by Nimbus.",
          "ogTitle": "Audits & Services // AI Labs by Nimbus",
          "ogDescription": "Security certification audits, AI for critical operations, industrial ERP and next-generation consumer tech from AI Labs by Nimbus.",
          "ogType": "website",
          "themeColor": "#ffffff"
        },
        "headerCtaHref": "#contact",
        "servicesHeading": "What we do",
        "hero": {
          "titleLines": [
            "Security, AI & software",
            "built for what’s next"
          ],
          "lead": "We get you ready for security certification, build AI you can rely on, run your operations on an ERP made for your industry, and ship consumer products people love.",
          "proof": [
            "Security Certification Audits",
            "Critical AI Solutions",
            "Industrial ERP",
            "Next-Gen Consumer Tech"
          ]
        },
        "framework": {
          "kicker": "HOW WE WORK",
          "title": "Three steps. No guesswork.",
          "lead": "A clear, fixed-scope process from first conversation to handover.",
          "stages": [
            {
              "index": 1,
              "step": "STEP 01",
              "title": "Audit",
              "text": "We learn how you work, find the gaps and risks, and agree on what to fix first."
            },
            {
              "index": 2,
              "step": "STEP 02",
              "title": "Build",
              "text": "We build and test the solution in your environment, sharing progress at every step."
            },
            {
              "index": 3,
              "step": "STEP 03",
              "title": "Hand over",
              "text": "You get working software, clear documentation, and full ownership of the code."
            }
          ]
        },
        "industries": {
          "kicker": "Who we work with",
          "title": "Industries",
          "ariaLabel": "Industries",
          "lead": "Teams where security, reliability and speed matter most.",
          "sectorStart": "01",
          "sectorCount": 4,
          "sectors": [
            {
              "index": 1,
              "chapter": "// SECTOR 01 / 04 — FINANCE",
              "name": "Finance & Fintech",
              "bg": "#2f122e",
              "color": "#ffffff",
              "members": [
                "Audit-ready, every day",
                "Fraud caught before it costs",
                "Compliance without the paperwork",
                "Apps customers trust with their money"
              ]
            },
            {
              "index": 2,
              "chapter": "// SECTOR 02 / 04 — INDUSTRY",
              "name": "Manufacturing & Industry",
              "bg": "#e25c80",
              "color": "#ffffff",
              "members": [
                "The whole floor, one view",
                "Plans that move with demand",
                "Supply chains you can see",
                "Quality checked at line speed"
              ]
            },
            {
              "index": 3,
              "chapter": "// SECTOR 03 / 04 — HEALTHCARE",
              "name": "Healthcare",
              "bg": "#6459e8",
              "color": "#ffffff",
              "members": [
                "Patient data that stays private",
                "AI that never leaves your walls",
                "Care that reaches the phone",
                "Records that flow, not pile up"
              ]
            },
            {
              "index": 4,
              "chapter": "// SECTOR 04 / 04 — CONSUMER",
              "name": "Consumer & Retail",
              "bg": "#0f3d3e",
              "color": "#ffffff",
              "members": [
                "Apps people come back to",
                "Personal, never intrusive",
                "Stock and sales in one place",
                "Payments locked down"
              ]
            }
          ]
        },
        "contact": {
          "heading": "Let’s build what you actually need."
        },
        "footerNav": [
          {
            "label": "Products",
            "href": "./explore",
            "linkClass": "f-link"
          },
          {
            "label": "Audits & Services",
            "href": "./services",
            "linkClass": "f-link is-active"
          },
          {
            "label": "Methodology",
            "href": "#methodology",
            "linkClass": "f-link"
          },
          {
            "label": "Industries",
            "href": "#services-industries",
            "linkClass": "f-link"
          },
          {
            "label": "Book Audit",
            "href": "#contact",
            "linkClass": "f-link"
          }
        ],
        "footerCtaLink": "#contact"
      },
      "login": {
        "meta": {
          "title": "Admin Access — AI Labs by Nimbus"
        },
        "kicker": "// Nimbus Control Plane",
        "title": "Admin Access",
        "subtitle": "Authenticate to open the CMS Matrix. Sessions expire after 8 hours and are bound to this browser.",
        "passwordLabel": "Passphrase",
        "passwordPlaceholder": "Enter admin passphrase",
        "revealLabel": "Show",
        "hideLabel": "Hide",
        "revealAriaLabel": "Show passphrase",
        "hideAriaLabel": "Hide passphrase",
        "submitLabel": "Enter Matrix",
        "busyLabel": "Authenticating…",
        "backLinkText": "Return to site",
        "backLinkHref": "/",
        "errorEmpty": "Enter the admin passphrase to continue.",
        "errorInvalid": "Invalid passphrase. Access denied.",
        "errorAuth": "Authentication failed.",
        "errorNetwork": "Network error. Check that the server is running.",
        "errorNotConfigured": "Admin access is not configured on the server. Set ADMIN_PASSWORD in .env and restart.",
        "statusSuccess": "Authenticated. Opening the CMS Matrix…"
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
