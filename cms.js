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
    var hd = state.content.site.header || {};
    var assets = state.content.site.assets || {};
    var lg = state.content.pages.login || {};
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
    setVal('site-header-logo-image', hd.logoImage);
    setVal('site-header-logo-alt', hd.logoAlt);
    setVal('site-header-logo-text', hd.logoText);
    setVal('site-header-logo-sub', hd.logoSub);
    setVal('site-header-logo-href', hd.logoHref);
    setVal('site-header-logo-aria', hd.logoAriaLabel);
    setVal('site-header-nav-aria', hd.navAriaLabel);
    setVal('site-header-mobile-nav-aria', hd.mobileNavAriaLabel);
    setVal('site-header-contact-text', hd.contactBtnText);
    setVal('site-header-menu-label', hd.menuBtnLabel);
    setVal('site-header-preloader-logo', hd.preloaderLogo);
    setVal('site-header-preloader-alt', hd.preloaderLogoAlt);
    setVal('site-footer-nav-aria', f.navAriaLabel);
    setVal('site-assets-manifest', assets.manifest);
    setVal('site-assets-favicon', assets.favicon);
    setVal('site-assets-apple-icon', assets.appleTouchIcon);
    setVal('site-assets-apple-title', assets.appleAppTitle);
    setVal('site-assets-og-image', assets.ogImage);
    setVal('login-meta-title', lg.meta && lg.meta.title);
    setVal('login-kicker', lg.kicker);
    setVal('login-title', lg.title);
    setVal('login-subtitle', lg.subtitle);
    setVal('login-password-label', lg.passwordLabel);
    setVal('login-password-placeholder', lg.passwordPlaceholder);
    setVal('login-reveal-label', lg.revealLabel);
    setVal('login-hide-label', lg.hideLabel);
    setVal('login-reveal-aria', lg.revealAriaLabel);
    setVal('login-hide-aria', lg.hideAriaLabel);
    setVal('login-submit-label', lg.submitLabel);
    setVal('login-busy-label', lg.busyLabel);
    setVal('login-back-text', lg.backLinkText);
    setVal('login-back-href', lg.backLinkHref);
    setVal('login-error-empty', lg.errorEmpty);
    setVal('login-error-invalid', lg.errorInvalid);
    setVal('login-error-auth', lg.errorAuth);
    setVal('login-error-network', lg.errorNetwork);
    setVal('login-error-not-configured', lg.errorNotConfigured);
    setVal('login-status-success', lg.statusSuccess);
    renderFooterGroups(g);
    renderHeaderNav(hd.nav || []);
    renderNavList('home-footernav', state.content.pages.home.footerNav || [], markDirty);
    renderNavList('explore-footernav', state.content.pages.explore.footerNav || [], markDirty);
    renderNavList('audit-footernav', state.content.pages.audit.footerNav || [], markDirty);
  }

  function setVal(id, v) { var el = document.getElementById(id); if (el && v !== undefined) { el.value = v; el.oninput = function () { syncGlobal(); markDirty(); }; el.onchange = function () { syncGlobal(); markDirty(); }; } }
  function syncGlobal() {
    var f = state.content.site.footer;
    var hd = state.content.site.header;
    var assets = state.content.site.assets;
    var lg = state.content.pages.login;
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
    f.navAriaLabel = val('site-footer-nav-aria');
    hd.logoImage = val('site-header-logo-image');
    hd.logoAlt = val('site-header-logo-alt');
    hd.logoText = val('site-header-logo-text');
    hd.logoSub = val('site-header-logo-sub');
    hd.logoHref = val('site-header-logo-href');
    hd.logoAriaLabel = val('site-header-logo-aria');
    hd.navAriaLabel = val('site-header-nav-aria');
    hd.mobileNavAriaLabel = val('site-header-mobile-nav-aria');
    hd.contactBtnText = val('site-header-contact-text');
    hd.menuBtnLabel = val('site-header-menu-label');
    hd.preloaderLogo = val('site-header-preloader-logo');
    hd.preloaderLogoAlt = val('site-header-preloader-alt');
    assets.manifest = val('site-assets-manifest');
    assets.favicon = val('site-assets-favicon');
    assets.appleTouchIcon = val('site-assets-apple-icon');
    assets.appleAppTitle = val('site-assets-apple-title');
    assets.ogImage = val('site-assets-og-image');
    if (lg.meta) lg.meta.title = val('login-meta-title');
    lg.kicker = val('login-kicker');
    lg.title = val('login-title');
    lg.subtitle = val('login-subtitle');
    lg.passwordLabel = val('login-password-label');
    lg.passwordPlaceholder = val('login-password-placeholder');
    lg.revealLabel = val('login-reveal-label');
    lg.hideLabel = val('login-hide-label');
    lg.revealAriaLabel = val('login-reveal-aria');
    lg.hideAriaLabel = val('login-hide-aria');
    lg.submitLabel = val('login-submit-label');
    lg.busyLabel = val('login-busy-label');
    lg.backLinkText = val('login-back-text');
    lg.backLinkHref = val('login-back-href');
    lg.errorEmpty = val('login-error-empty');
    lg.errorInvalid = val('login-error-invalid');
    lg.errorAuth = val('login-error-auth');
    lg.errorNetwork = val('login-error-network');
    lg.errorNotConfigured = val('login-error-not-configured');
    lg.statusSuccess = val('login-status-success');
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

  document.getElementById('btn-add-header-nav').onclick = function () {
    if (!state.content.site.header.nav) state.content.site.header.nav = [];
    state.content.site.header.nav.push({ id: 'new-item', label: 'New Link', href: '#', active: { home: false, explore: false, audit: false } });
    renderAll(); markDirty();
  };

  // Shared header nav: one list, with a per-page "active" flag per item.
  function renderHeaderNav(list) {
    var box = document.getElementById('header-nav-editor');
    if (!box) return;
    box.innerHTML = '';
    list.forEach(function (n, i) {
      var active = n.active || {};
      var row = document.createElement('div'); row.className = 'cms-row cms-row-nav';
      row.innerHTML =
        '<input class="cms-input" value="' + esc(n.id) + '" data-i="' + i + '" data-k="id" placeholder="id">' +
        '<input class="cms-input" value="' + esc(n.label) + '" data-i="' + i + '" data-k="label" placeholder="label">' +
        '<input class="cms-input" value="' + esc(n.href) + '" data-i="' + i + '" data-k="href" placeholder="href">' +
        '<label class="cms-check"><input type="checkbox" data-i="' + i + '" data-k="active.home"' + (active.home ? ' checked' : '') + '> home</label>' +
        '<label class="cms-check"><input type="checkbox" data-i="' + i + '" data-k="active.explore"' + (active.explore ? ' checked' : '') + '> explore</label>' +
        '<label class="cms-check"><input type="checkbox" data-i="' + i + '" data-k="active.audit"' + (active.audit ? ' checked' : '') + '> audit</label>' +
        '<button class="cms-btn cms-btn-ghost cms-btn-sm" data-ri="' + i + '">×</button>';
      box.appendChild(row);
    });
    var nav = state.content.site.header.nav;
    box.querySelectorAll('input[data-k]').forEach(function (inp) {
      inp.oninput = inp.onchange = function () {
        var item = nav[inp.getAttribute('data-i')];
        var key = inp.getAttribute('data-k');
        if (key.indexOf('active.') === 0) {
          if (!item.active) item.active = {};
          item.active[key.slice(7)] = inp.checked;
        } else {
          item[key] = inp.value;
        }
        markDirty();
      };
    });
    box.querySelectorAll('button[data-ri]').forEach(function (b) {
      b.onclick = function () { nav.splice(b.getAttribute('data-ri'), 1); renderAll(); markDirty(); };
    });
  }

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
    var d = h.dapper;
    var c = d.controls;
    bind('home-meta-title', h.meta.title, function (v) { h.meta.title = v; markDirty(); });
    bind('home-meta-desc', h.meta.description, function (v) { h.meta.description = v; markDirty(); });
    bind('home-meta-ogtitle', h.meta.ogTitle, function (v) { h.meta.ogTitle = v; markDirty(); });
    bind('home-meta-ogdesc', h.meta.ogDescription, function (v) { h.meta.ogDescription = v; markDirty(); });
    bind('home-meta-ogtype', h.meta.ogType, function (v) { h.meta.ogType = v; markDirty(); });
    bind('home-meta-themecolor', h.meta.themeColor, function (v) { h.meta.themeColor = v; markDirty(); });
    bind('home-header-cta', h.headerCtaHref, function (v) { h.headerCtaHref = v; markDirty(); });
    bind('home-hero-title', h.hero.title, function (v) { h.hero.title = v; markDirty(); });
    bind('home-hero-highlight', h.hero.titleHighlight, function (v) { h.hero.titleHighlight = v; markDirty(); });
    bind('home-hero-tagline', h.hero.tagline, function (v) { h.hero.tagline = v; markDirty(); });
    bind('home-hero-pbtn', h.hero.primaryBtnText, function (v) { h.hero.primaryBtnText = v; markDirty(); });
    bind('home-hero-plink', h.hero.primaryBtnLink, function (v) { h.hero.primaryBtnLink = v; markDirty(); });
    bind('home-hero-pbtn-aria', h.hero.primaryBtnAriaLabel, function (v) { h.hero.primaryBtnAriaLabel = v; markDirty(); });
    bind('home-hero-sbtn', h.hero.secondaryBtnText, function (v) { h.hero.secondaryBtnText = v; markDirty(); });
    bind('home-hero-slink', h.hero.secondaryBtnLink, function (v) { h.hero.secondaryBtnLink = v; markDirty(); });
    bind('home-preloader', h.hero.preloaderStatus, function (v) { h.hero.preloaderStatus = v; markDirty(); });
    bind('home-dapper-chapter-prefix', d.chapterPrefix, function (v) { d.chapterPrefix = v; markDirty(); });
    bind('home-dapper-chapter-start', d.chapterStart, function (v) { d.chapterStart = v; markDirty(); });
    bind('home-dapper-chapter-sep', d.chapterSeparator, function (v) { d.chapterSeparator = v; markDirty(); });
    bind('home-dapper-caption-prefix', d.captionPrefix, function (v) { d.captionPrefix = v; markDirty(); });
    bind('home-dapper-tag-top', d.tagTop, function (v) { d.tagTop = v; markDirty(); });
    bind('home-dapper-tag-bottom', d.tagBottom, function (v) { d.tagBottom = v; markDirty(); });
    bind('home-dapper-tag-prefix', d.tagPrefix, function (v) { d.tagPrefix = v; markDirty(); });
    bind('home-dapper-tag-sep', d.tagSeparator, function (v) { d.tagSeparator = v; markDirty(); });
    bind('home-dapper-video-src', d.video.src, function (v) { d.video.src = v; markDirty(); });
    bind('home-dapper-video-type', d.video.type, function (v) { d.video.type = v; markDirty(); });
    bind('home-ctrl-pause', c.pauseLabel, function (v) { c.pauseLabel = v; markDirty(); });
    bind('home-ctrl-resume', c.resumeLabel, function (v) { c.resumeLabel = v; markDirty(); });
    bind('home-ctrl-sound', c.soundLabel, function (v) { c.soundLabel = v; markDirty(); });
    bind('home-ctrl-muted', c.mutedLabel, function (v) { c.mutedLabel = v; markDirty(); });
    bind('home-ctrl-pause-aria', c.pauseAriaLabel, function (v) { c.pauseAriaLabel = v; markDirty(); });
    bind('home-ctrl-pause-title', c.pauseTitle, function (v) { c.pauseTitle = v; markDirty(); });
    bind('home-ctrl-sound-aria', c.soundAriaLabel, function (v) { c.soundAriaLabel = v; markDirty(); });
    bind('home-ctrl-sound-title', c.soundTitle, function (v) { c.soundTitle = v; markDirty(); });
    bind('home-ctrl-group-aria', c.groupAriaLabel, function (v) { c.groupAriaLabel = v; markDirty(); });
    var box = document.getElementById('home-chapters-editor'); box.innerHTML = '';
    (state.content.homepage.dapper.chapters || []).forEach(function (c2, i) {
      var row = document.createElement('div'); row.className = 'cms-row cms-row-3';
      row.innerHTML = '<input class="cms-input" value="' + esc(c2.name) + '"><input class="cms-input cms-input-long" value="' + esc(c2.caption) + '"><button class="cms-btn cms-btn-ghost cms-btn-sm">×</button>';
      var ins = row.querySelectorAll('input');
      ins[0].oninput = function () { c2.name = ins[0].value; markDirty(); };
      ins[1].oninput = function () { c2.caption = ins[1].value; markDirty(); };
      row.querySelector('button').onclick = function () { state.content.homepage.dapper.chapters.splice(i, 1); renderAll(); markDirty(); };
      box.appendChild(row);
    });
    renderHeroLayers(h.hero.layers || []);
  }

  // The 18-layer parallax stack: id + class drive the CSS, src + alt the asset.
  function renderHeroLayers(layers) {
    var box = document.getElementById('home-layers-editor');
    if (!box) return;
    box.innerHTML = '';
    layers.forEach(function (l, i) {
      var row = document.createElement('div'); row.className = 'cms-row cms-row-4';
      row.innerHTML =
        '<input class="cms-input" value="' + esc(l.id) + '" data-i="' + i + '" data-k="id" placeholder="id">' +
        '<input class="cms-input" value="' + esc(l.className) + '" data-i="' + i + '" data-k="className" placeholder="class">' +
        '<input class="cms-input cms-input-long" value="' + esc(l.src) + '" data-i="' + i + '" data-k="src" placeholder="src">' +
        '<input class="cms-input" value="' + esc(l.alt) + '" data-i="' + i + '" data-k="alt" placeholder="alt">' +
        '<button class="cms-btn cms-btn-ghost cms-btn-sm" data-ri="' + i + '">×</button>';
      box.appendChild(row);
    });
    var arr = state.content.pages.home.hero.layers;
    box.querySelectorAll('input[data-k]').forEach(function (inp) {
      inp.oninput = inp.onchange = function () { arr[inp.getAttribute('data-i')][inp.getAttribute('data-k')] = inp.value; markDirty(); };
    });
    box.querySelectorAll('button[data-ri]').forEach(function (b) {
      b.onclick = function () { arr.splice(b.getAttribute('data-ri'), 1); renderAll(); markDirty(); };
    });
  }

  document.getElementById('btn-add-hero-layer').onclick = function () {
    var layers = state.content.pages.home.hero.layers;
    if (!layers) { layers = state.content.pages.home.hero.layers = []; }
    layers.push({ id: 'layer-new', className: 'hero-01', src: './assets/hero-01.png', alt: '' });
    renderAll(); markDirty();
  };

  /* explore */
  function renderExplore() {
    var ex = state.content.pages.explore;
    var u = ex.ui;
    bind('explore-meta-title', ex.meta.title, function (v) { ex.meta.title = v; markDirty(); });
    bind('explore-meta-desc', ex.meta.description, function (v) { ex.meta.description = v; markDirty(); });
    bind('explore-meta-ogtitle', ex.meta.ogTitle, function (v) { ex.meta.ogTitle = v; markDirty(); });
    bind('explore-meta-ogdesc', ex.meta.ogDescription, function (v) { ex.meta.ogDescription = v; markDirty(); });
    bind('explore-meta-ogtype', ex.meta.ogType, function (v) { ex.meta.ogType = v; markDirty(); });
    bind('explore-meta-themecolor', ex.meta.themeColor, function (v) { ex.meta.themeColor = v; markDirty(); });
    bind('explore-header-cta', ex.headerCtaHref, function (v) { ex.headerCtaHref = v; markDirty(); });
    bind('explore-eyebrow', ex.hero.eyebrow, function (v) { ex.hero.eyebrow = v; markDirty(); });
    bind('explore-title1', ex.hero.titleLineOne, function (v) { ex.hero.titleLineOne = v; markDirty(); });
    bind('explore-title2', ex.hero.titleLineTwo, function (v) { ex.hero.titleLineTwo = v; markDirty(); });
    bind('explore-lead', ex.hero.lead, function (v) { ex.hero.lead = v; markDirty(); });
    bind('explore-pbtn', ex.hero.primaryBtnText, function (v) { ex.hero.primaryBtnText = v; markDirty(); });
    bind('explore-plink', ex.hero.primaryBtnLink, function (v) { ex.hero.primaryBtnLink = v; markDirty(); });
    bind('explore-sbtn', ex.hero.secondaryBtnText, function (v) { ex.hero.secondaryBtnText = v; markDirty(); });
    bind('explore-slink', ex.hero.secondaryBtnLink, function (v) { ex.hero.secondaryBtnLink = v; markDirty(); });
    bind('explore-scroll', ex.hero.scrollHint, function (v) { ex.hero.scrollHint = v; markDirty(); });
    bind('explore-preloader', ex.hero.preloaderStatus, function (v) { ex.hero.preloaderStatus = v; markDirty(); });
    bind('explore-decor-contour', ex.hero.decor.contour, function (v) { ex.hero.decor.contour = v; markDirty(); });
    bind('explore-decor-ridge', ex.hero.decor.ridge, function (v) { ex.hero.decor.ridge = v; markDirty(); });
    bind('explore-ai-strip-aria', ex.aiStripAriaLabel, function (v) { ex.aiStripAriaLabel = v; markDirty(); });
    bind('explore-ui-chapter-prefix', u.chapterPrefix, function (v) { u.chapterPrefix = v; markDirty(); });
    bind('explore-ui-chapter-sep', u.chapterSeparator, function (v) { u.chapterSeparator = v; markDirty(); });
    bind('explore-ui-chapter-dash', u.chapterDash, function (v) { u.chapterDash = v; markDirty(); });
    bind('explore-ui-deploy', u.deployLabel, function (v) { u.deployLabel = v; markDirty(); });
    bind('explore-ui-explore', u.exploreLabel, function (v) { u.exploreLabel = v; markDirty(); });
    bind('explore-ui-product-fallback', u.productFallback, function (v) { u.productFallback = v; markDirty(); });
    bind('explore-ui-brand-tag', u.defaultBrandTag, function (v) { u.defaultBrandTag = v; markDirty(); });
    bind('explore-ui-category-fallback', u.categoryFallback, function (v) { u.categoryFallback = v; markDirty(); });
    bind('explore-noscript-title', ex.noscript.title, function (v) { ex.noscript.title = v; markDirty(); });
    bind('explore-noscript-body', ex.noscript.body, function (v) { ex.noscript.body = v; markDirty(); });
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
    renderAiStrip(ex.aiStrip || []);
    document.getElementById('btn-add-rail').onclick = function () { (ex.hero.rail || (ex.hero.rail = [])).push('NEW'); renderAll(); markDirty(); };
    document.getElementById('btn-add-explore-legal').onclick = function () { (ex.legal || (ex.legal = [])).push({ label: 'New', href: '#' }); renderAll(); markDirty(); };
    document.getElementById('btn-add-ai-strip').onclick = function () { (ex.aiStrip || (ex.aiStrip = [])).push({ icon: 'chatgpt', name: 'New', badge: 'OEM DIRECT', category: 'New Category' }); renderAll(); markDirty(); };
  }

  // Ecosystem marquee items. `icon` selects a template-owned sprite symbol
  // (ai-icon-<id>), never authored markup.
  function renderAiStrip(items) {
    var box = document.getElementById('explore-ai-strip-editor');
    if (!box) return;
    box.innerHTML = '';
    items.forEach(function (it, i) {
      var row = document.createElement('div'); row.className = 'cms-row cms-row-4';
      row.innerHTML =
        '<input class="cms-input" value="' + esc(it.icon) + '" data-i="' + i + '" data-k="icon" placeholder="icon">' +
        '<input class="cms-input" value="' + esc(it.name) + '" data-i="' + i + '" data-k="name" placeholder="name">' +
        '<input class="cms-input" value="' + esc(it.badge) + '" data-i="' + i + '" data-k="badge" placeholder="badge">' +
        '<input class="cms-input cms-input-long" value="' + esc(it.category) + '" data-i="' + i + '" data-k="category" placeholder="category">' +
        '<button class="cms-btn cms-btn-ghost cms-btn-sm" data-ri="' + i + '">×</button>';
      box.appendChild(row);
    });
    var arr = state.content.pages.explore.aiStrip;
    box.querySelectorAll('input[data-k]').forEach(function (inp) {
      inp.oninput = inp.onchange = function () { arr[inp.getAttribute('data-i')][inp.getAttribute('data-k')] = inp.value; markDirty(); };
    });
    box.querySelectorAll('button[data-ri]').forEach(function (b) {
      b.onclick = function () { arr.splice(b.getAttribute('data-ri'), 1); renderAll(); markDirty(); };
    });
  }

  /* audit */
  function renderAudit() {
    var a = state.content.pages.audit;
    bind('audit-meta-title', a.meta.title, function (v) { a.meta.title = v; markDirty(); });
    bind('audit-meta-desc', a.meta.description, function (v) { a.meta.description = v; markDirty(); });
    bind('audit-meta-ogtitle', a.meta.ogTitle, function (v) { a.meta.ogTitle = v; markDirty(); });
    bind('audit-meta-ogdesc', a.meta.ogDescription, function (v) { a.meta.ogDescription = v; markDirty(); });
    bind('audit-meta-ogtype', a.meta.ogType, function (v) { a.meta.ogType = v; markDirty(); });
    bind('audit-meta-themecolor', a.meta.themeColor, function (v) { a.meta.themeColor = v; markDirty(); });
    bind('audit-header-cta', a.headerCtaHref, function (v) { a.headerCtaHref = v; markDirty(); });
    bind('audit-services-heading', a.servicesHeading, function (v) { a.servicesHeading = v; markDirty(); });
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
    bind('audit-ind-aria', a.industries.ariaLabel, function (v) { a.industries.ariaLabel = v; markDirty(); });
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
  // Cloudinary list returns {resources, totalCount, nextCursor}; the local
  // endpoint returns a flat array. Normalise both into state.media entries.
  function loadMedia() {
    apiFetch('/api/v1/media').then(function (r) { return r.json(); }).then(function (j) {
      if (j.status === 'success') { state.media = j.data || []; renderMedia(); }
    });
    apiFetch('/api/v1/media/cloudinary/list').then(function (r) { return r.json(); }).then(function (j) {
      if (j.status !== 'success') return;
      var payload = j.data || {};
      var resources = Array.isArray(payload) ? payload : (payload.resources || []);
      resources.forEach(function (m) {
        var url = m.secureUrl || m.url;
        if (!url) return;
        if (!state.media.find(function (x) { return x.path === url; })) {
          state.media.push({
            name: m.publicId,
            path: url,
            type: m.resourceType,
            format: m.format,
            bytes: m.bytes,
            width: m.width,
            height: m.height,
            source: 'cloudinary'
          });
        }
      });
      renderMedia();
    }).catch(function () {});
  }

  // Images (including animated GIF) preview as <img>; video previews as
  // <video>; anything else falls back to a labelled tile.
  function mediaKind(m, src) {
    var type = String(m.type || '').toLowerCase();
    var format = String(m.format || '').toLowerCase();
    var ext = (String(src).split('?')[0].split('.').pop() || '').toLowerCase();
    if (type === 'video' || ['mp4', 'webm', 'mov', 'm4v', 'ogv'].indexOf(ext) !== -1) return 'video';
    if (type === 'raw' || format === 'raw') return 'file';
    return 'image';
  }

  function mediaPreview(m, src) {
    var kind = mediaKind(m, src);
    if (kind === 'video') {
      return '<video src="' + esc(src) + '" muted playsinline preload="metadata"></video>';
    }
    if (kind === 'file') {
      return '<div class="media-file-tile"><span>' + esc((m.format || 'FILE').toUpperCase()) + '</span></div>';
    }
    return '<img src="' + esc(src) + '" alt="" loading="lazy">';
  }

  function renderMedia() {
    var grid = document.getElementById('media-library-grid');
    var cnt = document.getElementById('media-count-label');
    grid.innerHTML = '';
    if (cnt) cnt.textContent = state.media.length + ' items';
    state.media.forEach(function (m) {
      var card = document.createElement('div'); card.className = 'media-card';
      var src = m.path || ('./assets/' + m.name);
      card.innerHTML = mediaPreview(m, src) + '<div class="media-meta"><span>' + esc(m.name) + '</span></div>';
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
      card.innerHTML = mediaPreview(m, src) + '<div class="media-meta"><span>' + esc(m.name) + '</span></div>';
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
    var list = Array.from(files || []);
    if (list.length === 0) return;
    list.forEach(function (file) {
      var ext = (file.name.split('.').pop() || '').toLowerCase();
      var allowed = ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mov', 'm4v'];
      if (allowed.indexOf(ext) === -1) {
        toast('Unsupported file type: ' + file.name, 'error');
        return;
      }
      var maxBytes = 200 * 1024 * 1024;
      if (file.size > maxBytes) {
        toast('File too large: ' + file.name, 'error');
        return;
      }

      // Try direct signed Cloudinary upload first (browser -> Cloudinary).
      // Falls back to the existing server base64 upload if Cloudinary is not configured.
      uploadToCloudinary(file).catch(function (err) {
        console.warn('Cloudinary direct upload failed, falling back to server upload:', err.message);
        uploadViaServer(file);
      });
    });
  }

  function resourceTypeForFile(file) {
    var ext = (file.name.split('.').pop() || '').toLowerCase();
    if (['mp4', 'webm', 'mov', 'm4v', 'ogv'].indexOf(ext) !== -1) return 'video';
    if (['svg'].indexOf(ext) !== -1) return 'raw';
    return 'image';
  }

  function uploadToCloudinary(file) {
    return apiFetch('/api/v1/media/cloudinary/config').then(function (r) { return r.json(); }).then(function (cfg) {
      if (cfg.status !== 'success' || !cfg.data || cfg.data.configured !== true) {
        throw new Error('Cloudinary not configured');
      }
      return apiFetch('/api/v1/media/cloudinary/sign', { method: 'POST', body: { resourceType: resourceTypeForFile(file) } }).then(function (r) { return r.json(); });
    }).then(function (signedRes) {
      if (signedRes.status !== 'success') throw new Error(signedRes.message || 'sign failed');
      var s = signedRes.data;
      var fd = new FormData();
      fd.append('file', file);
      fd.append('api_key', s.apiKey);
      fd.append('timestamp', s.timestamp);
      fd.append('signature', s.signature);
      fd.append('folder', s.folder);
      if (s.resourceType) fd.append('resource_type', s.resourceType);

      return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open('POST', s.uploadUrl);
        xhr.upload.onprogress = function (e) {
          if (e.lengthComputable) {
            var pct = Math.round((e.loaded / e.total) * 100);
            toast('Uploading ' + file.name + ' ' + pct + '%', 'info');
          }
        };
        xhr.onload = function () {
          try {
            var json = JSON.parse(xhr.responseText || '{}');
            if (xhr.status >= 200 && xhr.status < 300 && json.secure_url) {
              toast('Uploaded ' + file.name, 'success');
              loadMedia();
              resolve(json);
            } else {
              reject(new Error((json.error && json.error.message) || 'upload failed'));
            }
          } catch (err) {
            reject(err);
          }
        };
        xhr.onerror = function () { reject(new Error('network error')); };
        xhr.send(fd);
      });
    });
  }

  function uploadViaServer(file) {
    var reader = new FileReader();
    reader.onloadstart = function () { toast('Uploading ' + file.name + '...', 'info'); };
    reader.onload = function () {
      var data = reader.result.split(',')[1];
      apiFetch('/api/v1/media/upload', { method: 'POST', body: { filename: file.name, name: file.name, type: file.type, data: data, base64Data: reader.result } }).then(function (r) { return r.json(); }).then(function (j) {
        if (j.status === 'success') { toast('Uploaded ' + file.name, 'success'); loadMedia(); } else { toast(j.message || 'Upload failed', 'error'); }
      }).catch(function (e) { toast('Upload error: ' + (e.message || 'failed'), 'error'); });
    };
    reader.onerror = function () { toast('Failed to read file: ' + file.name, 'error'); };
    reader.readAsDataURL(file);
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
