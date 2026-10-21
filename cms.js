/**
 * NIMBUS CMS MATRIX — CLIENT ENGINE SCRIPT
 * ----------------------------------------------------------------------------
 * Autonomous content management engine for AI Labs by Nimbus.
 * Zero external dependencies. Vanilla IIFE with strict typing & data contract.
 */
(function () {
  'use strict';

  // Auth-aware fetch. A 401 from the API means the admin session expired or was
  // never valid — bounce to the login screen instead of failing silently.
  async function apiFetch(url, options) {
    const res = await fetch(url, Object.assign({ credentials: 'same-origin' }, options || {}));
    if (res.status === 401 && url.indexOf('/api/v1/auth/') === -1) {
      const next = encodeURIComponent(window.location.pathname);
      window.location.assign('/login?next=' + next);
      throw new Error('Session expired');
    }
    return res;
  }

  // State Store
  const state = {
    content: null,
    activeProductIdx: 0,
    isDirty: false,
    mediaList: [],
    backupsList: [],
    currentMediaFilter: 'all'
  };

  // DOM Elements Cache
  const els = {
    saveBtn: document.getElementById('btn-save-all'),
    saveIndicator: document.getElementById('save-indicator'),
    saveStatusText: document.getElementById('save-status-text'),
    lastSyncTime: document.getElementById('last-sync-time'),
    badgeProductsCount: document.getElementById('badge-products-count'),
    badgeServicesCount: document.getElementById('badge-services-count'),
    railCounter: document.getElementById('rail-counter'),
    productList: document.getElementById('cms-product-list'),
    productForm: document.getElementById('product-form'),
    btnAddProduct: document.getElementById('btn-add-product'),
    btnDuplicateProduct: document.getElementById('btn-duplicate-product'),
    btnDeleteProduct: document.getElementById('btn-delete-product'),
    btnAddFeature: document.getElementById('btn-add-feature'),
    featuresContainer: document.getElementById('features-container'),
    // Inputs
    prodLabel: document.getElementById('prod-label'),
    prodId: document.getElementById('prod-id'),
    prodBadge: document.getElementById('prod-badge'),
    prodCategory: document.getElementById('prod-category'),
    prodStatus: document.getElementById('prod-status'),
    prodSummary: document.getElementById('prod-summary'),
    prodDesc: document.getElementById('prod-desc'),
    prodTheme: document.getElementById('prod-theme'),
    prodBg: document.getElementById('prod-bg'),
    prodBgPicker: document.getElementById('prod-bg-picker'),
    prodContrast: document.getElementById('prod-contrast'),
    prodImage: document.getElementById('prod-image'),
    prodGlyph: document.getElementById('prod-glyph'),
    prodPattern: document.getElementById('prod-pattern'),
    prodLink: document.getElementById('prod-link'),
    summaryCounter: document.getElementById('summary-counter'),
    descCounter: document.getElementById('desc-counter'),
    // Simulator
    simSlide: document.getElementById('sim-slide'),
    simImg: document.getElementById('sim-img'),
    simGlyph: document.getElementById('sim-glyph'),
    simChapNum: document.getElementById('sim-chap-num'),
    simChap: document.getElementById('sim-chap'),
    simBadge: document.getElementById('sim-badge'),
    simTitle: document.getElementById('sim-title'),
    simSummary: document.getElementById('sim-summary'),
    simDesc: document.getElementById('sim-desc'),
    simFeatures: document.getElementById('sim-features'),
    // Meta Tab
    metaKicker: document.getElementById('meta-kicker'),
    metaTitle1: document.getElementById('meta-title-1'),
    metaTitle2: document.getElementById('meta-title-2'),
    metaLead: document.getElementById('meta-lead'),
    metaNote: document.getElementById('meta-note'),
    // Services Tab
    servicesGrid: document.getElementById('services-grid-container'),
    btnAddService: document.getElementById('btn-add-service'),
    // Homepage Tab
    hpHeroTitle: document.getElementById('hp-hero-title'),
    hpHeroHighlight: document.getElementById('hp-hero-highlight'),
    hpHeroTagline: document.getElementById('hp-hero-tagline'),
    hpBtnPrimary: document.getElementById('hp-btn-primary'),
    hpBtnSecondary: document.getElementById('hp-btn-secondary'),
    chaptersEditorContainer: document.getElementById('chapters-editor-container'),
    hpFooterDesc: document.getElementById('hp-footer-desc'),
    hpFooterCopyright: document.getElementById('hp-footer-copyright'),
    hpFooterStatus: document.getElementById('hp-footer-status'),
    // Media Vault
    dropzone: document.getElementById('media-dropzone'),
    mediaFileInput: document.getElementById('media-file-input'),
    btnTriggerUpload: document.getElementById('btn-trigger-upload'),
    mediaGrid: document.getElementById('media-library-grid'),
    mediaCountLabel: document.getElementById('media-count-label'),
    modal: document.getElementById('media-picker-modal'),
    modalBackdrop: document.getElementById('modal-backdrop'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalCancelBtn: document.getElementById('modal-cancel-btn'),
    modalMediaGrid: document.getElementById('modal-media-grid'),
    btnOpenMediaModal: document.getElementById('btn-open-media-modal'),
    // Revisions
    snapshotsList: document.getElementById('snapshots-list'),
    rawJsonInspector: document.getElementById('raw-json-inspector'),
    btnCopyRawJson: document.getElementById('btn-copy-raw-json'),
    btnExportJson: document.getElementById('btn-export-json'),
    btnImportJson: document.getElementById('btn-import-json'),
    jsonFileInput: document.getElementById('json-file-input'),
    // Toast
    toastStack: document.getElementById('toast-stack')
  };

  /* ==========================================================================
     TOAST NOTIFICATION UTILITY
     ========================================================================== */
  function showToast(message, type = 'success') {
    if (!els.toastStack) return;
    const toast = document.createElement('div');
    toast.className = `cms-toast is-${type}`;
    const icon = type === 'success' ? '✓' : (type === 'error' ? '✕' : 'ℹ');
    toast.innerHTML = `<span style="color:${type === 'success' ? '#10b981' : '#f87171'}">${icon}</span> <span>${message}</span>`;
    els.toastStack.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(8px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  }

  function setDirty(isDirty) {
    state.isDirty = isDirty;
    if (els.saveIndicator) {
      if (isDirty) {
        els.saveIndicator.classList.add('is-dirty');
        els.saveStatusText.textContent = 'Unsaved changes';
      } else {
        els.saveIndicator.classList.remove('is-dirty');
        els.saveStatusText.textContent = 'All changes synced';
      }
    }
  }

  /* ==========================================================================
     DATA LOADER & SYNC
     ========================================================================== */
  async function loadSiteContent() {
    try {
      const res = await apiFetch('/api/v1/content');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          state.content = json.data;
          initCMS();
          return;
        }
      }
    } catch (err) {
      console.warn('API /api/v1/content fetch failed, attempting fallback to explore-data.js', err);
    }

    // Fallback if running off-server or direct file
    if (window.NIMBUS_EXPLORE_DATA) {
      state.content = {
        meta: window.NIMBUS_EXPLORE_DATA.meta || {},
        products: window.NIMBUS_EXPLORE_DATA.products || [],
        services: window.NIMBUS_EXPLORE_DATA.services || [],
        homepage: {
          hero: {
            title: 'AI LABS',
            titleHighlight: 'BY NIMBUS',
            tagline: 'We study how you work, then build only what you need.',
            primaryBtnText: 'Explore Product',
            secondaryBtnText: 'Book Audit'
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
            brandDesc: 'Advancing humanity\'s intelligence horizon through computational neuroscience and synthetic reasoning.',
            copyrightText: '© 2026 AI Labs by Nimbus. All rights reserved.',
            statusText: 'All Global Nimbus Clusters Operational'
          }
        }
      };
      initCMS();
    }
  }

  function initCMS() {
    if (!state.content) return;
    renderProductRail();
    loadActiveProductForm();
    loadExploreMeta();
    renderServicesGrid();
    loadHomepageContent();
    loadMediaLibrary();
    loadBackupsList();
    updateRawJsonInspector();
    updateBadgeCounts();
    setDirty(false);
  }

  function updateBadgeCounts() {
    if (!state.content) return;
    const pCount = (state.content.products || []).length;
    const sCount = (state.content.services || []).length;
    if (els.badgeProductsCount) els.badgeProductsCount.textContent = pCount;
    if (els.railCounter) els.railCounter.textContent = `${pCount} PRODUCTS`;
    if (els.badgeServicesCount) els.badgeServicesCount.textContent = sCount;
  }

  /* ==========================================================================
     TAB SWITCHING CONTROLLER
     ========================================================================== */
  function initTabs() {
    const tabButtons = document.querySelectorAll('.cms-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => {
          b.classList.remove('is-active');
          b.setAttribute('aria-selected', 'false');
        });
        document.querySelectorAll('.cms-panel').forEach(p => p.classList.remove('is-active'));

        btn.classList.add('is-active');
        btn.setAttribute('aria-selected', 'true');
        const targetId = btn.getAttribute('data-tab');
        const panel = document.getElementById(targetId);
        if (panel) panel.classList.add('is-active');

        if (targetId === 'tab-revisions') {
          updateRawJsonInspector();
          loadBackupsList();
        } else if (targetId === 'tab-media') {
          loadMediaLibrary();
        }
      });
    });
  }

  /* ==========================================================================
     PRODUCTS SHOWCASE CONTROLLER
     ========================================================================== */
  function renderProductRail() {
    if (!els.productList || !state.content || !state.content.products) return;
    const products = state.content.products;
    els.productList.innerHTML = '';

    products.forEach((p, idx) => {
      const li = document.createElement('li');
      li.className = `cms-prod-item ${idx === state.activeProductIdx ? 'is-selected' : ''}`;
      li.setAttribute('data-index', idx);
      li.innerHTML = `
        <div class="prod-item-top">
          <span class="prod-item-index">// PRD-0${idx + 1}</span>
          <span class="prod-item-status">${p.status || 'Active'}</span>
        </div>
        <div class="prod-item-name">${p.label || 'Unnamed Product'}</div>
        <div class="prod-item-theme">Theme: ${p.theme || 'plum'} · ${p.contrast || 'dark'}</div>
      `;
      li.addEventListener('click', () => {
        state.activeProductIdx = idx;
        renderProductRail();
        loadActiveProductForm();
      });
      els.productList.appendChild(li);
    });
  }

  function loadActiveProductForm() {
    const products = state.content ? state.content.products : [];
    if (!products || !products[state.activeProductIdx]) return;
    const p = products[state.activeProductIdx];

    els.prodLabel.value = p.label || '';
    els.prodId.value = p.id || '';
    els.prodBadge.value = p.badge || '';
    els.prodCategory.value = p.category || '';
    els.prodStatus.value = p.status || 'Active Programme';
    els.prodSummary.value = p.summary || '';
    els.prodDesc.value = p.description || '';
    els.prodTheme.value = p.theme || 'plum';
    els.prodBg.value = p.bg || '#2f122e';
    els.prodBgPicker.value = p.bg && /^#([A-Fa-f0-9]{6})$/.test(p.bg) ? p.bg : '#2f122e';
    els.prodContrast.value = p.contrast || 'dark';
    els.prodImage.value = p.image || '';
    els.prodGlyph.value = (p.visual && p.visual.glyph) || '';
    els.prodPattern.value = (p.visual && p.visual.pattern) || 'orbit';
    els.prodLink.value = p.link || '#contact';

    updateCharCounters();
    renderFeaturesBuilder(p.features || []);
    updateLiveSimulator(p);
  }

  function updateCharCounters() {
    if (els.summaryCounter && els.prodSummary) {
      els.summaryCounter.textContent = `${els.prodSummary.value.length} / 120`;
    }
    if (els.descCounter && els.prodDesc) {
      els.descCounter.textContent = `${els.prodDesc.value.length} / 350`;
    }
  }

  function renderFeaturesBuilder(features) {
    if (!els.featuresContainer) return;
    els.featuresContainer.innerHTML = '';

    features.forEach((feat, i) => {
      const row = document.createElement('div');
      row.className = 'cms-feature-row';
      row.innerHTML = `
        <span class="feature-dash">&mdash;</span>
        <input type="text" class="cms-input feature-input" value="${feat}" placeholder="Feature description...">
        <button type="button" class="feature-del-btn" title="Delete feature">&times;</button>
      `;

      const input = row.querySelector('.feature-input');
      input.addEventListener('input', () => {
        const prod = state.content.products[state.activeProductIdx];
        if (prod && prod.features) {
          prod.features[i] = input.value;
          updateLiveSimulator(prod);
          setDirty(true);
        }
      });

      const delBtn = row.querySelector('.feature-del-btn');
      delBtn.addEventListener('click', () => {
        const prod = state.content.products[state.activeProductIdx];
        if (prod && prod.features) {
          prod.features.splice(i, 1);
          renderFeaturesBuilder(prod.features);
          updateLiveSimulator(prod);
          setDirty(true);
        }
      });

      els.featuresContainer.appendChild(row);
    });
  }

  // Real-time input synchronization
  function bindProductInputs() {
    const inputs = [
      els.prodLabel, els.prodId, els.prodBadge, els.prodCategory,
      els.prodStatus, els.prodSummary, els.prodDesc, els.prodTheme,
      els.prodBg, els.prodContrast, els.prodImage, els.prodGlyph,
      els.prodPattern, els.prodLink
    ];

    inputs.forEach(input => {
      if (!input) return;
      input.addEventListener('input', onProductFieldChanged);
      input.addEventListener('change', onProductFieldChanged);
    });

    if (els.prodBgPicker && els.prodBg) {
      els.prodBgPicker.addEventListener('input', () => {
        els.prodBg.value = els.prodBgPicker.value;
        onProductFieldChanged();
      });
      els.prodBg.addEventListener('input', () => {
        if (/^#([A-Fa-f0-9]{6})$/.test(els.prodBg.value)) {
          els.prodBgPicker.value = els.prodBg.value;
        }
        onProductFieldChanged();
      });
    }

    if (els.btnAddFeature) {
      els.btnAddFeature.addEventListener('click', () => {
        const prod = state.content.products[state.activeProductIdx];
        if (!prod.features) prod.features = [];
        if (prod.features.length >= 6) {
          showToast('Recommended maximum 5 features for visual choreography', 'info');
        }
        prod.features.push('Autonomous capability verified');
        renderFeaturesBuilder(prod.features);
        updateLiveSimulator(prod);
        setDirty(true);
      });
    }

    if (els.btnAddProduct) {
      els.btnAddProduct.addEventListener('click', () => {
        const count = state.content.products.length + 1;
        const newProd = {
          id: `product-0${count}`,
          label: `Nimbus Solution ${count}`,
          badge: 'Autonomous Engine',
          category: 'Frontier Intelligence',
          status: 'Active Programme',
          summary: 'Problem-solving architecture targeting precision computational bottlenecks.',
          description: 'Custom deployed agents delivering dedicated problem isolation without bloated software licensing.',
          features: [
            'Autonomous task decomposition & verification',
            'Real-time neural synthesis'
          ],
          link: '#contact',
          image: './assets/explore/supercomputer.jpg',
          theme: 'plum',
          bg: '#2f122e',
          contrast: 'dark',
          visual: {
            palette: ['#6459e8', '#5eead4', '#f43f5e'],
            pattern: 'orbit',
            glyph: `PRD-0${count}`
          }
        };
        state.content.products.push(newProd);
        state.activeProductIdx = state.content.products.length - 1;
        renderProductRail();
        loadActiveProductForm();
        updateBadgeCounts();
        setDirty(true);
        showToast('Solution added. Configure parameters and save.', 'success');
      });
    }

    if (els.btnDuplicateProduct) {
      els.btnDuplicateProduct.addEventListener('click', () => {
        const cur = state.content.products[state.activeProductIdx];
        if (!cur) return;
        const clone = JSON.parse(JSON.stringify(cur));
        clone.id = `${cur.id}-copy`;
        clone.label = `${cur.label} (Copy)`;
        state.content.products.push(clone);
        state.activeProductIdx = state.content.products.length - 1;
        renderProductRail();
        loadActiveProductForm();
        updateBadgeCounts();
        setDirty(true);
        showToast(`Duplicated solution as "${clone.label}"`, 'success');
      });
    }

    if (els.btnDeleteProduct) {
      els.btnDeleteProduct.addEventListener('click', () => {
        if (state.content.products.length <= 1) {
          showToast('Cannot delete the only remaining product', 'error');
          return;
        }
        const cur = state.content.products[state.activeProductIdx];
        if (confirm(`Are you sure you want to delete "${cur.label || cur.id}"?`)) {
          state.content.products.splice(state.activeProductIdx, 1);
          state.activeProductIdx = Math.max(0, state.activeProductIdx - 1);
          renderProductRail();
          loadActiveProductForm();
          updateBadgeCounts();
          setDirty(true);
          showToast('Product deleted from active showcase', 'info');
        }
      });
    }
  }

  function onProductFieldChanged() {
    const prod = state.content.products[state.activeProductIdx];
    if (!prod) return;

    prod.label = els.prodLabel.value;
    prod.id = els.prodId.value;
    prod.badge = els.prodBadge.value;
    prod.category = els.prodCategory.value;
    prod.status = els.prodStatus.value;
    prod.summary = els.prodSummary.value;
    prod.description = els.prodDesc.value;
    prod.theme = els.prodTheme.value;
    prod.bg = els.prodBg.value;
    prod.contrast = els.prodContrast.value;
    prod.image = els.prodImage.value;
    prod.link = els.prodLink.value;

    if (!prod.visual) prod.visual = { palette: ['#6459e8', '#5eead4', '#f43f5e'] };
    prod.visual.glyph = els.prodGlyph.value;
    prod.visual.pattern = els.prodPattern.value;

    updateCharCounters();
    updateLiveSimulator(prod);
    renderProductRail();
    setDirty(true);
  }

  /* ==========================================================================
     LIVE WYSIWYG SLIDE SIMULATOR
     ========================================================================== */
  function updateLiveSimulator(p) {
    if (!els.simSlide || !p) return;

    els.simSlide.setAttribute('data-contrast', p.contrast || 'dark');
    els.simSlide.style.backgroundColor = p.bg || '#2f122e';

    if (els.simImg) {
      els.simImg.src = p.image || './assets/explore/supercomputer.jpg';
      els.simImg.alt = p.label || 'Product';
    }

    if (els.simGlyph) {
      els.simGlyph.textContent = `// ${(p.visual && p.visual.glyph) ? p.visual.glyph : 'NIMBUS'}`;
    }

    if (els.simChapNum) {
      els.simChapNum.textContent = `0${state.activeProductIdx + 1} / 05`;
    }

    if (els.simChap) {
      els.simChap.textContent = `// CHAPTER 0${state.activeProductIdx + 1} / 05 — ${(p.category || 'SYSTEMS').toUpperCase()}`;
    }

    if (els.simBadge) {
      els.simBadge.textContent = p.badge || 'FLAGSHIP';
      els.simBadge.style.display = p.badge ? 'inline-block' : 'none';
    }

    if (els.simTitle) els.simTitle.textContent = p.label || 'Product Title';
    if (els.simSummary) els.simSummary.textContent = p.summary || '';
    if (els.simDesc) els.simDesc.textContent = p.description || '';

    if (els.simFeatures && p.features) {
      els.simFeatures.innerHTML = p.features.map(f => `<li>&mdash; ${f}</li>`).join('');
    }
  }

  /* ==========================================================================
     EXPLORE META CONTROLLER
     ========================================================================== */
  function loadExploreMeta() {
    if (!state.content || !state.content.meta) return;
    const m = state.content.meta;
    if (els.metaKicker) els.metaKicker.value = m.kicker || '';
    if (els.metaTitle1) els.metaTitle1.value = m.titleLineOne || '';
    if (els.metaTitle2) els.metaTitle2.value = m.titleLineTwo || '';
    if (els.metaLead) els.metaLead.value = m.lead || '';
    if (els.metaNote) els.metaNote.value = m.note || '';

    const inputs = [els.metaKicker, els.metaTitle1, els.metaTitle2, els.metaLead, els.metaNote];
    inputs.forEach(input => {
      if (!input) return;
      input.addEventListener('input', () => {
        m.kicker = els.metaKicker.value;
        m.titleLineOne = els.metaTitle1.value;
        m.titleLineTwo = els.metaTitle2.value;
        m.lead = els.metaLead.value;
        m.note = els.metaNote.value;
        setDirty(true);
      });
    });
  }

  /* ==========================================================================
     SERVICES SPECTRUM CONTROLLER
     ========================================================================== */
  function renderServicesGrid() {
    if (!els.servicesGrid || !state.content) return;
    const services = state.content.services || [];
    els.servicesGrid.innerHTML = '';

    services.forEach((s, idx) => {
      const card = document.createElement('div');
      card.className = 'service-card';
      card.innerHTML = `
        <div class="service-accent-bar" style="background:${s.accent || '#6459e8'}"></div>
        <div class="service-card-top">
          <span class="cms-mono" style="font-size:10px;color:var(--cms-cyan)">// ${s.label || ('SERVICE ' + (idx + 1))}</span>
          <button type="button" class="cms-btn-xs cms-btn-danger btn-del-service" data-idx="${idx}">Delete</button>
        </div>
        <div class="cms-field" style="margin-bottom:8px">
          <label class="cms-label">Service Title</label>
          <input type="text" class="cms-input serv-title" value="${s.title || ''}">
        </div>
        <div class="cms-field" style="margin-bottom:8px">
          <label class="cms-label">Summary</label>
          <input type="text" class="cms-input serv-summary" value="${s.summary || ''}">
        </div>
        <div class="cms-field" style="margin-bottom:8px">
          <label class="cms-label">Detailed Narrative</label>
          <textarea class="cms-textarea serv-detail" rows="2">${s.detail || ''}</textarea>
        </div>
        <div class="cms-form-grid-2">
          <div class="cms-field">
            <label class="cms-label">Accent Color</label>
            <input type="text" class="cms-input cms-mono serv-accent" value="${s.accent || '#6459e8'}">
          </div>
          <div class="cms-field">
            <label class="cms-label">Label Code</label>
            <input type="text" class="cms-input cms-mono serv-label" value="${s.label || ''}">
          </div>
        </div>
      `;

      // Live updates
      const titleInput = card.querySelector('.serv-title');
      const summaryInput = card.querySelector('.serv-summary');
      const detailInput = card.querySelector('.serv-detail');
      const accentInput = card.querySelector('.serv-accent');
      const labelInput = card.querySelector('.serv-label');
      const delBtn = card.querySelector('.btn-del-service');

      [titleInput, summaryInput, detailInput, accentInput, labelInput].forEach(inp => {
        inp.addEventListener('input', () => {
          s.title = titleInput.value;
          s.summary = summaryInput.value;
          s.detail = detailInput.value;
          s.accent = accentInput.value;
          s.label = labelInput.value;
          card.querySelector('.service-accent-bar').style.background = s.accent;
          setDirty(true);
        });
      });

      delBtn.addEventListener('click', () => {
        if (confirm(`Delete service "${s.title}"?`)) {
          state.content.services.splice(idx, 1);
          renderServicesGrid();
          updateBadgeCounts();
          setDirty(true);
        }
      });

      els.servicesGrid.appendChild(card);
    });

    if (els.btnAddService) {
      els.btnAddService.onclick = () => {
        const count = (state.content.services || []).length + 1;
        state.content.services.push({
          id: `service-0${count}`,
          label: `Service 0${count}`,
          title: `Autonomous Capability Audit ${count}`,
          summary: 'Precision algorithmic audit and deployment roadmap.',
          detail: 'Detailed operational problem decomposition and custom model integration.',
          features: ['Topology mapping', 'Zero-hallucination benchmark'],
          accent: '#6459e8'
        });
        renderServicesGrid();
        updateBadgeCounts();
        setDirty(true);
        showToast('Service added to spectrum', 'success');
      };
    }
  }

  /* ==========================================================================
     HOMEPAGE & CHAPTERS CONTROLLER
     ========================================================================== */
  function loadHomepageContent() {
    if (!state.content || !state.content.homepage) return;
    const hp = state.content.homepage;

    // Hero
    if (hp.hero) {
      if (els.hpHeroTitle) els.hpHeroTitle.value = hp.hero.title || '';
      if (els.hpHeroHighlight) els.hpHeroHighlight.value = hp.hero.titleHighlight || '';
      if (els.hpHeroTagline) els.hpHeroTagline.value = hp.hero.tagline || '';
      if (els.hpBtnPrimary) els.hpBtnPrimary.value = hp.hero.primaryBtnText || '';
      if (els.hpBtnSecondary) els.hpBtnSecondary.value = hp.hero.secondaryBtnText || '';

      [els.hpHeroTitle, els.hpHeroHighlight, els.hpHeroTagline, els.hpBtnPrimary, els.hpBtnSecondary].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('input', () => {
          hp.hero.title = els.hpHeroTitle.value;
          hp.hero.titleHighlight = els.hpHeroHighlight.value;
          hp.hero.tagline = els.hpHeroTagline.value;
          hp.hero.primaryBtnText = els.hpBtnPrimary.value;
          hp.hero.secondaryBtnText = els.hpBtnSecondary.value;
          setDirty(true);
        });
      });
    }

    // Chapters
    if (hp.dapper && hp.dapper.chapters && els.chaptersEditorContainer) {
      els.chaptersEditorContainer.innerHTML = '';
      hp.dapper.chapters.forEach((chap, idx) => {
        const row = document.createElement('div');
        row.className = 'cms-field';
        row.style.marginBottom = '14px';
        row.innerHTML = `
          <div class="cms-form-grid-2">
            <div>
              <label class="cms-label">Chapter 0${idx + 1} Name</label>
              <input type="text" class="cms-input chap-name" value="${chap.name || ''}">
            </div>
            <div>
              <label class="cms-label">Cinematic HUD Caption</label>
              <input type="text" class="cms-input chap-caption" value="${chap.caption || ''}">
            </div>
          </div>
        `;
        const nameInp = row.querySelector('.chap-name');
        const capInp = row.querySelector('.chap-caption');
        [nameInp, capInp].forEach(inp => {
          inp.addEventListener('input', () => {
            chap.name = nameInp.value;
            chap.caption = capInp.value;
            setDirty(true);
          });
        });
        els.chaptersEditorContainer.appendChild(row);
      });
    }

    // Footer
    if (hp.footer) {
      if (els.hpFooterDesc) els.hpFooterDesc.value = hp.footer.brandDesc || '';
      if (els.hpFooterCopyright) els.hpFooterCopyright.value = hp.footer.copyrightText || '';
      if (els.hpFooterStatus) els.hpFooterStatus.value = hp.footer.statusText || '';

      [els.hpFooterDesc, els.hpFooterCopyright, els.hpFooterStatus].forEach(inp => {
        if (!inp) return;
        inp.addEventListener('input', () => {
          hp.footer.brandDesc = els.hpFooterDesc.value;
          hp.footer.copyrightText = els.hpFooterCopyright.value;
          hp.footer.statusText = els.hpFooterStatus.value;
          setDirty(true);
        });
      });
    }
  }

  /* ==========================================================================
     MEDIA ASSET VAULT CONTROLLER
     ========================================================================== */
  async function loadMediaLibrary() {
    try {
      const res = await apiFetch('/api/v1/media');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          state.mediaList = json.data;
          renderMediaGrid();
          return;
        }
      }
    } catch (e) {
      console.warn('Could not load media list from /api/v1/media', e);
    }

    // Fallback baseline assets
    state.mediaList = [
      { name: 'supercomputer.jpg', path: './assets/explore/supercomputer.jpg', ext: 'jpg', sizeFormatted: '191 KB', category: 'explore' },
      { name: 'neural.jpg', path: './assets/explore/neural.jpg', ext: 'jpg', sizeFormatted: '328 KB', category: 'explore' },
      { name: 'server.jpg', path: './assets/explore/server.jpg', ext: 'jpg', sizeFormatted: '308 KB', category: 'explore' },
      { name: 'technology.jpg', path: './assets/explore/technology.jpg', ext: 'jpg', sizeFormatted: '668 KB', category: 'explore' },
      { name: 'abstract.jpg', path: './assets/explore/abstract.jpg', ext: 'jpg', sizeFormatted: '501 KB', category: 'explore' },
      { name: 'logo_tight.png', path: './assets/logo_tight.png', ext: 'png', sizeFormatted: '30 KB', category: 'core' }
    ];
    renderMediaGrid();
  }

  function renderMediaGrid() {
    if (!els.mediaGrid) return;
    els.mediaGrid.innerHTML = '';

    const filtered = state.mediaList.filter(item => {
      if (state.currentMediaFilter === 'all') return true;
      return item.category === state.currentMediaFilter;
    });

    if (els.mediaCountLabel) {
      els.mediaCountLabel.textContent = `${filtered.length} of ${state.mediaList.length} ASSETS`;
    }

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'media-item-card';
      const isVideo = item.ext === 'webm' || item.ext === 'mp4';

      card.innerHTML = `
        <div class="media-thumb-wrap">
          <span class="media-ext-tag">${item.ext.toUpperCase()}</span>
          ${isVideo ? 
            `<video src="${item.path}" class="media-thumb" muted preload="metadata"></video>` : 
            `<img src="${item.path}" alt="${item.name}" class="media-thumb" loading="lazy">`
          }
        </div>
        <div class="media-info">
          <div class="media-name" title="${item.name}">${item.name}</div>
          <div class="media-meta">${item.sizeFormatted || ''} · ${item.category}</div>
          <div class="media-actions">
            <button type="button" class="cms-btn-xs btn-copy-path" data-path="${item.path}">Copy Path</button>
            <button type="button" class="cms-btn-xs btn-use-image" data-path="${item.path}">Use in Product</button>
          </div>
        </div>
      `;

      card.querySelector('.btn-copy-path').addEventListener('click', (e) => {
        navigator.clipboard.writeText(item.path);
        showToast(`Copied path: ${item.path}`, 'success');
      });

      card.querySelector('.btn-use-image').addEventListener('click', (e) => {
        els.prodImage.value = item.path;
        onProductFieldChanged();
        showToast(`Asset linked to ${els.prodLabel.value || 'active product'}`, 'success');
      });

      els.mediaGrid.appendChild(card);
    });
  }

  function initMediaUpload() {
    // Filter pills
    document.querySelectorAll('.cms-filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.cms-filter-pill').forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        state.currentMediaFilter = pill.getAttribute('data-filter');
        renderMediaGrid();
      });
    });

    // Upload Trigger
    if (els.btnTriggerUpload && els.mediaFileInput) {
      els.btnTriggerUpload.addEventListener('click', () => els.mediaFileInput.click());
      els.mediaFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          uploadFile(e.target.files[0]);
        }
      });
    }

    // Dropzone
    if (els.dropzone) {
      ['dragenter', 'dragover'].forEach(eventName => {
        els.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          els.dropzone.classList.add('is-dragover');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        els.dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          els.dropzone.classList.remove('is-dragover');
        });
      });

      els.dropzone.addEventListener('drop', (e) => {
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
          uploadFile(e.dataTransfer.files[0]);
        }
      });

      els.dropzone.addEventListener('click', () => {
        if (els.mediaFileInput) els.mediaFileInput.click();
      });
    }
  }

  function uploadFile(file) {
    if (!file) return;
    const reader = new FileReader();
    showToast(`Uploading ${file.name}...`, 'info');

    reader.onload = async (e) => {
      const base64Data = e.target.result;
      try {
        const res = await apiFetch('/api/v1/media/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            filename: file.name,
            base64Data: base64Data
          })
        });

        if (res.ok) {
          const json = await res.json();
          if (json.status === 'success') {
            showToast(`Asset ${json.data.name} uploaded successfully!`, 'success');
            await loadMediaLibrary();
            // Automatically assign to current product if on products tab
            if (els.prodImage) {
              els.prodImage.value = json.data.path;
              onProductFieldChanged();
            }
            return;
          }
        }
        showToast('Upload failed on server', 'error');
      } catch (err) {
        showToast(`Upload error: ${err.message}`, 'error');
      }
    };
    reader.readAsDataURL(file);
  }

  /* ==========================================================================
     MEDIA PICKER MODAL
     ========================================================================== */
  function initMediaModal() {
    if (els.btnOpenMediaModal && els.modal) {
      els.btnOpenMediaModal.addEventListener('click', () => {
        openMediaModal();
      });
    }

    [els.modalCloseBtn, els.modalCancelBtn, els.modalBackdrop].forEach(btn => {
      if (btn) btn.addEventListener('click', closeMediaModal);
    });
  }

  function openMediaModal() {
    if (!els.modal || !els.modalMediaGrid) return;
    els.modalMediaGrid.innerHTML = '';

    state.mediaList.forEach(item => {
      const div = document.createElement('div');
      div.className = 'modal-media-item';
      div.innerHTML = `
        <img src="${item.path}" alt="${item.name}" class="modal-media-thumb">
        <div class="modal-media-name">${item.name}</div>
      `;
      div.addEventListener('click', () => {
        if (els.prodImage) {
          els.prodImage.value = item.path;
          onProductFieldChanged();
        }
        closeMediaModal();
        showToast(`Selected image ${item.name}`, 'success');
      });
      els.modalMediaGrid.appendChild(div);
    });

    els.modal.classList.add('is-open');
    els.modal.setAttribute('aria-hidden', 'false');
  }

  function closeMediaModal() {
    if (!els.modal) return;
    els.modal.classList.remove('is-open');
    els.modal.setAttribute('aria-hidden', 'true');
  }

  /* ==========================================================================
     REVISIONS & BACKUPS CONTROLLER
     ========================================================================== */
  async function loadBackupsList() {
    if (!els.snapshotsList) return;
    try {
      const res = await apiFetch('/api/v1/backups');
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          state.backupsList = json.data;
          renderBackupsList();
        }
      }
    } catch (e) {
      console.warn('Could not fetch backups list', e);
    }
  }

  function renderBackupsList() {
    if (!els.snapshotsList) return;
    els.snapshotsList.innerHTML = '';

    if (!state.backupsList.length) {
      els.snapshotsList.innerHTML = '<div style="padding:16px;color:var(--cms-text-subtle);font-size:11px;">No snapshots created yet. Snapshots are created automatically on every save.</div>';
      return;
    }

    state.backupsList.forEach(item => {
      const row = document.createElement('div');
      row.className = 'snapshot-item';
      const timeStr = new Date(item.created).toLocaleString();

      row.innerHTML = `
        <div class="snapshot-info">
          <div class="snapshot-name">${item.filename}</div>
          <div class="snapshot-time">${timeStr} · ${(item.sizeBytes / 1024).toFixed(1)} KB</div>
        </div>
        <button type="button" class="cms-btn-xs btn-restore-snap" data-file="${item.filename}">Restore</button>
      `;

      row.querySelector('.btn-restore-snap').addEventListener('click', async () => {
        if (confirm(`Restore configuration from snapshot "${item.filename}"? Current unsaved work will be replaced.`)) {
          await restoreSnapshot(item.filename);
        }
      });

      els.snapshotsList.appendChild(row);
    });
  }

  async function restoreSnapshot(filename) {
    try {
      const res = await apiFetch('/api/v1/backups/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          state.content = json.data;
          initCMS();
          showToast(`Snapshot ${filename} restored successfully`, 'success');
          return;
        }
      }
      showToast('Restore request failed', 'error');
    } catch (err) {
      showToast(`Restore error: ${err.message}`, 'error');
    }
  }

  function updateRawJsonInspector() {
    if (!els.rawJsonInspector || !state.content) return;
    els.rawJsonInspector.textContent = JSON.stringify(state.content, null, 2);
  }

  function initJsonActions() {
    if (els.btnCopyRawJson) {
      els.btnCopyRawJson.addEventListener('click', () => {
        navigator.clipboard.writeText(JSON.stringify(state.content, null, 2));
        showToast('Complete JSON copied to clipboard', 'success');
      });
    }

    if (els.btnExportJson) {
      els.btnExportJson.addEventListener('click', () => {
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state.content, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `nimbus-site-content-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        showToast('JSON export downloaded', 'success');
      });
    }

    if (els.btnImportJson && els.jsonFileInput) {
      els.btnImportJson.addEventListener('click', () => els.jsonFileInput.click());
      els.jsonFileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            try {
              const imported = JSON.parse(evt.target.result);
              if (imported.products) {
                state.content = imported;
                initCMS();
                setDirty(true);
                showToast('JSON imported successfully. Review and save.', 'success');
              } else {
                showToast('Invalid JSON structure: missing products array', 'error');
              }
            } catch (err) {
              showToast('Invalid JSON file format', 'error');
            }
          };
          reader.readAsText(e.target.files[0]);
        }
      });
    }
  }

  /* ==========================================================================
     SAVE CONTROLLER (REST API + STATIC EXPORT SYNC)
     ========================================================================== */
  async function saveAllChanges() {
    if (!state.content) return;

    // Validate products slug uniqueness & required fields
    const seenIds = new Set();
    for (const p of state.content.products) {
      if (!p.id || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(p.id)) {
        showToast(`Invalid slug ID "${p.id}". Lowercase alphanumeric and dashes only.`, 'error');
        return;
      }
      if (seenIds.has(p.id)) {
        showToast(`Duplicate slug ID detected: "${p.id}". IDs must be unique.`, 'error');
        return;
      }
      seenIds.add(p.id);

      if (!p.label || !p.label.trim()) {
        showToast(`Product with ID "${p.id}" requires a display name.`, 'error');
        return;
      }
    }

    els.saveBtn.disabled = true;
    els.saveBtn.style.opacity = '0.7';
    showToast('Saving and compiling static field catalogue...', 'info');

    try {
      const res = await apiFetch('/api/v1/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(state.content)
      });

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success') {
          setDirty(false);
          const time = new Date().toLocaleTimeString();
          if (els.lastSyncTime) els.lastSyncTime.textContent = time;
          showToast('✓ Content saved & compiled to static catalogue successfully!', 'success');
          loadBackupsList();
          updateRawJsonInspector();
          return;
        }
      }
      showToast('Save failed on server. Please check console.', 'error');
    } catch (err) {
      showToast(`Save error: ${err.message}`, 'error');
    } finally {
      els.saveBtn.disabled = false;
      els.saveBtn.style.opacity = '1';
    }
  }

  function initShortcuts() {
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveAllChanges();
      }
    });

    if (els.saveBtn) {
      els.saveBtn.addEventListener('click', saveAllChanges);
    }
  }

  /* ==========================================================================
     BOOTSTRAP
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    bindProductInputs();
    initMediaUpload();
    initMediaModal();
    initJsonActions();
    initShortcuts();
    loadSiteContent();
  });

})();
