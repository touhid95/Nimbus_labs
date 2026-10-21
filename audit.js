/**
 * CLAY.GLOBAL SERVICES SCRIPT
 * ----------------------------------------------------------------------------
 * Clean interactive controller for Clay's pure minimalist services page.
 * Features:
 *   1. Header scroll blur & mobile drawer
 *   2. 5 Minimalist Geometric Canvas Stages (Orbs, Flat Circles, Squares, Double Cone, Corners)
 *   3. Smooth Parallax Scroll (Media Inner translateY)
 *   4. Current year indicator
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================================================
     1. HEADER SCROLL & MOBILE DRAWER
     ========================================================================== */
  (function initHeader() {
    var header = document.getElementById('clay-header');
    var btn = document.getElementById('clay-menu-btn');
    var drawer = document.getElementById('clay-mobile-drawer');
    var lastY = window.pageYOffset || document.documentElement.scrollTop;
    var threshold = 80;

    function onScroll() {
      if (!header) return;
      var y = window.pageYOffset || document.documentElement.scrollTop;

      // Scrolled elevation
      header.classList.toggle('scrolled', y > 20);

      // Auto-hide when scrolling down, reveal when scrolling up
      var drawerOpen = drawer && drawer.classList.contains('active');
      if (y > threshold && !drawerOpen) {
        if (y > lastY + 5) {
          header.classList.add('is-hidden');
        } else if (y < lastY - 5) {
          header.classList.remove('is-hidden');
        }
      } else {
        header.classList.remove('is-hidden');
      }

      lastY = Math.max(0, y);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (btn && drawer) {
      btn.addEventListener('click', function () {
        var open = drawer.classList.toggle('active');
        btn.setAttribute('aria-expanded', String(open));
        if (open) header.classList.remove('is-hidden');
      });

      drawer.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          drawer.classList.remove('active');
          btn.setAttribute('aria-expanded', 'false');
        });
      });
    }
  })();

  /* ==========================================================================
     2. 5 MINIMALIST GEOMETRIC CANVAS STAGES (Clay's Exact Figures)
     Figures: orbs, flatCircles, squares, doubleCone, corners
     ========================================================================== */
  (function initGeometricStages() {
    if (reduceMotion) return;

    var canvases = document.querySelectorAll('.clay-stage-canvas');
    if (!canvases.length) return;

    canvases.forEach(function (canvas) {
      var figure = canvas.getAttribute('data-figure') || 'orbs';
      var ctx = canvas.getContext('2d');
      if (!ctx) return;

      var w = canvas.width;
      var h = canvas.height;
      var isVisible = false;
      var t = Math.random() * 50;

      if ('IntersectionObserver' in window) {
        var obs = new IntersectionObserver(function (entries) {
          isVisible = entries[0].isIntersecting;
          if (isVisible) requestAnimationFrame(draw);
        }, { threshold: 0.05 });
        obs.observe(canvas);
      } else {
        isVisible = true;
      }

      function draw() {
        if (!isVisible) return;
        t += 0.015;
        ctx.clearRect(0, 0, w, h);

        var cx = w / 2;
        var cy = h / 2;

        switch (figure) {
          case 'orbs':
            // Concentric wireframe orbital rings
            for (var i = 1; i <= 3; i++) {
              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(t * 0.4 * (i % 2 === 0 ? 1 : -1) + (i * Math.PI / 4));
              ctx.scale(1, 0.42);
              ctx.beginPath();
              ctx.arc(0, 0, 180 - (i * 35), 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(0, 0, 0, ' + (0.16 - i * 0.03) + ')';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              // Clean orbital dot
              var ang = t * 1.4 + i;
              var rad = 180 - (i * 35);
              var bx = Math.cos(ang) * rad;
              var by = Math.sin(ang) * rad;
              ctx.beginPath();
              ctx.arc(bx, by, 3.5, 0, Math.PI * 2);
              ctx.fillStyle = '#000000';
              ctx.fill();
              ctx.restore();
            }
            break;

          case 'flatCircles':
            // Staggered pulsing floating circles
            for (var c = 0; c < 4; c++) {
              var angle = (c / 4) * Math.PI * 2 + (t * 0.35);
              var dist = 140 + Math.sin(t * 1.5 + c) * 20;
              var px = cx + Math.cos(angle) * dist;
              var py = cy + Math.sin(angle * 1.2) * (dist * 0.6);
              ctx.beginPath();
              ctx.arc(px, py, 35, 0, Math.PI * 2);
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
              ctx.lineWidth = 1.5;
              ctx.stroke();

              ctx.beginPath();
              ctx.arc(px, py, 4, 0, Math.PI * 2);
              ctx.fillStyle = '#111';
              ctx.fill();
            }
            break;

          case 'squares':
            // Rotating nested wireframe squares
            for (var s = 1; s <= 3; s++) {
              ctx.save();
              ctx.translate(cx, cy);
              ctx.rotate(t * 0.3 * (s % 2 === 0 ? -1 : 1));
              var size = 180 - (s * 35);
              ctx.strokeStyle = 'rgba(0, 0, 0, ' + (0.15 - s * 0.03) + ')';
              ctx.lineWidth = 1.5;
              ctx.strokeRect(-size / 2, -size / 2, size, size);
              ctx.restore();
            }
            break;

          case 'doubleCone':
            // Wireframe dual cone / hourglass lines
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(t * 0.25);
            var count = 12;
            for (var k = 0; k < count; k++) {
              var a = (k / count) * Math.PI * 2;
              ctx.beginPath();
              ctx.moveTo(Math.cos(a) * 160, -120);
              ctx.lineTo(0, 0);
              ctx.lineTo(Math.cos(a + Math.PI) * 160, 120);
              ctx.strokeStyle = 'rgba(0, 0, 0, 0.08)';
              ctx.lineWidth = 1.2;
              ctx.stroke();
            }
            ctx.restore();
            break;

          case 'corners':
            // Minimalist architectural alignment corners
            ctx.save();
            ctx.translate(cx, cy);
            var arm = 40;
            var box = 140 + Math.sin(t) * 15;
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.lineWidth = 2;

            // Top-left
            ctx.beginPath();
            ctx.moveTo(-box, -box + arm);
            ctx.lineTo(-box, -box);
            ctx.lineTo(-box + arm, -box);
            ctx.stroke();

            // Top-right
            ctx.beginPath();
            ctx.moveTo(box - arm, -box);
            ctx.lineTo(box, -box);
            ctx.lineTo(box, -box + arm);
            ctx.stroke();

            // Bottom-left
            ctx.beginPath();
            ctx.moveTo(-box, box - arm);
            ctx.lineTo(-box, box);
            ctx.lineTo(-box + arm, box);
            ctx.stroke();

            // Bottom-right
            ctx.beginPath();
            ctx.moveTo(box - arm, box);
            ctx.lineTo(box, box);
            ctx.lineTo(box, box - arm);
            ctx.stroke();

            ctx.restore();
            break;
        }

        requestAnimationFrame(draw);
      }

      if (isVisible) requestAnimationFrame(draw);
    });
  })();

  /* ==========================================================================
     3. SMOOTH PARALLAX SCROLL (translateY on Media Inner)
     ========================================================================== */
  (function initParallax() {
    if (reduceMotion) return;

    var inners = document.querySelectorAll('.clay-card-media-inner');
    if (!inners.length) return;

    var ticking = false;

    function update() {
      ticking = false;
      var winH = window.innerHeight;
      var winCenter = winH / 2;

      inners.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        if (rect.bottom >= -150 && rect.top <= winH + 150) {
          var cardCenter = rect.top + (rect.height / 2);
          var offsetFromCenter = cardCenter - winCenter;
          // Clay's subtle smooth translateY shift: -60px to +60px
          var shift = Math.max(-65, Math.min(65, offsetFromCenter * 0.12));
          el.style.transform = 'translate3d(0px, ' + shift.toFixed(2) + 'px, 0px)';
        }
      });
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  })();

  /* ==========================================================================
     4. INDUSTRIES DAPPER STAGE CONTROLLER (600vh Curtain Scrub)
     Curtain Layers 2 through 6 wipe up from translateY(100%) to 0%
     ========================================================================== */
  (function initIndustriesDapper() {
    var section = document.getElementById('services-industries');
    var layersContainer = document.getElementById('industries-dapper-layers');
    var progressFill = document.getElementById('industries-progress-fill');
    var counterNum = document.getElementById('active-sector-num');
    if (!section || !layersContainer) return;

    var slides = layersContainer.querySelectorAll('.clay-industry-slide');
    if (!slides.length) return;

    var isTicking = false;

    function pad(n) {
      return (n < 10 ? '0' : '') + n;
    }

    function updateCurtains() {
      isTicking = false;
      var rect = section.getBoundingClientRect();
      var headerEl = document.getElementById('clay-header');
      var headerH = headerEl ? headerEl.offsetHeight : 84;
      var winH = window.innerHeight;
      var stickyH = winH - headerH;
      var totalScroll = section.offsetHeight - stickyH;
      if (totalScroll <= 0) return;

      // Scrolled distance begins exactly when section top reaches the bottom of navbar
      var scrolled = headerH - rect.top;
      var overallProgress = Math.max(0, Math.min(1.0, scrolled / totalScroll));
      // For 6 slides, progress spans 5 step intervals (0.0 to 5.0)
      var sectorProgress = overallProgress * (slides.length - 1);

      // Layer 1 is stationary at translateY(0%)
      // Layers 2 through 6 wipe up as sectorProgress advances
      for (var i = 1; i < slides.length; i++) {
        var p = Math.max(0, Math.min(1.0, sectorProgress - (i - 1)));
        var yPercent = ((1 - p) * 100).toFixed(2);
        slides[i].style.transform = 'translate3d(0px, ' + yPercent + '%, 0px)';
      }

      // Progress bar fill
      if (progressFill) {
        progressFill.style.width = (overallProgress * 100).toFixed(1) + '%';
      }

      // Active sector counter
      if (counterNum) {
        var activeIdx = Math.max(0, Math.min(slides.length - 1, Math.floor(sectorProgress + 0.5)));
        var numStr = pad(activeIdx + 1);
        if (counterNum.textContent !== numStr) {
          counterNum.textContent = numStr;
        }
      }
    }

    window.addEventListener('scroll', function () {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateCurtains);
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      if (!isTicking) {
        isTicking = true;
        requestAnimationFrame(updateCurtains);
      }
    }, { passive: true });

    updateCurtains();
  })();

  /* ==========================================================================
     5. CURRENT YEAR
     ========================================================================== */
  var yr = document.getElementById('year-label');
  if (yr) yr.textContent = new Date().getFullYear();

})();
