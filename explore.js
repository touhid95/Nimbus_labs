/**
 * NIMBUS LABS — EXPLORE PAGE SCRIPT
 * Vanilla IIFE, consistent with the existing site. Responsibilities:
 *   1. Preloader curtain reveal
 *   2. Header scroll state + mobile drawer
 *   3. Canvas atmospheric particle field (hero)
 *   4. Product observatory (data-driven viewer + tabs)
 *   5. Services spectrum (data-driven accordion)
 *   6. Kinetic bridge scroll translation
 *   7. Scroll reveal, magnetic button, misc
 * Content lives in ./assets/explore/explore-data.js (window.NIMBUS_EXPLORE_DATA).
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DATA = window.NIMBUS_EXPLORE_DATA || { products: [], services: [], meta: {} };

  /* ------------------------------------------------------
     1. PRELOADER
     ------------------------------------------------------ */
  (function preloader() {
    var el = document.getElementById('preloader');
    var bar = document.getElementById('preloader-progress');
    if (!el) return;
    var p = 0;
    var iv = setInterval(function () {
      p += Math.floor(Math.random() * 22) + 14;
      if (p >= 100) {
        p = 100;
        clearInterval(iv);
        if (bar) bar.style.width = '100%';
        setTimeout(function () {
          el.classList.add('preloader--done');
          setTimeout(function () { el.style.display = 'none'; }, 1200);
        }, 320);
      } else if (bar) {
        bar.style.width = p + '%';
      }
    }, 70);
  })();

  /* ------------------------------------------------------
     2. HEADER + MOBILE DRAWER
     ------------------------------------------------------ */
  (function header() {
    var siteHeader = document.getElementById('site-header');
    var btn = document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('mobile-menu');

    function onScroll() {
      if (!siteHeader) return;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      siteHeader.classList.toggle('scrolled', y > 40);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (btn && menu) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle('active');
        btn.setAttribute('aria-expanded', String(open));
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
      document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
          menu.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
        }
      });
    }
  })();

  /* ------------------------------------------------------
     3. ATMOSPHERE CANVAS FIELD
     ------------------------------------------------------ */
  (function atmosphere() {
    var canvas = document.getElementById('atmosphere-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');
    var hero = document.getElementById('hero');
    var dpr = 1, w = 0, h = 0;
    var motes = [];
    var pointer = { x: 0.5, y: 0.5 };
    var target = { x: 0.5, y: 0.5 };
    var visible = true;
    var running = false;
    var raf = null;

    function count() { return window.innerWidth < 768 ? 34 : 92; }

    function build() {
      var n = count();
      motes = [];
      for (var i = 0; i < n; i++) {
        var z = Math.random();
        motes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: z,
          r: 0.4 + z * 1.9,
          a: 0.06 + z * 0.5,
          vy: 0.02 + z * 0.07,
          ph: Math.random() * Math.PI * 2,
          hue: Math.random() < 0.25 ? '228,92,128' : (Math.random() < 0.5 ? '94,234,212' : '196,181,253')
        });
      }
    }

    function resize() {
      var r = canvas.getBoundingClientRect();
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        var px = m.x + (target.x - 0.5) * m.z * 40;
        var py = m.y + (target.y - 0.5) * m.z * 40;
        ctx.beginPath();
        ctx.fillStyle = 'rgba(' + m.hue + ',' + m.a + ')';
        ctx.arc(px, py, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    var t0 = performance.now();
    function frame(now) {
      if (!running) return;
      var elapsed = now - t0;
      ctx.clearRect(0, 0, w, h);
      pointer.x += (target.x - pointer.x) * 0.05;
      pointer.y += (target.y - pointer.y) * 0.05;

      for (var i = 0; i < motes.length; i++) {
        var m = motes[i];
        m.y -= m.vy;
        m.x += Math.sin(elapsed * 0.0004 + m.ph) * 0.15;
        if (m.y < -6) { m.y = h + 6; m.x = Math.random() * w; }
        if (m.x < -6) m.x = w + 6;
        if (m.x > w + 6) m.x = -6;

        var px = m.x + (pointer.x - 0.5) * m.z * 46;
        var py = m.y + (pointer.y - 0.5) * m.z * 46;
        var r = m.r * (0.9 + m.z * 0.5);

        var g = ctx.createRadialGradient(px, py, 0, px, py, r * 3.4);
        g.addColorStop(0, 'rgba(' + m.hue + ',' + m.a + ')');
        g.addColorStop(1, 'rgba(' + m.hue + ',0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(px, py, r * 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
    }

    window.addEventListener('resize', function () {
      resize();
      if (reduceMotion) drawStatic();
    }, { passive: true });

    if (window.matchMedia('(pointer: fine)').matches) {
      hero && hero.addEventListener('mousemove', function (e) {
        var r = canvas.getBoundingClientRect();
        target.x = (e.clientX - r.left) / r.width;
        target.y = (e.clientY - r.top) / r.height;
      }, { passive: true });
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) { stop(); }
      else if (visible) { start(); }
    });

    if ('IntersectionObserver' in window && hero) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          visible = en.isIntersecting;
          if (visible) start(); else stop();
        });
      }, { threshold: 0 });
      io.observe(hero);
    }

    resize();
    if (reduceMotion) { drawStatic(); } else { start(); }
  })();

  /* ------------------------------------------------------
     4. PRODUCT OBSERVATORY
     ------------------------------------------------------ */
  (function products() {
    var products = DATA.products || [];
    var rail = document.getElementById('xp-product-rail');
    if (!rail || !products.length) return;

    var visual = document.getElementById('xp-product-visual');
    var elStatus = document.getElementById('xp-product-status').querySelector('[data-field="status"]');
    var elIndex = document.getElementById('xp-product-index');
    var elGlyph = document.getElementById('xp-product-glyph');
    var elCat = document.getElementById('xp-product-cat');
    var elName = document.getElementById('xp-product-name');
    var elSummary = document.getElementById('xp-product-summary');
    var elDesc = document.getElementById('xp-product-desc');
    var elFeatures = document.getElementById('xp-product-features');
    var elGhost = document.getElementById('xp-product-ghost');
    var elLink = document.getElementById('xp-product-link');
    var panel = document.querySelector('.xp-viewer__panel');
    var tabs = [];

    if (panel) { panel.setAttribute('role', 'tabpanel'); panel.id = panel.id || 'xp-product-panel'; panel.setAttribute('aria-live', 'polite'); }

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    function renderFeatures(list) {
      elFeatures.innerHTML = '';
      (list || []).forEach(function (f) {
        var li = document.createElement('li');
        li.textContent = f;
        elFeatures.appendChild(li);
      });
    }

    function applyPalette(node, palette) {
      node.style.setProperty('--v1', palette[0]);
      node.style.setProperty('--v2', palette[1]);
      node.style.setProperty('--v3', palette[2] || palette[0]);
    }

    function select(i, focus) {
      var p = products[i];
      if (!p) return;
      var pal = (p.visual && p.visual.palette) || ['#6459e8', '#a855f7', '#e25c80'];

      applyPalette(visual, pal);
      visual.setAttribute('data-pattern', (p.visual && p.visual.pattern) || 'orbit');
      if (elStatus) elStatus.textContent = p.status || 'Concept';
      if (elIndex) elIndex.textContent = pad(i + 1);
      if (elGlyph) elGlyph.textContent = (p.visual && p.visual.glyph) || ('P—' + pad(i + 1));
      if (elCat) elCat.textContent = p.category || 'Placeholder Category';
      if (elName) elName.textContent = p.label || ('Product ' + pad(i + 1));
      if (elSummary) elSummary.textContent = p.summary || 'Temporary product summary.';
      if (elDesc) elDesc.textContent = p.description || 'Temporary product description.';
      renderFeatures(p.features);

      var hasLink = p.link && p.link !== '#';
      if (elGhost) elGhost.textContent = hasLink ? 'Open product' : 'Details arrive with the real catalogue';
      if (elLink) {
        elLink.textContent = hasLink ? 'Open' : 'Enquire';
        elLink.href = hasLink ? p.link : '#contact';
        if (hasLink) elLink.setAttribute('target', '_blank');
      }

      tabs.forEach(function (t, ti) {
        var sel = ti === i;
        t.setAttribute('aria-selected', String(sel));
        t.tabIndex = sel ? 0 : -1;
      });
      if (focus) tabs[i].focus();
    }

    products.forEach(function (p, i) {
      var pal = (p.visual && p.visual.palette) || ['#6459e8', '#a855f7', '#e25c80'];
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'xp-rail__tab';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', 'false');
      b.id = 'xp-tab-' + i;
      if (panel) b.setAttribute('aria-controls', panel.id);
      b.style.setProperty('--v1', pal[0]);
      b.style.setProperty('--v2', pal[1]);
      b.innerHTML =
        '<span class="idx">' + pad(i + 1) + ' · ' + (p.status || 'Concept').toUpperCase() + '</span>' +
        '<span class="nm">' + (p.label || ('Product ' + pad(i + 1))) + '</span>' +
        '<span class="ct">' + (p.category || 'Placeholder Category') + '</span>';
      b.addEventListener('click', function () { select(i); });
      b.addEventListener('keydown', function (e) {
        var k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); select((i + 1) % products.length, true); }
        else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); select((i - 1 + products.length) % products.length, true); }
        else if (k === 'Home') { e.preventDefault(); select(0, true); }
        else if (k === 'End') { e.preventDefault(); select(products.length - 1, true); }
      });
      rail.appendChild(b);
      tabs.push(b);
    });

    select(0);

    if (elLink) elLink.setAttribute('aria-label', 'Enquire about this placeholder product');
  })();

  /* ------------------------------------------------------
     5. SERVICES SPECTRUM (accordion)
     ------------------------------------------------------ */
  (function services() {
    var services = DATA.services || [];
    var list = document.getElementById('xp-services-list');
    if (!list || !services.length) return;

    function pad(n) { return (n < 10 ? '0' : '') + n; }
    var heads = [];

    services.forEach(function (s, i) {
      var wrap = document.createElement('div');
      wrap.className = 'xp-svc';
      wrap.style.setProperty('--svc-accent', s.accent || '#6459e8');
      wrap.setAttribute('data-open', 'false');

      var bodyId = 'xp-svc-body-' + i;
      var head = document.createElement('button');
      head.type = 'button';
      head.className = 'xp-svc__head';
      head.setAttribute('aria-expanded', 'false');
      head.setAttribute('aria-controls', bodyId);
      head.innerHTML =
        '<span class="xp-svc__idx">' + (s.label || ('Service ' + pad(i + 1))).toUpperCase() + '</span>' +
        '<span class="xp-svc__titlewrap">' +
          '<span class="xp-svc__title">' + (s.title || 'Placeholder Service Name') + '</span>' +
          '<span class="xp-svc__summary">' + (s.summary || 'Temporary service summary.') + '</span>' +
        '</span>' +
        '<span class="xp-svc__toggle" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>' +
        '</span>';

      var body = document.createElement('div');
      body.className = 'xp-svc__body';
      body.id = bodyId;
      var deliverables = (s.features || []).map(function (f) {
        return '<li>' + f + '</li>';
      }).join('');
      body.innerHTML =
        '<div class="xp-svc__body-inner">' +
          '<p class="xp-svc__detail">' + (s.detail || 'Temporary service detail.') + '</p>' +
          '<ul class="xp-svc__deliverables">' + deliverables + '</ul>' +
        '</div>';

      head.addEventListener('click', function () {
        var isOpen = wrap.getAttribute('data-open') === 'true';
        heads.forEach(function (h) {
          h.wrap.setAttribute('data-open', 'false');
          h.head.setAttribute('aria-expanded', 'false');
        });
        if (!isOpen) {
          wrap.setAttribute('data-open', 'true');
          head.setAttribute('aria-expanded', 'true');
        }
      });

      wrap.appendChild(head);
      wrap.appendChild(body);
      list.appendChild(wrap);
      heads.push({ wrap: wrap, head: head });
    });

    if (heads.length) {
      heads[0].wrap.setAttribute('data-open', 'true');
      heads[0].head.setAttribute('aria-expanded', 'true');
    }
  })();

  /* ------------------------------------------------------
     6. KINETIC BRIDGE SCROLL
     ------------------------------------------------------ */
  (function bridge() {
    var section = document.querySelector('.xp-bridge');
    var rail = document.getElementById('xp-bridge-rail');
    if (!section || !rail || reduceMotion) return;
    var ticking = false;
    var maxX = 0;
    var visible = false;

    function measure() {
      maxX = Math.max(0, rail.scrollWidth - section.clientWidth);
    }
    function update() {
      ticking = false;
      if (!visible) return;
      var r = section.getBoundingClientRect();
      var vh = window.innerHeight;
      var t = (vh - r.top) / (vh + r.height);
      t = Math.max(0, Math.min(1, t));
      rail.style.transform = 'translate3d(' + (-maxX * t).toFixed(1) + 'px, 0, 0)';
    }
    function onScroll() {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }

    window.addEventListener('resize', measure, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) { visible = en.isIntersecting; if (visible) onScroll(); });
      }, { threshold: 0 }).observe(section);
    } else { visible = true; }

    measure();
    update();
  })();

  /* ------------------------------------------------------
     7. REVEAL + MAGNETIC + MISC
     ------------------------------------------------------ */
  (function bells() {
    var reveal = document.querySelectorAll('.xp-reveal, .reveal-on-scroll');
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            var d = en.target.getAttribute('data-delay') || 0;
            setTimeout(function () { en.target.classList.add(en.target.classList.contains('xp-reveal') ? 'is-in' : 'revealed'); }, d);
            obs.unobserve(en.target);
          }
        });
      }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });
      reveal.forEach(function (el) { io.observe(el); });
    } else {
      reveal.forEach(function (el) { el.classList.add('is-in'); el.classList.add('revealed'); });
    }

    var wrap = document.getElementById('magnetic-btn-wrap');
    var mbtn = document.getElementById('footer-contact-btn');
    if (wrap && mbtn && window.innerWidth > 991) {
      wrap.addEventListener('mousemove', function (e) {
        var r = wrap.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        mbtn.style.transform = 'translate3d(' + (x * 0.35) + 'px,' + (y * 0.35) + 'px,0) scale(1.04)';
      });
      wrap.addEventListener('mouseleave', function () {
        mbtn.style.transform = 'translate3d(0,0,0) scale(1)';
      });
    }

    // Live counts in hero meta from placeholder data
    var mp = document.getElementById('meta-products');
    var ms = document.getElementById('meta-services');
    if (mp) mp.textContent = String((DATA.products || []).length);
    if (ms) ms.textContent = String((DATA.services || []).length);

    // Year
    var yr = document.getElementById('xp-year');
    if (yr) yr.textContent = String(new Date().getFullYear());

    // PWA service worker (shared)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () {});
      });
    }
  })();
})();
