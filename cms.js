/**
 * NIMBUS CMS - Rebuilt
 */
(function () {
  'use strict';

  function apiFetch(url, options) {
    const opts = Object.assign({ credentials: 'same-origin' }, options || {});
    if (opts.body && typeof opts.body === 'object' && !(opts.body instanceof FormData)) {
      opts.headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {});
      opts.body = JSON.stringify(opts.body);
    }
    return fetch(url, opts).then(function (res) {
      if (res.status === 401 && url.indexOf('/api/v1/auth/') === -1) {
        window.location.assign('/login?next=' + encodeURIComponent(window.location.pathname));
        throw new Error('Session expired');
      }
      return res;
    });
  }

  function toast(msg, type) {
    var stack = document.getElementById('toast-stack');
    if (!stack) return;
    var el = document.createElement('div');
    el.className = 'cms-toast cms-toast-' + (type || 'info');
    el.textContent = msg;
    stack.appendChild(el);
    setTimeout(function () { el.classList.add('show'); }, 10);
    setTimeout(function () { el.classList.remove('show'); setTimeout(function () { el.remove(); }, 300); }, 2800);
  }

  var state = { content: null, draft: null, hasDraft: false, backups: [], activeProduct: 0, activeService: 0, media: [], pickTarget: null };

  function setDirty(dirty) {
    var ind = document.getElementById('save-indicator');
    var txt = document.getElementById('save-status-text');
    if (!ind) return;
    ind.classList.toggle('is-dirty', !!dirty);
    if (txt) txt.textContent = dirty ? 'Unsaved changes' : (state.hasDraft ? 'Draft saved' : 'All changes synced');
  }

  function setDraftState() {
    var wrap = document.getElementById('draft-state');
    var txt = document.getElementById('draft-state-text');
    if (!wrap) return;
    wrap.classList.toggle('has-draft', !!state.hasDraft);
    if (txt) txt.textContent = state.hasDraft ? 'Draft present' : 'No draft';
  }

  /* tabs */
  function initTabs() {
    document.querySelectorAll('.cms-tab-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        document.querySelectorAll('.cms-tab-btn').forEach(function (b) { b.classList.remove('is-active'); });
        document.querySelectorAll('.cms-panel').forEach(function (p) { p.classList.remove('is-active'); });
        btn.classList.add('is-active');
        var panel = document.getElementById(btn.getAttribute('data-tab'));
        if (panel) panel.classList.add('is-active');
      });
    });
  }

  /* load */
  function loadSiteContent() {
    Promise.all([
      apiFetch('/api/v1/content').then(function (r) { return r.json(); }),
      apiFetch('/api/v1/content/draft').then(function (r) { return r.json(); })
    ]).then(function (res) {
      state.content = res[0].data;
      if (res[1] && res[1].data) { state.draft = res[1].data.draft; state.hasDraft = !!res[1].data.hasDraft; }
      if (state.hasDraft && state.draft) state.content = JSON.parse(JSON.stringify(state.draft));
      renderAll();
      setDraftState();
      setDirty(false);
      loadBackups();
      loadMedia();
    }).catch(function (e) { toast('Failed to load content: ' + e.message, 'error'); });
  }

  /* autosave draft */
  var autosaveTimer = null;
  function autosave() {
    if (!state.content) return;
    if (autosaveTimer) clearTimeout(autosaveTimer);
    autosaveTimer = setTimeout(function () {
      apiFetch('/api/v1/content/draft', { method: 'POST', body: state.content }).then(function (r) { return r.json(); }).then(function (j) {
        if (j.status === 'success') {
          state.hasDraft = true;
          setDraftState();
          var t = document.getElementById('last-autosave-time');
          if (t) t.textContent = new Date().toLocaleTimeString();
        }
      }).catch(function () {});
    }, 600);
  }

  function markDirty() { setDirty(true); autosave(); }

  /* global */
  function renderGlobal() {
    var f = state.content.site.footer;
    var g = state.content.site.footerGroups || [];
    setVal('site-brand-title', f.brandTitle);
    setVal('site-brand-desc', f.brandDesc);
    setVal('site-brand-logo', f.brandLogo);
    setVal('site-talk-heading', f.talkHeading);
    setVal('site-email', f.email);
    setVal('site-email-href', f.emailHref);
    setVal('site-note', f.note);
    setVal('site-location-badge', f.locationBadge);
    setVal('site-location-city', f.locationCity);
    setVal('site-addr1', f.locationAddressLine1);
    setVal('site-addr2', f.locationAddressLine2);
    setVal('site-copyright', f.copyrightText);
    setVal('site-copyright-suffix', f.copyrightSuffix);
    renderFooterGroups(g);
    renderNavList('home-footernav', state.content.pages.home.footerNav || [], markDirty);
    renderNavList('explore-footernav', state.content.pages.explore.footerNav || [], markDirty);
    renderNavList('audit-footernav', state.content.pages.audit.footerNav || [], markDirty);
  }

  function setVal(id, v) { var el = document.getElementById(id); if (el && v !== undefined) { el.value = v; el.oninput = function () { syncGlobal(); markDirty(); }; el.onchange = function () { syncGlobal(); markDirty(); }; } }
  function syncGlobal() {
    var f = state.content.site.footer;
    f.brandTitle = val('site-brand-title');
    f.brandDesc = val('site-brand-desc');
    f.brandLogo = val('site-brand-logo');
    f.talkHeading = val('site-talk-heading');
    f.email = val('site-email');
    f.emailHref = val('site-email-href');
    f.note = val('site-note');
    f.locationBadge = val('site-location-badge');
    f.locationCity = val('site-location-city');
    f.locationAddressLine1 = val('site-addr1');
    f.locationAddressLine2 = val('site-addr2');
    f.copyrightText = val('site-copyright');
    f.copyrightSuffix = val('site-copyright-suffix');
  }
  function val(id) { var el = document.getElementById(id); return el ? el.value : ''; }

  function renderFooterGroups(groups) {
    var box = document.getElementById('footer-groups-editor');
    box.innerHTML = '';
    groups.forEach(function (g, gi) {
      var card = document.createElement('div'); card.className = 'cms-subcard';
      card.innerHTML = '<div class="cms-subcard-header"><input class="cms-input cms-input-sm" value="' + esc(g.title) + '" data-g="' + gi + '" data-k="title"><button class="cms-btn cms-btn-ghost cms-btn-sm" data-rg="' + gi + '">Remove</button></div><div id="fg-' + gi + '"></div><button class="cms-btn cms-btn-ghost cms-btn-sm" data-agl="' + gi + '">+ Add Link</button>';
      box.appendChild(card);
      var linksBox = card.querySelector('#fg-' + gi);
      (g.links || []).forEach(function (l, li) {
        var row = document.createElement('div'); row.className = 'cms-row';
        row.innerHTML = '<input class="cms-input" value="' + esc(l.label) + '" data-g="' + gi + '" data-li="' + li + '" data-k="label"><input class="cms-input" value="' + esc(l.href) + '" data-g="' + gi + '" data-li="' + li + '" data-k="href"><label><input type="checkbox" data-g="' + gi + '" data-li="' + li + '" data-k="external"' + (l.external ? ' checked' : '') + '> external</label><button class="cms-btn cms-btn-ghost cms-btn-sm" data-rl="' + gi + '-' + li + '">×</button>';
        linksBox.appendChild(row);
      });
    });
    box.querySelectorAll('input[data-k]').forEach(function (inp) {
      inp.oninput = function () { if (inp.type === 'checkbox') state.content.site.footerGroups[inp.getAttribute('data-g')].links[inp.getAttribute('data-li')][inp.getAttribute('data-k')] = inp.checked; else if (inp.getAttribute('data-li') !== null) state.content.site.footerGroups[inp.getAttribute('data-g')].links[inp.getAttribute('data-li')][inp.getAttribute('data-k')] = inp.value; else state.content.site.footerGroups[inp.getAttribute('data-g')][inp.getAttribute('data-k')] = inp.value; markDirty(); };
      inp.onchange = inp.oninput;
    });
    box.querySelectorAll('button[data-rg]').forEach(function (b) { b.onclick = function () { state.content.site.footerGroups.splice(b.getAttribute('data-rg'), 1); renderAll(); markDirty(); }; });
    box.querySelectorAll('button[data-agl]').forEach(function (b) { b.onclick = function () { var g = state.content.site.footerGroups[b.getAttribute('data-agl')]; if (!g.links) g.links = []; g.links.push({ label: 'New', href: '#' }); renderAll(); markDirty(); }; });
    box.querySelectorAll('button[data-rl]').forEach(function (b) { b.onclick = function () { var s = b.getAttribute('data-rl').split('-'); state.content.site.footerGroups[s[0]].links.splice(s[1], 1); renderAll(); markDirty(); }; });
  }

  document.getElementById('btn-add-footer-group').onclick = function () { if (!state.content.site.footerGroups) state.content.site.footerGroups = []; state.content.site.footerGroups.push({ title: 'NEW GROUP', links: [{ label: 'Link', href: '#' }] }); renderAll(); markDirty(); };

  function renderNavList(id, list, onCh) {
    var box = document.getElementById(id); box.innerHTML = '';
    list.forEach(function (n, i) {
      var row = document.createElement('div'); row.className = 'cms-row';
      row.innerHTML = '<input class="cms-input" value="' + esc(n.label) + '" data-i="' + i + '" data-k="label"><input class="cms-input" value="' + esc(n.href) + '" data-i="' + i + '" data-k="href"><input class="cms-input" value="' + esc(n.linkClass || '') + '" data-i="' + i + '" data-k="linkClass"><button class="cms-btn cms-btn-ghost cms-btn-sm" data-ri="' + i + '">×</button>';
      box.appendChild(row);
    });
    var path = id === 'home-footernav' ? state.content.pages.home : id === 'explore-footernav' ? state.content.pages.explore : state.content.pages.audit;
    box.querySelectorAll('input').forEach(function (inp) { inp.oninput = function () { path.footerNav[inp.getAttribute('data-i')][inp.getAttribute('data-k')] = inp.value; onCh(); }; });
    box.querySelectorAll('button').forEach(function (b) { b.onclick = function () { path.footerNav.splice(b.getAttribute('data-ri'), 1); renderAll(); onCh(); }; });
    var add = document.createElement('button'); add.className = 'cms-btn cms-btn-ghost cms-btn-sm'; add.textContent = '+ Add'; add.onclick = function () { if (!path.footerNav) path.footerNav = []; path.footerNav.push({ label: 'Link', href: '#', linkClass: 'f-link' }); renderAll(); onCh(); }; box.appendChild(add);
  }

  /* home */
  function renderHome() {
    var h = state.content.pages.home;
    bind('home-meta-title', h.meta.title, function (v) { h.meta.title = v; markDirty(); });
    bind('home-meta-desc', h.meta.description, function (v) { h.meta.description = v; markDirty(); });
    bind('home-hero-title', h.hero.title, function (v) { h.hero.title = v; markDirty(); });
    bind('home-hero-highlight', h.hero.titleHighlight, function (v) { h.hero.titleHighlight = v; markDirty(); });
    bind('home-hero-tagline', h.hero.tagline, function (v) { h.hero.tagline = v; markDirty(); });
    bind('home-hero-pbtn', h.hero.primaryBtnText, function (v) { h.hero.primaryBtnText = v; markDirty(); });
    bind('home-hero-plink', h.hero.primaryBtnLink, function (v) { h.hero.primaryBtnLink = v; markDirty(); });
    bind('home-hero-sbtn', h.hero.secondaryBtnText, function (v) { h.hero.secondaryBtnText = v; markDirty(); });
    bind('home-hero-slink', h.hero.secondaryBtnLink, function (v) { h.hero.secondaryBtnLink = v; markDirty(); });
    bind('home-preloader', h.hero.preloaderStatus, function (v) { h.hero.preloaderStatus = v; markDirty(); });
    var box = document.getElementById('home-chapters-editor'); box.innerHTML = '';
    (state.content.homepage.dapper.chapters || []).forEach(function (c, i) {
      var row = document.createElement('div'); row.className = 'cms-row cms-row-3';
      row.innerHTML = '<input class="cms-input" value="' + esc(c.name) + '"><input class="cms-input cms-input-long" value="' + esc(c.caption) + '"><button class="cms-btn cms-btn-ghost cms-btn-sm">×</button>';
      var ins = row.querySelectorAll('input');
      ins[0].oninput = function () { c.name = ins[0].value; markDirty(); };
      ins[1].oninput = function () { c.caption = ins[1].value; markDirty(); };
      row.querySelector('button').onclick = function () { state.content.homepage.dapper.chapters.splice(i, 1); renderAll(); markDirty(); };
      box.appendChild(row);
    });
  }

  /* explore */
  function renderExplore() {
    var ex = state.content.pages.explore;
    bind('explore-meta-title', ex.meta.title, function (v) { ex.meta.title = v; markDirty(); });
    bind('explore-meta-desc', ex.meta.description, function (v) { ex.meta.description = v; markDirty(); });
    bind('explore-eyebrow', ex.hero.eyebrow, function (v) { ex.hero.eyebrow = v; markDirty(); });
    bind('explore-title1', ex.hero.titleLineOne, function (v) { ex.hero.titleLineOne = v; markDirty(); });
    bind('explore-title2', ex.hero.titleLineTwo, function (v) { ex.hero.titleLineTwo = v; markDirty(); });
    bind('explore-lead', ex.hero.lead, function (v) { ex.hero.lead = v; markDirty(); });
    bind('explore-pbtn', ex.hero.primaryBtnText, function (v) { ex.hero.primaryBtnText = v; markDirty(); });
    bind('explore-plink', ex.hero.primaryBtnLink, function (v) { ex.hero.primaryBtnLink = v; markDirty(); });
    bind('explore-sbtn', ex.hero.secondaryBtnText, function (v) { ex.hero.secondaryBtnText = v; markDirty(); });
    bind('explore-slink', ex.hero.secondaryBtnLink, function (v) { ex.hero.secondaryBtnLink = v; markDirty(); });
    bind('explore-scroll', ex.hero.scrollHint, function (v) { ex.hero.scrollHint = v; markDirty(); });
    listBox('explore-rail', ex.hero.rail || [], function () { markDirty(); renderAll(); }, 'string');
    listBox('explore-metalabels', ex.hero.metaLabels || [], function () { markDirty(); renderAll(); }, 'string');
    bind('explore-close-eyebrow', ex.closing.eyebrow, function (v) { ex.closing.eyebrow = v; markDirty(); });
    bind('explore-close-t1', ex.closing.titleLineOne, function (v) { ex.closing.titleLineOne = v; markDirty(); });
    bind('explore-close-t2', ex.closing.titleLineTwo, function (v) { ex.closing.titleLineTwo = v; markDirty(); });
    bind('explore-close-sub', ex.closing.sub, function (v) { ex.closing.sub = v; markDirty(); });
    bind('explore-close-pbtn', ex.closing.primaryBtnText, function (v) { ex.closing.primaryBtnText = v; markDirty(); });
    bind('explore-close-plink', ex.closing.primaryBtnLink, function (v) { ex.closing.primaryBtnLink = v; markDirty(); });
    bind('explore-close-sbtn', ex.closing.secondaryBtnText, function (v) { ex.closing.secondaryBtnText = v; markDirty(); });
    bind('explore-close-slink', ex.closing.secondaryBtnLink, function (v) { ex.closing.secondaryBtnLink = v; markDirty(); });
    bind('explore-close-tbtn', ex.closing.tertiaryBtnText, function (v) { ex.closing.tertiaryBtnText = v; markDirty(); });
    bind('explore-close-tlink', ex.closing.tertiaryBtnLink, function (v) { ex.closing.tertiaryBtnLink = v; markDirty(); });
    listBox('explore-legal-editor', ex.legal || [], function () { markDirty(); renderAll(); }, 'obj');
    document.getElementById('btn-add-rail').onclick = function () { (ex.hero.rail || (ex.hero.rail = [])).push('NEW'); renderAll(); markDirty(); };
    document.getElementById('btn-add-explore-legal').onclick = function () { (ex.legal || (ex.legal = [])).push({ label: 'New', href: '#' }); renderAll(); markDirty(); };
  }

  /* audit */
  function renderAudit() {
    var a = state.content.pages.audit;
    bind('audit-meta-title', a.meta.title, function (v) { a.meta.title = v; markDirty(); });
    bind('audit-meta-desc', a.meta.description, function (v) { a.meta.description = v; markDirty(); });
    bind('audit-hero-t1', (a.hero.titleLines||[])[0], function (v) { if (!a.hero.titleLines) a.hero.titleLines = []; a.hero.titleLines[0] = v; markDirty(); });
    bind('audit-hero-t2', (a.hero.titleLines||[])[1], function (v) { if (!a.hero.titleLines) a.hero.titleLines = []; a.hero.titleLines[1] = v; markDirty(); });
    bind('audit-hero-lead', a.hero.lead, function (v) { a.hero.lead = v; markDirty(); });
    listBox('audit-proof-editor', a.hero.proof || [], function () { markDirty(); renderAll(); }, 'string');
    bind('audit-fw-kicker', a.framework.kicker, function (v) { a.framework.kicker = v; markDirty(); });
    bind('audit-fw-title', a.framework.title, function (v) { a.framework.title = v; markDirty(); });
    bind('audit-fw-lead', a.framework.lead, function (v) { a.framework.lead = v; markDirty(); });
    listBox('audit-stages-editor', a.framework.stages || [], function () { markDirty(); renderAll(); }, 'stage');
    bind('audit-ind-kicker', a.industries.kicker, function (v) { a.industries.kicker = v; markDirty(); });
    bind('audit-ind-title', a.industries.title, function (v) { a.industries.title = v; markDirty(); });
    bind('audit-ind-lead', a.industries.lead, function (v) { a.industries.lead = v; markDirty(); });
    document.getElementById('btn-add-audit-proof').onclick = function () { (a.hero.proof || (a.hero.proof = [])).push('New proof'); renderAll(); markDirty(); };
  }

  function listBox(id, arr, cb, kind) {
    var box = document.getElementById(id); box.innerHTML = '';
    arr.forEach(function (item, i) {
      var row = document.createElement('div'); row.className = 'cms-row';
      if (kind === 'string') {
        row.innerHTML = '<input class="cms-input cms-input-long" value="' + esc(item) + '"><button class="cms-btn cms-btn-ghost cms-btn-sm">×</button>';
        row.querySelector('input').oninput = function () { arr[i] = row.querySelector('input').value; cb(); };
      } else if (kind === 'obj') {
        row.innerHTML = '<input class="cms-input" value="' + esc(item.label) + '"><input class="cms-input" value="' + esc(item.href) + '"><button class="cms-btn cms-btn-ghost cms-btn-sm">×</button>';
        var ins = row.querySelectorAll('input');
        ins[0].oninput = function () { item.label = ins[0].value; cb(); };
        ins[1].oninput = function () { item.href = ins[1].value; cb(); };
      } else if (kind === 'stage') {
        row.innerHTML = '<input class="cms-input" value="' + esc(item.step) + '"><input class="cms-input" value="' + esc(item.title) + '"><input class="cms-input cms-input-long" value="' + esc(item.text) + '"><button class="cms-btn cms-btn-ghost cms-btn-sm">×</button>';
        var ins = row.querySelectorAll('input');
        ins[0].oninput = function () { item.step = ins[0].value; cb(); };
        ins[1].oninput = function () { item.title = ins[1].value; cb(); };
        ins[2].oninput = function () { item.text = ins[2].value; cb(); };
      }
      row.querySelector('button').onclick = function () { arr.splice(i, 1); cb(); };
      box.appendChild(row);
    });
  }

  function bind(id, val, fn) { var el = document.getElementById(id); if (!el) return; el.value = val || ''; el.oninput = function () { fn(el.value); }; }

  /* products */
  function renderProducts() {
    var list = document.getElementById('cms-product-list'); list.innerHTML = '';
    (state.content.products || []).forEach(function (p, i) {
      var btn = document.createElement('button'); btn.className = 'cms-list-item' + (i === state.activeProduct ? ' is-active' : '');
      btn.textContent = p.label || p.id;
      btn.onclick = function () { state.activeProduct = i; renderProducts(); renderProductForm(); };
      list.appendChild(btn);
    });
    document.getElementById('btn-add-product').onclick = function () {
      state.content.products.push({ id: 'product-' + String(Date.now()).slice(-6), label: 'New Product', badge: '', category: '', status: 'Active Programme', summary: '', description: '', features: [], link: '#contact', image: './assets/explore/supercomputer.jpg', theme: 'plum', bg: '#2f122e', contrast: 'dark', visual: { palette: [], pattern: 'orbit', glyph: 'NIMBUS' } });
      state.activeProduct = state.content.products.length - 1; renderAll(); markDirty();
    };
    document.getElementById('btn-duplicate-product').onclick = function () {
      var p = state.content.products[state.activeProduct];
      var copy = JSON.parse(JSON.stringify(p)); copy.id = p.id + '-copy-' + Date.now().toString().slice(-4); copy.label = p.label + ' (Copy)';
      state.content.products.splice(state.activeProduct + 1, 0, copy); state.activeProduct++; renderAll(); markDirty();
    };
    document.getElementById('btn-delete-product').onclick = function () {
      if (state.content.products.length <= 1) { toast('At least one product is required', 'error'); return; }
      state.content.products.splice(state.activeProduct, 1); state.activeProduct = Math.max(0, state.activeProduct - 1); renderAll(); markDirty();
    };
    renderProductForm();
  }

  function renderProductForm() {
    var p = state.content.products[state.activeProduct]; if (!p) return;
    bind('prod-id', p.id, function (v) { p.id = v; renderProducts(); markDirty(); });
    bind('prod-label', p.label, function (v) { p.label = v; renderProducts(); markDirty(); });
    bind('prod-badge', p.badge, function (v) { p.badge = v; markDirty(); });
    bind('prod-category', p.category, function (v) { p.category = v; markDirty(); });
    bind('prod-status', p.status, function (v) { p.status = v; markDirty(); });
    bind('prod-theme', p.theme, function (v) { p.theme = v; markDirty(); });
    bind('prod-bg', p.bg, function (v) { p.bg = v; markDirty(); });
    bind('prod-link', p.link, function (v) { p.link = v; markDirty(); });
    bind('prod-summary', p.summary, function (v) { p.summary = v; markDirty(); });
    bind('prod-desc', p.description, function (v) { p.description = v; markDirty(); });
    bind('prod-image', p.image, function (v) { p.image = v; markDirty(); });
    document.getElementById('btn-pick-prod-image').onclick = function () { openMediaPicker(function (url) { p.image = url; document.getElementById('prod-image').value = url; markDirty(); }); };
    var fc = document.getElementById('features-container'); fc.innerHTML = '';
    if (!p.features) p.features = [];
    p.features.forEach(function (f, i) {
      var row = document.createElement('div'); row.className = 'cms-row';
      row.innerHTML = '<input class="cms-input cms-input-long" value="' + esc(f) + '"><button class="cms-btn cms-btn-ghost cms-btn-sm">×</button>';
      row.querySelector('input').oninput = function () { p.features[i] = row.querySelector('input').value; markDirty(); };
      row.querySelector('button').onclick = function () { p.features.splice(i, 1); renderAll(); markDirty(); };
      fc.appendChild(row);
    });
    document.getElementById('btn-add-feature').onclick = function () { p.features.push('New feature'); renderAll(); markDirty(); };
  }

  /* services */
  function renderServices() {
    var box = document.getElementById('services-editor'); box.innerHTML = '';
    (state.content.services || []).forEach(function (s, i) {
      var card = document.createElement('div'); card.className = 'cms-subcard';
      card.innerHTML = '<div class="cms-subcard-header"><span>Service ' + (i + 1) + '</span><div><button class="cms-btn cms-btn-ghost cms-btn-sm" data-mu="' + i + '">▲</button><button class="cms-btn cms-btn-ghost cms-btn-sm" data-md="' + i + '">▼</button><button class="cms-btn cms-btn-ghost cms-btn-sm" data-ds="' + i + '">Delete</button></div></div>' +
        '<div class="cms-card-body cms-form-grid"><label class="cms-field"><span class="cms-label">Kicker</span><input class="cms-input" data-k="kicker"></label><label class="cms-field"><span class="cms-label">Title</span><input class="cms-input" data-k="title"></label><label class="cms-field"><span class="cms-label">Figure</span><input class="cms-input" data-k="figure"></label><label class="cms-field"><span class="cms-label">Image</span><div class="cms-input-row"><input class="cms-input" data-k="image"><button class="cms-btn cms-btn-ghost" type="button" data-pick="' + i + '">Pick</button></div></label><label class="cms-field cms-field-full"><span class="cms-label">Text</span><textarea class="cms-textarea" data-k="text"></textarea></label></div>' +
        '<div class="cms-subcard-header"><span>Capabilities</span><button class="cms-btn cms-btn-ghost cms-btn-sm" data-ac="' + i + '">+ Add</button></div><div class="cms-card-body" data-cb="' + i + '"></div>';
      box.appendChild(card);
      card.querySelectorAll('input, textarea').forEach(function (inp) { inp.value = s[inp.getAttribute('data-k')] || ''; inp.oninput = function () { s[inp.getAttribute('data-k')] = inp.value; markDirty(); }; });
      card.querySelector('[data-pick="' + i + '"]').onclick = function () { openMediaPicker(function (url) { s.image = url; card.querySelector('[data-k="image"]').value = url; markDirty(); }); };
      var cb = card.querySelector('[data-cb="' + i + '"]');
      (s.capabilities || []).forEach(function (c, ci) {
        var row = document.createElement('div'); row.className = 'cms-row';
        row.innerHTML = '<input class="cms-input cms-input-long" value="' + esc(c) + '"><button class="cms-btn cms-btn-ghost cms-btn-sm">×</button>';
        row.querySelector('input').oninput = function () { s.capabilities[ci] = row.querySelector('input').value; markDirty(); };
        row.querySelector('button').onclick = function () { s.capabilities.splice(ci, 1); renderAll(); markDirty(); };
        cb.appendChild(row);
      });
      card.querySelector('[data-ac="' + i + '"]').onclick = function () { if (!s.capabilities) s.capabilities = []; s.capabilities.push('New capability'); renderAll(); markDirty(); };
      card.querySelector('[data-mu="' + i + '"]').onclick = function () { if (i === 0) return; var tmp = state.content.services[i - 1]; state.content.services[i - 1] = s; state.content.services[i] = tmp; renderAll(); markDirty(); };
      card.querySelector('[data-md="' + i + '"]').onclick = function () { if (i === state.content.services.length - 1) return; var tmp = state.content.services[i + 1]; state.content.services[i + 1] = s; state.content.services[i] = tmp; renderAll(); markDirty(); };
      card.querySelector('[data-ds="' + i + '"]').onclick = function () { if (state.content.services.length <= 1) { toast('At least one service is required', 'error'); return; } state.content.services.splice(i, 1); renderAll(); markDirty(); };
    });
    document.getElementById('btn-add-service').onclick = function () {
      state.content.services.push({ id: 'service-' + Date.now(), kicker: 'XX / CATEGORY', title: 'New Service', text: 'Description...', capabilities: ['Capability 1'], image: './assets/explore/supercomputer.jpg', figure: 'orbit' });
      renderAll(); markDirty();
    };
  }

  /* media */
  function loadMedia() {
    apiFetch('/api/v1/media').then(function (r) { return r.json(); }).then(function (j) { if (j.status === 'success') { state.media = j.data || []; renderMedia(); } });
    apiFetch('/api/v1/media/cloudinary/list').then(function (r) { return r.json(); }).then(function (j) { if (j.status === 'success' && Array.isArray(j.data)) { j.data.forEach(function (m) { if (!state.media.find(function (x) { return x.path === m.secure_url; })) state.media.push({ name: m.public_id, path: m.secure_url, type: m.resource_type, source: 'cloudinary' }); }); renderMedia(); } }).catch(function () {});
  }

  function renderMedia() {
    var grid = document.getElementById('media-library-grid');
    var cnt = document.getElementById('media-count-label');
    grid.innerHTML = '';
    if (cnt) cnt.textContent = state.media.length + ' items';
    state.media.forEach(function (m) {
      var card = document.createElement('div'); card.className = 'media-card';
      var src = m.path || ('./assets/' + m.name);
      if ((m.type || '').indexOf('video') !== -1 || src.match(/\.(mp4|webm)$/i)) {
        card.innerHTML = '<video src="' + esc(src) + '" muted></video><div class="media-meta"><span>' + esc(m.name) + '</span></div>';
      } else {
        card.innerHTML = '<img src="' + esc(src) + '" alt=""><div class="media-meta"><span>' + esc(m.name) + '</span></div>';
      }
      card.onclick = function () { if (state.pickTarget) { state.pickTarget(src); closeMediaPicker(); } };
      grid.appendChild(card);
    });
  }

  function openMediaPicker(cb) { state.pickTarget = cb; document.getElementById('media-picker-modal').classList.add('is-open'); renderModalMedia(); }
  function closeMediaPicker() { state.pickTarget = null; document.getElementById('media-picker-modal').classList.remove('is-open'); }
  document.getElementById('modal-close-btn').onclick = closeMediaPicker;
  document.getElementById('modal-cancel-btn').onclick = closeMediaPicker;
  document.getElementById('modal-backdrop').onclick = closeMediaPicker;
  function renderModalMedia() {
    var grid = document.getElementById('modal-media-grid'); grid.innerHTML = '';
    state.media.forEach(function (m) {
      var card = document.createElement('div'); card.className = 'media-card';
      var src = m.path || ('./assets/' + m.name);
      card.innerHTML = '<img src="' + esc(src) + '" alt=""><div class="media-meta"><span>' + esc(m.name) + '</span></div>';
      card.onclick = function () { if (state.pickTarget) { state.pickTarget(src); closeMediaPicker(); } };
      grid.appendChild(card);
    });
  }

  function initMediaUpload() {
    var dz = document.getElementById('media-dropzone');
    var inp = document.getElementById('media-file-input');
    var btn = document.getElementById('btn-trigger-upload');
    if (btn) btn.onclick = function () { inp.click(); };
    if (dz) {
      dz.onclick = function (e) { if (e.target === dz || e.target.classList.contains('dropzone-inner') || e.target.classList.contains('dropzone-title') || e.target.classList.contains('dropzone-sub')) inp.click(); };
      dz.ondragover = function (e) { e.preventDefault(); dz.classList.add('is-drag'); };
      dz.ondragleave = function () { dz.classList.remove('is-drag'); };
      dz.ondrop = function (e) { e.preventDefault(); dz.classList.remove('is-drag'); uploadFiles(e.dataTransfer.files); };
    }
    if (inp) inp.onchange = function () { uploadFiles(inp.files); inp.value = ''; };
  }
  function uploadFiles(files) {
    Array.from(files).forEach(function (file) {
      var reader = new FileReader();
      reader.onload = function () {
        var data = reader.result.split(',')[1];
        apiFetch('/api/v1/media/upload', { method: 'POST', body: { name: file.name, type: file.type, data: data } }).then(function (r) { return r.json(); }).then(function (j) {
          if (j.status === 'success') { toast('Uploaded ' + file.name, 'success'); loadMedia(); } else { toast(j.message || 'Upload failed', 'error'); }
        }).catch(function (e) { toast('Upload error: ' + e.message, 'error'); });
      };
      reader.readAsDataURL(file);
    });
  }

  /* snapshots */
  function loadBackups() {
    apiFetch('/api/v1/backups').then(function (r) { return r.json(); }).then(function (j) {
      if (j.status === 'success') { state.backups = j.data || []; renderBackups(); }
    });
  }
  function renderBackups() {
    var list = document.getElementById('snapshots-list'); list.innerHTML = '';
    state.backups.forEach(function (b, i) {
      var row = document.createElement('div'); row.className = 'snap-row';
      row.innerHTML = '<div class="snap-info"><div class="snap-name">' + esc(b.filename) + '</div><div class="snap-meta">' + esc(b.created) + ' · ' + Math.round(b.sizeBytes/1024) + 'KB</div></div><div class="snap-actions"><button class="cms-btn cms-btn-ghost cms-btn-sm" data-diff="' + b.filename + '">Diff</button><button class="cms-btn cms-btn-primary cms-btn-sm" data-restore="' + b.filename + '">Restore</button></div>';
      row.querySelector('[data-diff="' + b.filename + '"]').onclick = function () { showDiff(b.filename); };
      row.querySelector('[data-restore="' + b.filename + '"]').onclick = function () { if (confirm('Restore snapshot ' + b.filename + '? This will replace live content.')) restoreSnapshot(b.filename); };
      list.appendChild(row);
    });
  }
  function showDiff(filename) {
    apiFetch('/api/v1/backups/diff?filename=' + encodeURIComponent(filename)).then(function (r) { return r.json(); }).then(function (j) {
      var pre = document.getElementById('snapshot-diff');
      if (j.status === 'success') {
        if (!j.data.changes.length) { pre.textContent = 'No differences from live content.'; return; }
        pre.textContent = j.data.changes.map(function (c) { return c.path + ' [' + c.kind + ']'; }).join('\n');
      } else { pre.textContent = j.message || 'Diff failed'; }
    });
  }
  function restoreSnapshot(filename) {
    apiFetch('/api/v1/backups/restore', { method: 'POST', body: { filename: filename } }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.status === 'success') { toast('Restored ' + filename, 'success'); loadSiteContent(); } else { toast(j.message, 'error'); }
    });
  }

  /* raw json */
  function updateRaw() { var ta = document.getElementById('raw-json-inspector'); if (ta && state.content) ta.value = JSON.stringify(state.content, null, 2); }
  document.getElementById('btn-copy-raw').onclick = function () { var ta = document.getElementById('raw-json-inspector'); ta.select(); document.execCommand('copy'); toast('Copied', 'success'); };
  document.getElementById('btn-export-json').onclick = function () { var blob = new Blob([JSON.stringify(state.content, null, 2)], { type: 'application/json' }); var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'site-content.json'; a.click(); };
  document.getElementById('btn-import-json').onclick = function () { document.getElementById('json-file-input').click(); };
  document.getElementById('json-file-input').onchange = function (e) {
    var f = e.target.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () { try { state.content = JSON.parse(r.result); renderAll(); markDirty(); toast('Imported', 'success'); } catch (ex) { toast('Invalid JSON', 'error'); } };
    r.readAsText(f);
  };

  /* publish/discard/preview */
  document.getElementById('btn-publish').onclick = function () {
    apiFetch('/api/v1/content/publish', { method: 'POST' }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.status === 'success') { toast('Published', 'success'); state.hasDraft = false; setDraftState(); setDirty(false); loadBackups(); loadSiteContent(); } else { toast(j.message, 'error'); }
    });
  };
  document.getElementById('btn-discard').onclick = function () {
    if (!confirm('Discard draft?')) return;
    apiFetch('/api/v1/content/draft', { method: 'DELETE' }).then(function (r) { return r.json(); }).then(function () { toast('Draft discarded', 'success'); loadSiteContent(); });
  };
  document.getElementById('btn-preview').onclick = function () { document.getElementById('preview-modal').classList.add('is-open'); loadPreview(); };
  document.getElementById('preview-close-btn').onclick = function () { document.getElementById('preview-modal').classList.remove('is-open'); };
  document.getElementById('preview-backdrop').onclick = function () { document.getElementById('preview-modal').classList.remove('is-open'); };
  document.getElementById('preview-page-select').onchange = loadPreview;
  function loadPreview() {
    var page = document.getElementById('preview-page-select').value;
    apiFetch('/api/v1/preview', { method: 'POST', body: { page: page, content: state.content } }).then(function (r) { return r.json(); }).then(function (j) {
      if (j.status === 'success') {
        var frame = document.getElementById('preview-frame');
        frame.srcdoc = j.data.html;
      } else { toast(j.message, 'error'); }
    });
  }

  function renderAll() {
    renderGlobal();
    renderHome();
    renderExplore();
    renderAudit();
    renderProducts();
    renderServices();
    updateRaw();
    setDraftState();
  }

  function esc(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  document.addEventListener('DOMContentLoaded', function () {
    initTabs();
    initMediaUpload();
    loadSiteContent();
  });
})();
