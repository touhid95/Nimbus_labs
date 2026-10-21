/**
 * AI LABS BY NIMBUS - MASTER SCRIPT
 * Implements exact Webflow followUP.html Scenery Parallax & Cloud Animations
 */

(function () {
  'use strict';

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

    mobileDrawer.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileDrawer.classList.remove('active');
        menuBtn.setAttribute('aria-expanded', 'false');
        if (siteHeader) siteHeader.classList.remove('drawer-open');
      });
    });
  }

  // ----------------------------------------------------
  // 3. MASTER RENDER LOOP & DAPPER STICKY CONTROLLER
  // 5 Chapters: 01 FRONTIER -> 02 NEURAL -> 03 AGENTIC -> 04 COGNITION (Video) -> 05 NIMBUS
  // ----------------------------------------------------
  const dapperSection = document.getElementById('dapper');
  const dapperHeaderRail = document.getElementById('dapper-header-rail');
  const dapperProgBar = document.getElementById('dapper-progress-bar');
  const dapperChapInd = document.getElementById('dapper-chapter-indicator');
  const dapperLayer2 = document.getElementById('dapper-layer-2');
  const dapperLayer3 = document.getElementById('dapper-layer-3');
  const dapperLayer4 = document.getElementById('dapper-layer-4');
  const dapperLayer5 = document.getElementById('dapper-layer-5');
  const brandStatusTag = document.getElementById('brand-status-tag');
  const dapperHeaderWrapper = document.querySelector('.dapper-header-wrapper');
  const dapperControls = document.getElementById('cognition-controls');
  const dapperCaptionText = document.getElementById('dapper-caption-text');
  let currentCaptionIdx = -1;
  const chapterCaptions = [
    'DECENTRALIZED MULTI-AGENT SWARMS & MULTIMODAL REASONING ENGINES',
    'SUB-MILLISECOND INFERENCE ON HIGH-PERFORMANCE DISTRIBUTED GPU CLUSTERS',
    'AUTONOMOUS TASK DECOMPOSITION, TOOL SYNTHESIS & DYNAMIC MEMORY GRAPHS',
    'HIGH-DIMENSIONAL SPATIAL LATENTS, REASONING TRACES & SYNTHETIC PERCEPTION',
    'HYPER-SCALABLE FOUNDATIONAL INFRASTRUCTURE FOR ARTIFICIAL SUPERINTELLIGENCE'
  ];

  function updateDapperSticky() {
    if (!dapperSection) return;
    const rect = dapperSection.getBoundingClientRect();
    const totalScroll = dapperSection.offsetHeight - winHeight;
    if (totalScroll <= 0) return;

    // Normalized progress through the sticky section (0.0 to 1.0)
    const scrolled = -rect.top;
    const overallProgress = Math.max(0, Math.min(1.0, scrolled / totalScroll));

    // Progress across 5 slides (0.0 to 4.0)
    const chapterProgress = overallProgress * 4;

    // 1. Kinetic typography rail translation
    const slideHeight = dapperHeaderWrapper ? dapperHeaderWrapper.offsetHeight : (winHeight < 768 ? 80 : 160);
    const railY = -chapterProgress * slideHeight;
    if (dapperHeaderRail) {
      dapperHeaderRail.style.transform = `translate3d(0px, ${railY.toFixed(2)}px, 0px)`;
    }

    // 2. 5 difference color layers:
    // Chapter 2 (Rose) slides up (100% to 0%) between chapter 0 and 1
    const p2 = Math.max(0, Math.min(1, chapterProgress));
    if (dapperLayer2) {
      dapperLayer2.style.transform = `translate3d(0px, ${((1 - p2) * 100).toFixed(2)}%, 0px)`;
    }

    // Chapter 3 (Violet) slides up (100% to 0%) between chapter 1 and 2
    const p3 = Math.max(0, Math.min(1, chapterProgress - 1));
    if (dapperLayer3) {
      dapperLayer3.style.transform = `translate3d(0px, ${((1 - p3) * 100).toFixed(2)}%, 0px)`;
    }

    // Chapter 4 (White Difference + Video) slides up (100% to 0%) between chapter 2 and 3
    const p4 = Math.max(0, Math.min(1, chapterProgress - 2));
    if (dapperLayer4) {
      dapperLayer4.style.transform = `translate3d(0px, ${((1 - p4) * 100).toFixed(2)}%, 0px)`;
    }

    // Chapter 5 (Midnight NIMBUS) slides up (100% to 0%) between chapter 3 and 4
    const p5 = Math.max(0, Math.min(1, chapterProgress - 3));
    if (dapperLayer5) {
      dapperLayer5.style.transform = `translate3d(0px, ${((1 - p5) * 100).toFixed(2)}%, 0px)`;
    }

    // 3. Bottom progress bar: 20% to 100%
    if (dapperProgBar) {
      const barWidth = 20 + (overallProgress * 80);
      dapperProgBar.style.width = `${barWidth.toFixed(1)}%`;
    }

    // 4. Chapter indicator, brand tag, and HUD caption updates
    const activeIdx = Math.min(4, Math.floor(chapterProgress + 0.5));
    const chapterNames = ['FRONTIER', 'NEURAL', 'AGENTIC', 'COGNITION', 'NIMBUS'];

    if (dapperChapInd) {
      dapperChapInd.textContent = `CHAPTER 0${activeIdx + 1} / 05`;
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
      let targetTag = 'FRONTIER COGNITION';
      if (rect.top > 80) {
        targetTag = 'FRONTIER COGNITION';
      } else if (rect.bottom < 80) {
        targetTag = 'RESEARCH DOMAINS';
      } else {
        targetTag = `CHAPTER 0${activeIdx + 1} // ${chapterNames[activeIdx]}`;
      }
      if (brandStatusTag.textContent !== targetTag) {
        brandStatusTag.textContent = targetTag;
      }
    }

    // 5. Chapter 4 Video Activation & Controls Visibility
    if (chapterProgress >= 2.3 && chapterProgress < 3.7) {
      if (dapperControls) dapperControls.classList.add('is-visible');
      if (typeof window.__dapperTriggerVideoPlay === 'function') {
        window.__dapperTriggerVideoPlay();
      }
    } else {
      if (dapperControls) dapperControls.classList.remove('is-visible');
      if (typeof window.__dapperTriggerVideoPause === 'function') {
        window.__dapperTriggerVideoPause();
      }
    }
  }

  let startTime = performance.now();

  function render(now) {
    const elapsed = now - startTime;

    // Smooth Lerp Interpolation matching Webflow smoothing: 75
    currentScrollY += (targetScrollY - currentScrollY) * 0.075;

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

        const driftPercent = Math.sin(elapsed * cloud.speed + cloud.phase) * cloud.xRange;
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

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);

  // ----------------------------------------------------
  // 4. MOBILE NAVIGATION TOGGLE
  // ----------------------------------------------------
  const mobileBtn = document.getElementById('clay-menu-btn') || document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('clay-mobile-drawer') || document.getElementById('mobile-menu');

  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = mobileMenu.classList.toggle('active');
      mobileBtn.setAttribute('aria-expanded', String(open));
    });

    // Close when clicking nav links
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenu.contains(e.target) && !mobileBtn.contains(e.target)) {
        mobileMenu.classList.remove('active');
        mobileBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ----------------------------------------------------
  // 5. INTERACTIVE NIMBUS NEURAL ENGINE SIMULATOR
  // ----------------------------------------------------
  const concurrencySlider = document.getElementById('concurrency-slider');
  const concurrencyVal = document.getElementById('concurrency-val');
  const metricThroughput = document.getElementById('metric-throughput');
  const metricTTFT = document.getElementById('metric-ttft');
  const metricAcc = document.getElementById('metric-acc');
  const metricPower = document.getElementById('metric-power');
  const modelPills = document.querySelectorAll('.model-pills .pill');

  let currentModel = 'omni';

  const modelProfiles = {
    omni: { baseTokPerSec: 33.5, ttftBase: 14.2, acc: '99.4', power: '0.08' },
    reason: { baseTokPerSec: 54.0, ttftBase: 9.8, acc: '98.1', power: '0.04' },
    edge: { baseTokPerSec: 110.0, ttftBase: 4.5, acc: '93.7', power: '0.015' }
  };

  function updateSimulator() {
    const conc = parseInt(concurrencySlider ? concurrencySlider.value : 128, 10);
    if (concurrencyVal) {
      concurrencyVal.textContent = `${conc} Concurrent Agents`;
    }

    const prof = modelProfiles[currentModel];
    // Throughput scales with concurrency with slight saturation curve
    const efficiency = 1 - (conc / 2400);
    const totalTokens = Math.round(conc * prof.baseTokPerSec * efficiency);
    const ttft = (prof.ttftBase * (1 + (conc / 1200))).toFixed(1);

    if (metricThroughput) metricThroughput.innerHTML = `${totalTokens.toLocaleString()} <span class="unit">tok/s</span>`;
    if (metricTTFT) metricTTFT.innerHTML = `${ttft} <span class="unit">ms</span>`;
    if (metricAcc) metricAcc.innerHTML = `${prof.acc} <span class="unit">%</span>`;
    if (metricPower) metricPower.innerHTML = `${prof.power} <span class="unit">J/tok</span>`;
  }

  if (concurrencySlider) {
    concurrencySlider.addEventListener('input', updateSimulator);
  }

  modelPills.forEach(pill => {
    pill.addEventListener('click', () => {
      modelPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentModel = pill.getAttribute('data-model');
      updateSimulator();
    });
  });

  // ----------------------------------------------------
  // 6. MAGNETIC BUTTON INTERACTION (Desktop)
  // Matches followUP.html magnetic button behavior
  // ----------------------------------------------------
  const magneticWrap = document.getElementById('magnetic-btn-wrap');
  const magneticBtn = document.getElementById('footer-contact-btn');

  if (magneticWrap && magneticBtn && window.innerWidth > 991) {
    magneticWrap.addEventListener('mousemove', (e) => {
      const rect = magneticWrap.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);
      magneticBtn.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0px) scale(1.04)`;
    });

    magneticWrap.addEventListener('mouseleave', () => {
      magneticBtn.style.transform = `translate3d(0px, 0px, 0px) scale(1)`;
    });
  }

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

  // ----------------------------------------------------
  // 8. DAPPER CHAPTER 04 VIDEO CONTROLLER
  // Drives video playback inside Dapper White Difference Layer 4,
  // ambient audio, floating controls, and advance to Chapter 05 (Nimbus)
  // ----------------------------------------------------
  const cognitionVideo = document.getElementById('cognition-video');
  const pauseBtn = document.getElementById('cognition-pause-btn');
  const soundBtn = document.getElementById('cognition-sound-btn');
  const pauseBtnText = document.getElementById('pause-btn-text');
  const soundBtnText = document.getElementById('sound-btn-text');

  if (cognitionVideo && dapperLayer4) {
    let isVideoReady = false;
    let hasStartedOnce = false;

    // Helper: update Play/Pause UI
    function setPlayState(isPlaying) {
      const iconPause = pauseBtn ? pauseBtn.querySelector('.icon-pause') : null;
      const iconPlay = pauseBtn ? pauseBtn.querySelector('.icon-play') : null;
      if (iconPause && iconPlay) {
        iconPause.style.display = isPlaying ? 'block' : 'none';
        iconPlay.style.display = isPlaying ? 'none' : 'block';
      }
      if (pauseBtnText) {
        pauseBtnText.textContent = isPlaying ? 'Pause' : 'Resume';
      }
    }

    // Helper: update Sound UI
    function setSoundState(isSoundOn) {
      const iconSoundOn = soundBtn ? soundBtn.querySelector('.icon-sound-on') : null;
      const iconSoundOff = soundBtn ? soundBtn.querySelector('.icon-sound-off') : null;
      if (iconSoundOn && iconSoundOff) {
        iconSoundOn.style.display = isSoundOn ? 'block' : 'none';
        iconSoundOff.style.display = isSoundOn ? 'none' : 'block';
      }
      if (soundBtnText) {
        soundBtnText.textContent = isSoundOn ? 'Sound' : 'Muted';
      }
    }

    // Deferred preloading: buffer video as user approaches Dapper
    let preloaded = false;
    function triggerPreload() {
      if (preloaded) return;
      preloaded = true;
      cognitionVideo.preload = 'auto';
      cognitionVideo.load();
    }

    const dapperSentinel = document.getElementById('dapper');
    if (dapperSentinel && 'IntersectionObserver' in window) {
      const preloadObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            triggerPreload();
            preloadObserver.disconnect();
          }
        });
      }, { rootMargin: '200px' });
      preloadObserver.observe(dapperSentinel);
    }

    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) triggerPreload();
    }, { passive: true, once: true });

    // Video ready listeners
    function onVideoCanPlay() {
      isVideoReady = true;
    }
    cognitionVideo.addEventListener('canplay', onVideoCanPlay);
    cognitionVideo.addEventListener('canplaythrough', onVideoCanPlay);
    cognitionVideo.addEventListener('loadeddata', onVideoCanPlay);

    if (cognitionVideo.readyState >= 3) {
      isVideoReady = true;
    }

    // Trigger video playback when user enters Chapter 4 in Dapper
    window.__dapperTriggerVideoPlay = function() {
      if (!isVideoReady && cognitionVideo.readyState < 2) {
        triggerPreload();
      }
      dapperLayer4.classList.add('is-playing');

      if (!hasStartedOnce) {
        hasStartedOnce = true;
        cognitionVideo.muted = false;
        const playPromise = cognitionVideo.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            setSoundState(true);
            setPlayState(true);
          }).catch(() => {
            cognitionVideo.muted = true;
            cognitionVideo.play().then(() => {
              setSoundState(false);
              setPlayState(true);
            }).catch(() => {});
          });
        }
      } else if (cognitionVideo.paused && !cognitionVideo.ended) {
        cognitionVideo.play().then(() => setPlayState(true)).catch(() => {});
      }
    };

    // Pause video when user scrolls outside Chapter 4
    window.__dapperTriggerVideoPause = function() {
      if (!cognitionVideo.paused && !cognitionVideo.ended) {
        cognitionVideo.pause();
        setPlayState(false);
      }
    };

    // Controls: Pause / Play toggle
    if (pauseBtn) {
      pauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (cognitionVideo.paused) {
          cognitionVideo.play().then(() => setPlayState(true)).catch(() => {});
        } else {
          cognitionVideo.pause();
          setPlayState(false);
        }
      });
    }

    // Controls: Sound toggle
    if (soundBtn) {
      soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        cognitionVideo.muted = !cognitionVideo.muted;
        setSoundState(!cognitionVideo.muted);
      });
    }

    // Cinematographic Auto-Scroll to Chapter 05 (Nimbus)
    let autoScrollRaf = null;

    function cancelAutoScroll() {
      if (autoScrollRaf) {
        cancelAnimationFrame(autoScrollRaf);
        autoScrollRaf = null;
      }
      cleanupInterruptListeners();
    }

    let canInterrupt = false;
    function onInterrupt() {
      if (canInterrupt) {
        cancelAutoScroll();
      }
    }

    function onKeyInterrupt(e) {
      if (canInterrupt && ['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Space', 'Home', 'End'].includes(e.code)) {
        cancelAutoScroll();
      }
    }

    function attachInterruptListeners() {
      canInterrupt = false;
      setTimeout(() => { canInterrupt = true; }, 350);
      window.addEventListener('wheel', onInterrupt, { passive: true });
      window.addEventListener('touchmove', onInterrupt, { passive: true });
      window.addEventListener('keydown', onKeyInterrupt, { passive: true });
    }

    function cleanupInterruptListeners() {
      window.removeEventListener('wheel', onInterrupt);
      window.removeEventListener('touchmove', onInterrupt);
      window.removeEventListener('keydown', onKeyInterrupt);
    }

    // Advance to Chapter 05 (Nimbus) with 100% full scroll and easeInOutCubic curve
    function advanceToNimbus(duration = 1500) {
      if (!dapperSection) return;
      cancelAutoScroll();

      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const dapperTop = dapperSection.getBoundingClientRect().top + scrollY;
      const totalScroll = dapperSection.offsetHeight - winHeight;
      const targetScroll = dapperTop + totalScroll; // 100% pinned progression -> Chapter 5 NIMBUS fully centered
      const startScroll = scrollY;
      const distance = targetScroll - startScroll;

      if (Math.abs(distance) < 4) return;

      const startTime = performance.now();
      attachInterruptListeners();

      function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1.0, elapsed / duration);

        // Smooth ease-in-out cubic easing
        const ease = progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const currentY = startScroll + (distance * ease);
        window.scrollTo(0, currentY);
        targetScrollY = currentY;
        currentScrollY = currentY;

        if (progress < 1.0) {
          autoScrollRaf = requestAnimationFrame(step);
        } else {
          window.scrollTo(0, targetScroll);
          targetScrollY = targetScroll;
          currentScrollY = targetScroll;
          cleanupInterruptListeners();
          autoScrollRaf = null;
        }
      }

      autoScrollRaf = requestAnimationFrame(step);
    }

    // When video finishes: hold final frame for slight delay (500ms), then auto-scroll to 5th slide NIMBUS
    let hasAutoAdvanced = false;

    function handleVideoFinished() {
      if (hasAutoAdvanced) return;
      hasAutoAdvanced = true;
      setPlayState(false);
      setTimeout(() => {
        advanceToNimbus(1500);
      }, 500);
    }

    cognitionVideo.addEventListener('ended', handleVideoFinished);

    cognitionVideo.addEventListener('timeupdate', () => {
      if (cognitionVideo.duration && cognitionVideo.currentTime >= cognitionVideo.duration - 0.25) {
        handleVideoFinished();
      }
    });

    cognitionVideo.addEventListener('play', () => {
      if (cognitionVideo.currentTime < 1) {
        hasAutoAdvanced = false;
      }
    });
  }

  // Initial triggers
  updateSimulator();
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

