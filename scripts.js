/* ════════════════════════════════════════════════════════════
   GIORGIA PIRAS V3.3 — Interactions
   GSAP (hero intro only) + Lenis via CDN
   Scroll-reveal animations removed for stability + performance.
   ════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = matchMedia('(hover: none), (pointer: coarse)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function loaded(fn) {
    if (document.readyState === 'complete') fn();
    else window.addEventListener('load', fn, { once: true });
  }

  /* ─── ROMA CLOCK ─── */
  (function clock() {
    const el = document.getElementById('clock');
    if (!el) return;
    function tick() {
      const now = new Date();
      const opts = { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Rome', hour12: false };
      try {
        const t = new Intl.DateTimeFormat('it-IT', opts).format(now);
        el.textContent = `Roma — ${t}`;
      } catch (_) {
        const h = String(now.getHours()).padStart(2, '0');
        const m = String(now.getMinutes()).padStart(2, '0');
        el.textContent = `Roma — ${h}:${m}`;
      }
    }
    tick();
    setInterval(tick, 30000);
  }());

  /* ─── CUSTOM CURSOR ─── */
  (function cursor() {
    if (isTouch) return;
    const el = $('.cursor');
    if (!el) return;

    document.documentElement.classList.add('cursor-ready');

    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;
    const ease = 0.18;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
    }, { passive: true });

    document.addEventListener('mouseleave', () => el.classList.add('is-hidden'));
    document.addEventListener('mouseenter', () => el.classList.remove('is-hidden'));

    function raf() {
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      el.style.transform = `translate3d(${cx - 24}px, ${cy - 24}px, 0)`;
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    $$('a, button, [data-cursor-hover]').forEach(n => {
      n.addEventListener('mouseenter', () => el.classList.add('is-hover'));
      n.addEventListener('mouseleave', () => el.classList.remove('is-hover'));
    });

    $$('[data-cursor-hide]').forEach(n => {
      n.addEventListener('mouseenter', () => el.classList.add('is-hidden'));
      n.addEventListener('mouseleave', () => el.classList.remove('is-hidden'));
    });
  }());

  /* ─── LENIS SMOOTH SCROLL ─── */
  let lenis = null;
  (function initLenis() {
    if (reducedMotion || !window.Lenis) return;
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      smoothTouch: false,
    });
    document.documentElement.classList.add('lenis-on');

    if (window.gsap) {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const href = a.getAttribute('href');
      if (href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72 });
    });
  }());

  /* ─── NAV SCROLL STATE ─── */
  (function navScroll() {
    const nav = $('#main-nav');
    if (!nav) return;
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }());

  /* ─── MOBILE MENU ─── */
  (function mobileMenu() {
    const toggle = $('.nav-toggle');
    const menu = $('#mobile-menu');
    if (!toggle || !menu) return;

    const close = () => {
      menu.classList.remove('is-open');
      menu.setAttribute('aria-hidden', 'true');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('menu-open');
      if (lenis) lenis.start();
    };
    const open = () => {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
      if (lenis) lenis.stop();
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });
    menu.addEventListener('click', (e) => { if (e.target.tagName === 'A') close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }());

  /* ─── TEXT VISIBILITY (scroll-reveal removed for stability/perf) ─── */
  // Legacy data-anim / data-split-words attributes are kept harmless in markup.
  // Force any residual inline styles back to visible on DOM ready, in case
  // any other code path (or cached state) tries to hide them.
  ready(() => {
    $$('[data-anim], [data-split-words]').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  });

  /* ─── HERO LOAD ANIMATIONS ─── */
  loaded(() => {
    if (!window.gsap) return;

    const heroEyebrow = $('.hero__eyebrow');
    const heroLines = $$('.hero__title-line');
    const heroDots = $$('.hero__title-dot');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroEyebrow && !reducedMotion) {
      gsap.set(heroEyebrow, { opacity: 0, y: 20 });
      tl.to(heroEyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.2);
    } else if (heroEyebrow) {
      heroEyebrow.style.opacity = '1';
    }

    if (heroLines.length && !reducedMotion) {
      gsap.set(heroLines, { opacity: 0, y: 40 });
      tl.to(heroLines, { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.4);
    } else if (heroLines.length) {
      heroLines.forEach(l => { l.style.opacity = '1'; });
    }

    if (heroDots.length && !reducedMotion) {
      gsap.set(heroDots, { opacity: 0 });
      tl.to(heroDots, { opacity: 1, duration: 0.4, stagger: 0.08 }, 0.9);
    }

    // Ensure no residual transform on final state (don't regress)
    tl.set([heroEyebrow, ...heroLines, ...heroDots].filter(Boolean), {
      clearProps: 'transform',
      opacity: 1,
    });
  });

  /* ─── CIRCLE CTA RIPPLE ─── */
  (function ctaRipple() {
    $$('.circle-cta').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const rect = btn.getBoundingClientRect();
        const r = document.createElement('span');
        r.className = 'ripple';
        const size = 80;
        r.style.width = r.style.height = `${size}px`;
        r.style.left = `${e.clientX - rect.left - size / 2}px`;
        r.style.top = `${e.clientY - rect.top - size / 2}px`;
        btn.appendChild(r);
        setTimeout(() => r.remove(), 700);
      });
    });
  }());

  /* ─── MACRO CALCULATOR ─── */
  (function macroCalc() {
    const form = $('#calc-form');
    if (!form) return;

    const state = {
      gender: 'F', weight: 65, height: 165, age: 28, activity: 1.375, goal: 'maintain',
    };

    function calc() {
      const { gender, weight, height, age, activity, goal } = state;
      const bmr = 10 * weight + 6.25 * height - 5 * age + (gender === 'M' ? 5 : -161);
      const tdee = bmr * activity;
      const kcal = Math.round(goal === 'cut' ? tdee - 350 : goal === 'bulk' ? tdee + 300 : tdee);
      const prot = Math.round(goal === 'bulk' ? weight * 2.2 : goal === 'cut' ? weight * 2 : weight * 1.8);
      const fat  = Math.round(goal === 'cut' ? weight * 0.8 : weight * 1.0);
      const carb = Math.max(0, Math.round((kcal - prot * 4 - fat * 9) / 4));
      return { kcal, prot, fat, carb };
    }

    function animateNum(id, target) {
      const el = document.getElementById(id);
      if (!el) return;
      if (reducedMotion) { el.textContent = target; return; }
      const start = parseFloat(el.textContent) || 0;
      const duration = 600;
      const t0 = performance.now();
      function step(now) {
        const t = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function updateFill(input) {
      const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty('--fill', `${pct}%`);
    }

    function update() {
      const { kcal, prot, fat, carb } = calc();
      animateNum('mc-kcal', kcal);
      animateNum('mc-prot', prot);
      animateNum('mc-fat',  fat);
      animateNum('mc-carb', carb);
    }

    $$('[data-mc]', form).forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.mc;
        $$(`[data-mc="${group}"]`, form).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state[group] = group === 'activity' ? parseFloat(btn.dataset.val) : btn.dataset.val;
        update();
      });
    });

    [
      ['mc-weight', 'weight', 'mc-weight-val', 'kg'],
      ['mc-height', 'height', 'mc-height-val', 'cm'],
      ['mc-age',    'age',    'mc-age-val',    'anni'],
    ].forEach(([id, key, dispId, unit]) => {
      const input = document.getElementById(id);
      const disp = document.getElementById(dispId);
      if (!input) return;
      updateFill(input);
      input.addEventListener('input', () => {
        state[key] = parseInt(input.value, 10);
        disp.textContent = `${input.value} ${unit}`;
        updateFill(input);
        update();
      });
    });

    const section = $('#calcolatore');
    if (section && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { update(); io.unobserve(e.target); }
        });
      }, { threshold: 0.2 });
      io.observe(section);
    } else {
      update();
    }
  }());

  /* ─── COOKIE BANNER ─── */
  (function cookieBanner() {
    const banner = $('#cookie-banner');
    const btn = $('#cookie-accept');
    if (!banner || !btn) return;

    const KEY = 'gp3_cookie_ok';
    try { if (localStorage.getItem(KEY) === '1') return; } catch (_) {}

    setTimeout(() => {
      banner.hidden = false;
      requestAnimationFrame(() => banner.classList.add('is-visible'));
    }, 2000);

    btn.addEventListener('click', () => {
      banner.classList.remove('is-visible');
      setTimeout(() => { banner.hidden = true; }, 500);
      try { localStorage.setItem(KEY, '1'); } catch (_) {}
    });
  }());

  /* ─── BEFORE/AFTER COMPARISON SLIDER ─── */
  (function comparison() {
    const container = document.getElementById('comparisonContainer');
    const slider    = document.getElementById('comparisonSlider');
    if (!container || !slider) return;
    const afterDiv  = container.querySelector('.comparison__after');
    if (!afterDiv) return;

    let dragging = false;

    const setPos = (clientX) => {
      const rect = container.getBoundingClientRect();
      const pct  = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100));
      slider.style.left    = pct + '%';
      afterDiv.style.width = pct + '%';
    };

    // Mouse
    container.addEventListener('mousedown', (e) => {
      dragging = true;
      setPos(e.clientX);
      e.preventDefault();
    });
    window.addEventListener('mousemove', (e) => { if (dragging) setPos(e.clientX); });
    window.addEventListener('mouseup',   () => { dragging = false; });

    // Touch
    container.addEventListener('touchstart', (e) => {
      dragging = true;
      setPos(e.touches[0].clientX);
    }, { passive: true });
    container.addEventListener('touchmove', (e) => {
      if (dragging) setPos(e.touches[0].clientX);
    }, { passive: true });
    container.addEventListener('touchend', () => { dragging = false; });

    // Keyboard a11y
    container.tabIndex = 0;
    container.addEventListener('keydown', (e) => {
      const rect = container.getBoundingClientRect();
      const current = parseFloat(afterDiv.style.width) || 50;
      if (e.key === 'ArrowLeft')  setPos(rect.left + rect.width * Math.max(0,   current - 5) / 100);
      if (e.key === 'ArrowRight') setPos(rect.left + rect.width * Math.min(100, current + 5) / 100);
      if (e.key === 'Home')       setPos(rect.left);
      if (e.key === 'End')        setPos(rect.left + rect.width);
    });
  }());

  /* ─── VIDEO: pause offscreen for perf ─── */
  (function videoPerf() {
    if (!('IntersectionObserver' in window)) return;
    $$('.chi-sono-video').forEach(v => {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        });
      }, { threshold: 0.1 });
      io.observe(v);
    });
  }());

})();
