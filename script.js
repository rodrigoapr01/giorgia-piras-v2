/* ════════════════════════════════════════════════════════════
   GIORGIA PIRAS V2 — Interactions
   Vanilla JS · zero dependencies
   ════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── NAV: scrolled state ─── */
  (function navScroll() {
    const nav = $('#main-nav');
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
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
    };
    const open = () => {
      menu.classList.add('is-open');
      menu.setAttribute('aria-hidden', 'false');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.classList.add('menu-open');
    };

    toggle.addEventListener('click', () => {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });

    menu.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') close();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
  }());

  /* ─── SCROLL REVEAL ─── */
  (function reveal() {
    const items = $$('.reveal:not(.hero .reveal)');
    if (!items.length || !('IntersectionObserver' in window) || prefersReduced) {
      items.forEach(el => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });
    items.forEach(el => io.observe(el));
  }());

  /* ─── MACRO CALCULATOR ─── */
  (function macroCalc() {
    const form = $('#calc-form');
    if (!form) return;

    const state = {
      gender: 'F',
      weight: 65,
      height: 165,
      age: 28,
      activity: 1.375,
      goal: 'maintain',
    };

    function calcMacros() {
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
      if (prefersReduced) { el.textContent = target; return; }

      const start = parseFloat(el.textContent) || 0;
      const duration = 550;
      const startTime = performance.now();

      function frame(now) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(start + (target - start) * eased);
        if (t < 1) requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }

    function updateFill(input) {
      const pct = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty('--fill', `${pct}%`);
    }

    function update() {
      const { kcal, prot, fat, carb } = calcMacros();
      animateNum('mc-kcal', kcal);
      animateNum('mc-prot', prot);
      animateNum('mc-fat',  fat);
      animateNum('mc-carb', carb);
    }

    // Pills
    $$('[data-mc]', form).forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.dataset.mc;
        $$(`[data-mc="${group}"]`, form).forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state[group] = group === 'activity' ? parseFloat(btn.dataset.val) : btn.dataset.val;
        update();
      });
    });

    // Sliders
    [
      ['mc-weight', 'weight', 'mc-weight-val', 'kg'],
      ['mc-height', 'height', 'mc-height-val', 'cm'],
      ['mc-age',    'age',    'mc-age-val',    'anni'],
    ].forEach(([id, key, dispId, unit]) => {
      const input = document.getElementById(id);
      const disp  = document.getElementById(dispId);
      if (!input) return;
      updateFill(input);
      input.addEventListener('input', () => {
        state[key] = parseInt(input.value, 10);
        disp.textContent = `${input.value} ${unit}`;
        updateFill(input);
        update();
      });
    });

    // Run once when calc section enters viewport (or immediately if no IO)
    const section = $('#calcolatore');
    if (section && 'IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { update(); io.unobserve(e.target); }
        });
      }, { threshold: 0.25 });
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

    const KEY = 'gp2_cookie_ok';
    try {
      if (localStorage.getItem(KEY) === '1') return;
    } catch (_) { /* storage blocked — still show, dismiss will only hide */ }

    banner.hidden = false;
    requestAnimationFrame(() => banner.classList.add('is-visible'));

    btn.addEventListener('click', () => {
      banner.classList.remove('is-visible');
      setTimeout(() => { banner.hidden = true; }, 500);
      try { localStorage.setItem(KEY, '1'); } catch (_) {}
    });
  }());

  /* ─── HERO VIDEO: pause when offscreen (perf) ─── */
  (function heroVideoPerf() {
    const video = $('.hero-video');
    if (!video || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    }, { threshold: 0.1 });
    io.observe(video);
  }());

})();
