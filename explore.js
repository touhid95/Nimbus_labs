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
    var siteHeader = document.getElementById('clay-header') || document.getElementById('site-header');
    var btn = document.getElementById('clay-menu-btn') || document.getElementById('mobile-menu-btn');
    var menu = document.getElementById('clay-mobile-drawer') || document.getElementById('mobile-menu');

    var lastY = window.pageYOffset || document.documentElement.scrollTop;
    var threshold = 80;

    function onScroll() {
      if (!siteHeader) return;
      var y = window.pageYOffset || document.documentElement.scrollTop;
      siteHeader.classList.toggle('scrolled', y > 20);

      var menuOpen = menu && menu.classList.contains('active');
      if (y > threshold && !menuOpen) {
        if (y > lastY + 5) {
          siteHeader.classList.add('is-hidden');
        } else if (y < lastY - 5) {
          siteHeader.classList.remove('is-hidden');
        }
      } else {
        siteHeader.classList.remove('is-hidden');
      }

      lastY = Math.max(0, y);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (btn && menu) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var open = menu.classList.toggle('active');
        btn.setAttribute('aria-expanded', String(open));
        if (siteHeader) {
          siteHeader.classList.toggle('drawer-open', open);
          if (open) siteHeader.classList.remove('is-hidden');
        }
      });
      menu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          menu.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          if (siteHeader) siteHeader.classList.remove('drawer-open');
        });
      });
      document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
          menu.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
          if (siteHeader) siteHeader.classList.remove('drawer-open');
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
     4. PRODUCT SHOWCASE (Dapper Sticky Pinned 500vh Curtain Slides)
     ------------------------------------------------------ */
  (function products() {
    var products = DATA.products || [];
    var container = document.getElementById('xp-dapper-layers');
    var section = document.getElementById('products');
    if (!container || !section || !products.length) return;

    function pad(n) { return (n < 10 ? '0' : '') + n; }

    var layerEls = [];

    products.forEach(function (p, i) {
      var isOdd = i % 2 === 1;
      var layer = document.createElement('article');
      layer.className = 'xp-dapper-layer is--' + (i + 1);
      layer.id = p.id;
      layer.setAttribute('data-theme', p.theme || 'plum');
      layer.setAttribute('data-contrast', p.contrast || 'dark');
      layer.setAttribute('data-bg', p.bg || '#2f122e');

      var featuresHtml = '';
      if (p.features && p.features.length) {
        featuresHtml = '<ul class="xp-dapper-features">' +
          p.features.map(function (f) {
            return '<li class="xp-dapper-feature-item">' +
              '<span class="xp-dapper-dash" aria-hidden="true">&mdash;</span>' +
              '<span>' + f + '</span>' +
            '</li>';
          }).join('') +
        '</ul>';
      }

      var badgeHtml = p.badge ? '<span class="xp-dapper-badge">' + p.badge + '</span>' : '';

      var visualMediaHtml = '';
      if (p.image) {
        visualMediaHtml = '<div class="xp-dapper-media">' +
          '<div class="xp-dapper-media__frame">' +
            '<img src="' + p.image + '" alt="' + (p.label || 'Product') + '" class="xp-dapper-img" loading="lazy">' +
            '<div class="xp-dapper-media__overlay"></div>' +
            '<div class="xp-dapper-media-hud">' +
              '<span>// ' + (p.visual && p.visual.glyph ? p.visual.glyph : ('PRD-' + pad(i + 1))) + '</span>' +
              '<span>' + pad(i + 1) + ' / 05</span>' +
            '</div>' +
          '</div>' +
        '</div>';
      }

      layer.innerHTML =
        '<div class="xp-dapper-slide-shell">' +
          '<div class="xp-dapper-slide-grid ' + (isOdd ? 'xp-dapper-slide-grid--reverse' : '') + '">' +
            visualMediaHtml +
            '<div class="xp-dapper-content">' +
              '<div class="xp-dapper-meta">' +
                '<span class="xp-dapper-chapter">// CHAPTER 0' + (i + 1) + ' / 05 &mdash; ' + (p.category ? p.category.toUpperCase() : 'SYSTEMS') + '</span>' +
                badgeHtml +
              '</div>' +
              '<h2 class="xp-dapper-title">' + (p.label || ('Product ' + pad(i + 1))) + '</h2>' +
              '<p class="xp-dapper-summary">' + (p.summary || '') + '</p>' +
              '<p class="xp-dapper-desc">' + (p.description || '') + '</p>' +
              featuresHtml +
              '<div class="xp-dapper-actions">' +
                '<a href="#contact" class="xp-dapper-btn" aria-label="Deploy ' + (p.label || 'product') + '">' +
                  '<span>Deploy ' + (p.label || 'Product') + '</span>' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>' +
                '</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      container.appendChild(layer);
      layerEls.push(layer);
    });

    // ----------------------------------------------------
    // DAPPER STICKY CURTAIN SCRUB CONTROLLER
    // Layer 1 is stationary at translateY(0%)
    // Layers 2, 3, 4, 5 wipe up from 100% to 0% as scroll progresses
    // Dynamic Navbar Brand Tag tracks current product title
    // ----------------------------------------------------
    var isTicking = false;
    var brandTag = document.getElementById('brand-status-tag');
    var currentTagText = 'SOLUTIONS';
    var isUpdatingTag = false;

    function setBrandTag(text) {
      if (!brandTag || currentTagText === text || isUpdatingTag) return;
      currentTagText = text;
      isUpdatingTag = true;
      brandTag.classList.add('is-updating');
      setTimeout(function () {
        brandTag.textContent = text;
        brandTag.classList.remove('is-updating');
        isUpdatingTag = false;
      }, 120);
    }

    function updateDapperCurtains() {
      isTicking = false;
      var rect = section.getBoundingClientRect();
      var winH = window.innerHeight;
      var totalScroll = section.offsetHeight - winH;
      if (totalScroll <= 0) return;

      var scrolled = -rect.top;
      var overallProgress = Math.max(0, Math.min(1.0, scrolled / totalScroll));
      var chapterProgress = overallProgress * 4; // 0.0 to 4.0 across 5 chapters

      // Layer 2: Sunset Rose (slides 100% -> 0% during chapter 0 to 1)
      if (layerEls[1]) {
        var p2 = Math.max(0, Math.min(1, chapterProgress));
        layerEls[1].style.transform = 'translate3d(0px, ' + ((1 - p2) * 100).toFixed(2) + '%, 0px)';
      }

      // Layer 3: Electric Violet (slides 100% -> 0% during chapter 1 to 2)
      if (layerEls[2]) {
        var p3 = Math.max(0, Math.min(1, chapterProgress - 1));
        layerEls[2].style.transform = 'translate3d(0px, ' + ((1 - p3) * 100).toFixed(2) + '%, 0px)';
      }

      // Layer 4: Cognition White (slides 100% -> 0% during chapter 2 to 3)
      if (layerEls[3]) {
        var p4 = Math.max(0, Math.min(1, chapterProgress - 2));
        layerEls[3].style.transform = 'translate3d(0px, ' + ((1 - p4) * 100).toFixed(2) + '%, 0px)';
      }

      // Layer 5: Midnight Nimbus (slides 100% -> 0% during chapter 3 to 4)
      if (layerEls[4]) {
        var p5 = Math.max(0, Math.min(1, chapterProgress - 3));
        layerEls[4].style.transform = 'translate3d(0px, ' + ((1 - p5) * 100).toFixed(2) + '%, 0px)';
      }

      // Dynamic Navbar Brand Tag:
      // Show 'SOLUTIONS' in hero/bridge and closing/footer
      // Show active product title (uppercase) during Dapper slides
      var targetTag = 'SOLUTIONS';
      if (rect.top <= 80 && rect.bottom > winH) {
        var activeIdx = Math.max(0, Math.min(products.length - 1, Math.floor(chapterProgress + 0.5)));
        targetTag = (products[activeIdx].label || ('Product ' + (activeIdx + 1))).toUpperCase();
      }
      setBrandTag(targetTag);
    }

    function onScroll() {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateDapperCurtains);
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    updateDapperCurtains();
  })();

  /* ------------------------------------------------------
     6. KINETIC BRIDGE (DYNAMIC MARQUEE LINKS TO SLIDES)
     ------------------------------------------------------ */
  (function bridge() {
    var section = document.querySelector('.xp-bridge');
    var rail = document.getElementById('xp-bridge-rail');
    if (!section || !rail) return;

    var products = DATA.products || [];
    if (!products.length) return;

    // Render product links alternating between solid white fill and stroke outline
    var html = '';
    products.forEach(function (p, i) {
      var isFill = (i % 2 === 0);
      var wordsWithDiamonds = (p.label || ('Product ' + (i + 1)))
        .split(' ')
        .join(' <i>◆</i> ') + ' <i>◆</i>';

      html += '<a href="#' + p.id + '" class="xp-bridge__word ' + (isFill ? 'is-fill ' : '') + 'xp-bridge__link" data-slide-index="' + i + '" aria-label="Explore ' + (p.label || 'product') + '">' +
        wordsWithDiamonds +
      '</a>';
    });
    rail.innerHTML = html;

    function scrollToProductIndex(idx, isSmooth) {
      var dapperSection = document.getElementById('products');
      if (!dapperSection || idx < 0 || idx >= products.length) return;
      var winH = window.innerHeight;
      var totalScroll = dapperSection.offsetHeight - winH;
      var sectionTop = dapperSection.getBoundingClientRect().top + window.pageYOffset;
      var progress = (products.length > 1) ? (idx / (products.length - 1)) : 0;
      var targetScrollY = sectionTop + (progress * totalScroll);
      window.scrollTo({
        top: targetScrollY,
        behavior: isSmooth && !reduceMotion ? 'smooth' : 'auto'
      });
    }

    // Smooth scroll directly to the exact pinned position for that product slide
    rail.addEventListener('click', function (e) {
      var link = e.target.closest('.xp-bridge__link');
      if (!link) return;
      e.preventDefault();

      var idx = parseInt(link.getAttribute('data-slide-index'), 10);
      if (isNaN(idx)) return;

      scrollToProductIndex(idx, true);

      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', link.getAttribute('href'));
      }
    });

    function checkInitialHash() {
      if (window.location.hash) {
        var hashId = window.location.hash.replace('#', '');
        var matchIdx = -1;
        for (var i = 0; i < products.length; i++) {
          if (products[i].id === hashId) { matchIdx = i; break; }
        }
        if (matchIdx !== -1) {
          setTimeout(function () { scrollToProductIndex(matchIdx, false); }, 200);
        }
      }
    }
    window.addEventListener('hashchange', checkInitialHash);
    setTimeout(checkInitialHash, 250);

    if (reduceMotion) return;

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

    // In-page smooth scroll for footer and navigation anchors
    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
      anchor.addEventListener('click', function (e) {
        var hash = anchor.getAttribute('href');
        if (!hash || hash === '#' || anchor.classList.contains('xp-bridge__link')) return;
        var target = document.querySelector(hash);
        if (target) {
          e.preventDefault();
          var headerH = 80;
          var top = target.getBoundingClientRect().top + window.pageYOffset - headerH;
          window.scrollTo({
            top: Math.max(0, top),
            behavior: reduceMotion ? 'auto' : 'smooth'
          });
          if (window.history && window.history.pushState) {
            window.history.pushState(null, '', hash);
          }
        }
      });
    });

    // PWA service worker (shared)
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('./sw.js').catch(function () {});
      });
    }
  })();

})();
