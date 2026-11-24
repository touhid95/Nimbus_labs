/**
 * AI LABS BY NIMBUS - MASTER SCRIPT
 * Implements exact Webflow followUP.html Scenery Parallax & Cloud Animations
 */

(function () {
  'use strict';

  // ----------------------------------------------------
  // 0. CMS CONTENT ISLAND
  // Runtime labels (chapter indicator, brand tags, control captions) come
  // from the CMS-rendered JSON island so they stay editable from the panel.
  // ----------------------------------------------------
  const dapperUI = (function () {
    const node = document.getElementById('dapper-ui');
    if (!node) return {};
    try {
      const parsed = JSON.parse(node.textContent);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (err) {
      console.warn('Unable to read dapper UI content:', err);
      return {};
    }
  })();

  const dapperLabels = dapperUI.controls || {};

  // ----------------------------------------------------
  // 1. PRELOADER (Split-Curtain Reveal matching Webflow)
  // ----------------------------------------------------
  const preloader = document.getElementById('preloader');
  const progressBar = document.getElementById('preloader-progress');

  let loadProgress = 0;
  const progressInterval = setInterval(() => {
    loadProgress += Math.floor(Math.random() * 20) + 12;
    if (loadProgress >= 100) {
      loadProgress = 100;
      clearInterval(progressInterval);
      if (progressBar) progressBar.style.width = '100%';

      setTimeout(() => {
        if (preloader) {
          preloader.classList.add('preloader--done');
          setTimeout(() => {
            preloader.style.display = 'none';
          }, 1200);
        }
      }, 350);
    } else {
      if (progressBar) progressBar.style.width = loadProgress + '%';
    }
  }, 60);

  // ----------------------------------------------------
  // 2. SCENERY ANIMATION CONFIGURATION
  // Matches exact Webflow actionLists: "a-6" (parallax__animation)
  // and "a-4" (clouds__animation)
  // ----------------------------------------------------
  const heroWrapper = document.getElementById('hero-wrapper');
  const heroSection = document.getElementById('hero');
  const heroTextOverlay = document.getElementById('hero-text-overlay');
  const siteHeader = document.getElementById('clay-header') || document.getElementById('site-header');

  // Parallax layers and their exact Webflow translateY multipliers (0% to 100% of hero scroll)
  // hero-10 -> 10%, hero-09 -> 15%, hero-08 -> 20%, ..., hero-02 (SUN) -> 50%
  const mountainLayers = [
    { el: document.getElementById('layer-10'), yFactor: 0.10 },
    { el: document.getElementById('layer-09'), yFactor: 0.15 },
    { el: document.getElementById('layer-08'), yFactor: 0.20 },
    { el: document.getElementById('layer-07'), yFactor: 0.25 },
    { el: document.getElementById('layer-06'), yFactor: 0.30 },
    { el: document.getElementById('layer-05'), yFactor: 0.35 },
    { el: document.getElementById('layer-04'), yFactor: 0.40 },
    { el: document.getElementById('layer-03'), yFactor: 0.45 },
    { el: document.getElementById('layer-02'), yFactor: 0.50 } // THE SUN
  ];

  // Cloud layers: Webflow continuousActionGroups yFactor + horizontal continuous drift range (%)
  // Webflow a-4: cloud1 ±2%, cloud2 ±4%, cloud3 ±6%, cloud4 ±8%, cloud5 ±10%, cloud6 ±12%, cloud7 ±14%, cloud8 ±16%
  const cloudLayers = [
    { el: document.getElementById('layer-cloud1'), yFactor: 0.20, xRange: 2.0, speed: 0.00045, phase: 0.0 },
    { el: document.getElementById('layer-cloud2'), yFactor: 0.25, xRange: 4.0, speed: 0.00040, phase: 0.8 },
    { el: document.getElementById('layer-cloud3'), yFactor: 0.30, xRange: 6.0, speed: 0.00035, phase: 1.6 },
    { el: document.getElementById('layer-cloud4'), yFactor: 0.35, xRange: 8.0, speed: 0.00030, phase: 2.4 },
    { el: document.getElementById('layer-cloud5'), yFactor: 0.40, xRange: 10.0, speed: 0.00028, phase: 3.2 },
    { el: document.getElementById('layer-cloud6'), yFactor: 0.45, xRange: 12.0, speed: 0.00025, phase: 4.0 },
    { el: document.getElementById('layer-cloud7'), yFactor: 0.50, xRange: 14.0, speed: 0.00022, phase: 4.8 },
    { el: document.getElementById('layer-cloud8'), yFactor: 0.50, xRange: 16.0, speed: 0.00020, phase: 5.6 }
  ];

  // State for smooth lerp rendering (Webflow smoothing: 75 -> 0.075 factor)
  let targetScrollY = 0;
  let currentScrollY = 0;

  // Track window dimensions
  let winHeight = window.innerHeight;
  let heroHeight = heroSection ? heroSection.offsetHeight : winHeight;

  function updateDimensions() {
    winHeight = window.innerHeight;
    if (heroSection) heroHeight = heroSection.offsetHeight;
  }
  window.addEventListener('resize', updateDimensions, { passive: true });

  // Scroll listener with directional auto-hide
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;
  const scrollHideThreshold = 80;

  window.addEventListener('scroll', () => {
    targetScrollY = window.pageYOffset || document.documentElement.scrollTop;

    // Header elevation
    if (siteHeader) {
      if (targetScrollY > 20) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }

      // Hide on scroll down, show on scroll up
      const mobileDrawer = document.getElementById('clay-mobile-drawer');
      const drawerOpen = mobileDrawer && mobileDrawer.classList.contains('active');
      if (targetScrollY > scrollHideThreshold && !drawerOpen) {
        if (targetScrollY > lastScrollY + 5) {
          siteHeader.classList.add('is-hidden');
        } else if (targetScrollY < lastScrollY - 5) {
          siteHeader.classList.remove('is-hidden');
        }
      } else {
        siteHeader.classList.remove('is-hidden');
      }

      lastScrollY = Math.max(0, targetScrollY);
    }
  }, { passive: true });

  // Mobile Drawer Toggle
  const menuBtn = document.getElementById('clay-menu-btn');
  const mobileDrawer = document.getElementById('clay-mobile-drawer');
  if (menuBtn && mobileDrawer) {
    menuBtn.addEventListener('click', () => {
      const open = mobileDrawer.classList.toggle('active');
      menuBtn.setAttribute('aria-expanded', String(open));
      if (siteHeader) {
        siteHeader.classList.toggle('drawer-open', open);
        if (open) siteHeader.classList.remove('is-hidden');
      }
    });

    function closeDrawer() {
      mobileDrawer.classList.remove('active');
      menuBtn.setAttribute('aria-expanded', 'false');
      if (siteHeader) siteHeader.classList.remove('drawer-open');
    }

    mobileDrawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeDrawer);
    });

    // Close when tapping outside the drawer
    document.addEventListener('click', (e) => {
      if (!mobileDrawer.contains(e.target) && !menuBtn.contains(e.target)) closeDrawer();
    });
  }

  // ----------------------------------------------------
  // 3. MASTER RENDER LOOP & DAPPER STICKY CONTROLLER
  // 5 Chapters (services): 01 ENTERPRISE AI -> 02 AI SOFTWARE -> 03 AI CLOUD -> 04 SELF-HOSTED AI -> 05 OSINT & SOCMINT
  // ----------------------------------------------------
  const dapperSection = document.getElementById('dapper');
  const dapperHeaderRail = document.getElementById('dapper-header-rail');
  const dapperProgBar = document.getElementById('dapper-progress-bar');
  const dapperChapInd = document.getElementById('dapper-chapter-indicator');
  const brandStatusTag = document.getElementById('brand-status-tag');
  const dapperHeaderWrapper = document.querySelector('.dapper-header-wrapper');
  const dapperCaptionText = document.getElementById('dapper-caption-text');
  let currentCaptionIdx = -1;

  // Chapter names and captions come from the CMS content rendered into the
  // page, so the kinetic section stays editable without touching this file.
  const dapperChapters = (function () {
    const node = document.getElementById('dapper-chapters');
    if (!node) return [];
    try {
      const parsed = JSON.parse(node.textContent);
      return Array.isArray(parsed) ? parsed : [];
    } catch (err) {
      console.warn('Unable to read dapper chapters:', err);
      return [];
    }
  })();

  const chapterNames = dapperChapters.map(function (chapter) { return chapter.name || ''; });
  const chapterCaptions = dapperChapters.map(function (chapter) { return chapter.caption || ''; });
  const chapterCount = Math.max(1, dapperChapters.length);

  function updateDapperSticky() {
    if (!dapperSection) return;
    const rect = dapperSection.getBoundingClientRect();
    const totalScroll = dapperSection.offsetHeight - winHeight;
    if (totalScroll <= 0) return;

    // Normalized progress through the sticky section (0.0 to 1.0)
    const scrolled = -rect.top;
    const overallProgress = Math.max(0, Math.min(1.0, scrolled / totalScroll));

    // Progress across the chapter rail (0.0 to chapterCount - 1)
    const chapterProgress = overallProgress * (chapterCount - 1);

    // 1. Kinetic typography rail translation
    const slideHeight = dapperHeaderWrapper ? dapperHeaderWrapper.offsetHeight : (winHeight < 768 ? 80 : 160);
    const railY = -chapterProgress * slideHeight;
    if (dapperHeaderRail) {
      dapperHeaderRail.style.transform = `translate3d(0px, ${railY.toFixed(2)}px, 0px)`;
    }

    // 2. Difference colour layers: layer N+1 wipes up between chapter N-1
    // and chapter N.
    for (let k = 1; k < chapterCount; k++) {
      const layer = document.getElementById('dapper-layer-' + (k + 1));
      if (!layer) continue;
      const p = Math.max(0, Math.min(1, chapterProgress - (k - 1)));
      layer.style.transform = `translate3d(0px, ${((1 - p) * 100).toFixed(2)}%, 0px)`;
    }

    // 3. Bottom progress bar: 20% to 100%
    if (dapperProgBar) {
      const barWidth = 20 + (overallProgress * 80);
      dapperProgBar.style.width = `${barWidth.toFixed(1)}%`;
    }

    // 4. Chapter indicator, brand tag, and HUD caption updates
    const activeIdx = Math.min(chapterCount - 1, Math.floor(chapterProgress + 0.5));

    if (dapperChapInd) {
      const pad = String(dapperUI.chapterStart || '01').length;
      dapperChapInd.textContent = `${dapperUI.chapterPrefix || 'CHAPTER'} ${String(activeIdx + 1).padStart(pad, '0')} ${dapperUI.chapterSeparator || '/'} ${String(chapterCount).padStart(pad, '0')}`;
    }

    if (dapperCaptionText && currentCaptionIdx !== activeIdx) {
      currentCaptionIdx = activeIdx;
      dapperCaptionText.classList.add('is-updating');
      setTimeout(() => {
        dapperCaptionText.textContent = chapterCaptions[activeIdx];
        dapperCaptionText.classList.remove('is-updating');
      }, 150);
    }

    if (brandStatusTag) {
      let targetTag = dapperUI.tagTop || 'WHAT WE DO';
      if (rect.top > 80) {
        targetTag = dapperUI.tagTop || 'WHAT WE DO';
      } else if (rect.bottom < 80) {
        targetTag = dapperUI.tagBottom || 'OUR SERVICES';
      } else {
        targetTag = `${dapperUI.tagPrefix || 'CHAPTER 0'}${activeIdx + 1} ${dapperUI.tagSeparator || '//'} ${chapterNames[activeIdx]}`;
      }
      if (brandStatusTag.textContent !== targetTag) {
        brandStatusTag.textContent = targetTag;
      }
    }

  }

  let startTime = performance.now();

  // Respect the OS "reduce motion" setting: no cloud drift, no scroll easing.
  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduceMotion = reduceMotionQuery.matches;

  // The loop only runs while something is moving: scroll easing in progress,
  // or the hero (with its drifting clouds) on screen. Otherwise it sleeps
  // until the next scroll/resize, instead of burning every frame.
  let rafId = 0;
  function ensureLoop() {
    if (!rafId) rafId = requestAnimationFrame(render);
  }

  function render(now) {
    rafId = 0;
    const elapsed = now - startTime;

    // Smooth Lerp Interpolation matching Webflow smoothing: 75
    if (reduceMotion) {
      currentScrollY = targetScrollY;
    } else {
      currentScrollY += (targetScrollY - currentScrollY) * 0.075;
    }
    const settled = Math.abs(targetScrollY - currentScrollY) < 0.5;
    if (settled) currentScrollY = targetScrollY;

    // Occlusion Culling: If hero is completely scrolled off-screen, skip hero layer transforms
    let heroVisible = true;
    if (heroSection) {
      const heroRect = heroSection.getBoundingClientRect();
      if (heroRect.bottom <= 0) {
        heroVisible = false;
      }
    }

    if (heroVisible) {
      // Calibrate normalized scroll progress through sunset track (0.0 to 1.0)
      const scrollTrack = Math.max(heroHeight, winHeight);
      const scrollProgress = Math.max(0, Math.min(1.0, currentScrollY / scrollTrack));

      // 1. Animate Sun & Mountain Layers (Pure vertical translation matching Webflow a-6)
      for (let i = 0; i < mountainLayers.length; i++) {
        const item = mountainLayers[i];
        if (!item.el) continue;

        const translateY = scrollProgress * item.yFactor * 100;
        item.el.style.transform = `translate3d(0px, ${translateY.toFixed(3)}%, 0px)`;
      }

      // 2. Animate Cloud Layers (Horizontal Drift a-4 + Vertical Parallax a-6)
      for (let i = 0; i < cloudLayers.length; i++) {
        const cloud = cloudLayers[i];
        if (!cloud.el) continue;

        const driftPercent = reduceMotion ? 0 : Math.sin(elapsed * cloud.speed + cloud.phase) * cloud.xRange;
        const translateY = scrollProgress * cloud.yFactor * 100;

        cloud.el.style.transform = `translate3d(${driftPercent.toFixed(3)}%, ${translateY.toFixed(3)}%, 0px)`;
      }

      // 3. Animate Hero Text Overlay
      if (heroTextOverlay) {
        const textProgress = Math.min(1.0, currentScrollY / (winHeight * 0.55));
        const textOpacity = Math.max(0, 1 - textProgress * 1.4);
        const textTranslateY = -currentScrollY * 0.25;
        heroTextOverlay.style.opacity = textOpacity.toFixed(3);
        heroTextOverlay.style.transform = `translate3d(0px, ${textTranslateY.toFixed(1)}px, 0px)`;
      }
    }

    // Always update Dapper sticky state smoothly
    updateDapperSticky();

    // Keep going while easing, or while clouds are drifting on screen.
    if (!settled || (heroVisible && !reduceMotion)) ensureLoop();
  }

  window.addEventListener('scroll', ensureLoop, { passive: true });
  window.addEventListener('resize', ensureLoop, { passive: true });
  const onMotionPrefChange = (e) => { reduceMotion = e.matches; ensureLoop(); };
  if (reduceMotionQuery.addEventListener) {
    reduceMotionQuery.addEventListener('change', onMotionPrefChange);
  } else if (reduceMotionQuery.addListener) {
    reduceMotionQuery.addListener(onMotionPrefChange);
  }

  ensureLoop();

  // ----------------------------------------------------
  // 7. SCROLL REVEAL (IntersectionObserver)
  // ----------------------------------------------------
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = entry.target.getAttribute('data-delay') || 0;
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, delay);
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // Initial triggers
  updateDapperSticky();

  // ----------------------------------------------------
  // 8. PROGRESSIVE WEB APP (PWA) SERVICE WORKER
  // ----------------------------------------------------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);
        })
        .catch(err => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }
})();

