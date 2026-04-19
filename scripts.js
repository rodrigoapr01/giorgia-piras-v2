/* ════════════════════════════════════════════════════════════
   GIORGIA PIRAS V3 — Editorial · Interactions
   GSAP + ScrollTrigger + Lenis via CDN
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

  /* ─── SPLIT TEXT HELPERS ─── */
  function splitIntoWords(el) {
    if (!el || el.dataset.splitDone) return [];
    const text = el.textContent;
    el.textContent = '';
    const words = text.split(/(\s+)/);
    const nodes = [];
    words.forEach(tok => {
      if (/^\s+$/.test(tok)) {
        el.appendChild(document.createTextNode(' '));
      } else {
        const wrap = document.createElement('span');
        wrap.className = 'word-mask';
        wrap.style.display = 'inline-block';
        wrap.style.overflow = 'hidden';
        wrap.style.verticalAlign = 'bottom';
        const word = document.createElement('span');
        word.className = 'word';
        word.textContent = tok;
        wrap.appendChild(word);
        el.appendChild(wrap);
        nodes.push(word);
      }
    });
    el.dataset.splitDone = '1';
    return nodes;
  }

  function splitIntoLetters(el) {
    if (!el || el.dataset.splitDone) return [];
    const text = el.textContent;
    el.textContent = '';
    const chars = [];
    [...text].forEach(ch => {
      if (ch === ' ') {
        el.appendChild(document.createTextNode(' '));
        return;
      }
      const wrap = document.createElement('span');
      wrap.className = 'char-mask';
      wrap.style.display = 'inline-block';
      wrap.style.overflow = 'hidden';
      wrap.style.verticalAlign = 'bottom';
      const c = document.createElement('span');
      c.className = 'char';
      c.textContent = ch;
      wrap.appendChild(c);
      el.appendChild(wrap);
      chars.push(c);
    });
    el.dataset.splitDone = '1';
    return chars;
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

    // hover states
    function bind(selector) {
      $$(selector).forEach(n => {
        n.addEventListener('mouseenter', () => el.classList.add('is-hover'));
        n.addEventListener('mouseleave', () => el.classList.remove('is-hover'));
      });
    }
    bind('a, button, [data-cursor-hover]');

    // Hide cursor over circular CTAs (they have their own visual)
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

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    if (window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }

    // anchor links
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

  /* ─── GSAP SCROLL ANIMATIONS ─── */
  ready(() => {
    if (!window.gsap || !window.ScrollTrigger) {
      // Graceful fallback: show everything
      $$('[data-anim]').forEach(el => el.classList.add('is-in'));
      $$('.reveal-image').forEach(el => el.classList.add('is-in'));
      $$('[data-split-words]').forEach(splitIntoWords);
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // Split titles into words, wrap in masks
    $$('[data-split-words]').forEach(el => {
      const words = splitIntoWords(el);
      if (!words.length) return;
      gsap.set(words, { yPercent: 110, opacity: 1 });

      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => {
          gsap.to(words, {
            yPercent: 0,
            duration: 0.9,
            ease: 'power3.out',
            stagger: 0.08,
          });
        }
      });
    });

    // Hero tagline words (already split in HTML) — lift on load
    const heroWords = $$('.hero-tagline .word');
    const heroDot = $('.hero-tagline .dot-accent');
    const heroLines = $$('.hero-tagline .line');
    if (heroLines.length) heroLines.forEach(l => l.style.overflow = 'hidden');
    if (heroWords.length && !reducedMotion) {
      gsap.set(heroWords, { yPercent: 110 });
      if (heroDot) gsap.set(heroDot, { scale: 0, transformOrigin: 'left bottom' });
    }

    // Data-anim generic fades (exclude hero items)
    $$('[data-anim]').forEach(el => {
      const inHero = el.closest('.hero');
      if (inHero) return;
      const dir = el.dataset.anim;
      const from = {
        opacity: 0,
        y: dir === 'fade-down' ? -16 : 24,
      };
      gsap.set(el, from);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: () => {
          gsap.to(el, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out', delay: 0.05 });
          el.classList.add('is-in');
        }
      });
    });

    // Image reveal (clip-path) — handled via CSS transition + .is-in class
    $$('.reveal-image').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => el.classList.add('is-in'),
      });
    });

    // Service numbers scale-in + card body fade
    $$('.servizio-card').forEach(card => {
      const num = card.querySelector('.servizio-num');
      const line = card.querySelector('.servizio-line');
      const rest = card.querySelectorAll('.servizio-title, .servizio-desc, .link-underline');
      gsap.set(num, { opacity: 0, scale: 0.7 });
      gsap.set(line, { scaleX: 0, transformOrigin: 'left' });
      gsap.set(rest, { opacity: 0, y: 20 });

      ScrollTrigger.create({
        trigger: card,
        start: 'top 82%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(num, { opacity: 1, scale: 1, duration: 1, ease: 'power3.out' })
            .to(line, { scaleX: 1, duration: 0.8, ease: 'power3.inOut' }, '-=0.55')
            .to(rest, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }, '-=0.5');
        }
      });
    });

    // Step numbers + text
    $$('.step').forEach((step, i) => {
      const num = step.querySelector('.step-num');
      const title = step.querySelector('.step-title');
      const desc = step.querySelector('.step-desc');
      const conn = step.querySelector('.step-connector');
      gsap.set(num, { opacity: 0, y: 30 });
      gsap.set([title, desc], { opacity: 0, y: 18 });
      if (conn) gsap.set(conn, { scaleX: 0, transformOrigin: 'left' });

      ScrollTrigger.create({
        trigger: step,
        start: 'top 88%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline();
          tl.to(num, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' })
            .to([title, desc], { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.08 }, '-=0.35');
          if (conn) tl.to(conn, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, '-=0.3');
        }
      });
    });

    // Test cards fade
    $$('.test-card').forEach((card, i) => {
      gsap.set(card, { opacity: 0, y: 30 });
      ScrollTrigger.create({
        trigger: card,
        start: 'top 88%',
        once: true,
        onEnter: () => gsap.to(card, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: i * 0.08 })
      });
    });

    // Trasformation cards
    $$('.trasf-card').forEach((card, i) => {
      const meta = card.querySelector('.trasf-meta');
      if (!meta) return;
      gsap.set(meta, { opacity: 0, y: 20 });
      ScrollTrigger.create({
        trigger: card,
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(meta, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.25 + i * 0.1 })
      });
    });

    // Weal services list stagger
    const wealServices = $$('.weal-services li');
    if (wealServices.length) {
      gsap.set(wealServices, { opacity: 0, y: 14 });
      ScrollTrigger.create({
        trigger: '.weal-services',
        start: 'top 85%',
        once: true,
        onEnter: () => gsap.to(wealServices, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', stagger: 0.06 })
      });
    }

    // HERO NAME — letter entrance + scroll parallax
    const nameEl = $('.hero-name');
    if (nameEl) {
      const chars = splitIntoLetters(nameEl);
      if (!reducedMotion && chars.length) {
        gsap.set(chars, { yPercent: 110 });
      }
    }
  });

  /* ─── HERO LOAD ANIMATIONS ─── */
  loaded(() => {
    if (!window.gsap) return;

    const heroWords = $$('.hero-tagline .word');
    const heroDot = $('.hero-tagline .dot-accent');
    const heroEyebrow = $('.hero-eyebrow');
    const heroPills = $$('.hero-top .pill');
    const heroCTA = $('.hero-circle-cta');
    const nameChars = $$('.hero-name .char');

    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

    // Pills tiny fade
    if (heroPills.length) {
      gsap.set(heroPills, { opacity: 0, y: -12 });
      tl.to(heroPills, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.2);
    }

    // Eyebrow
    if (heroEyebrow && !reducedMotion) {
      gsap.set(heroEyebrow, { opacity: 0, y: 20 });
      tl.to(heroEyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.4);
    } else if (heroEyebrow) {
      heroEyebrow.style.opacity = '1';
    }

    // Tagline words
    if (heroWords.length && !reducedMotion) {
      tl.to(heroWords, {
        yPercent: 0,
        duration: 0.9,
        stagger: 0.08,
      }, 0.55);
    }

    // Accent dot pop
    if (heroDot && !reducedMotion) {
      tl.to(heroDot, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, 1.1);
    }

    // CTA
    if (heroCTA && !reducedMotion) {
      gsap.set(heroCTA, { opacity: 0, scale: 0.85 });
      tl.to(heroCTA, { opacity: 1, scale: 1, duration: 0.9 }, 1.0);
    }

    // Hero name — letters one by one from below
    if (nameChars.length && !reducedMotion) {
      tl.to(nameChars, {
        yPercent: 0,
        duration: 0.8,
        stagger: 0.035,
      }, 0.8);
    } else if (nameChars.length) {
      gsap.set(nameChars, { yPercent: 0 });
    }

    // Scroll parallax for hero name — moves SLOWER than scroll (x-offset horizontally on scroll)
    if (window.ScrollTrigger && !reducedMotion) {
      gsap.to('.hero-name', {
        xPercent: -3,
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        }
      });
    }

    // Refresh ScrollTrigger once everything settles
    if (window.ScrollTrigger) ScrollTrigger.refresh();
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

  /* ─── SERVIZI HOVER REVEAL ─── */
  (function serviziHover() {
    if (isTouch) return;
    const grid = $('#servizi-grid');
    if (!grid) return;

    const images = $$('.servizio-img', grid);
    let active = null;
    let tx = 0, ty = 0;
    let cx = 0, cy = 0;
    let rafId = null;

    function loop() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      if (active) {
        active.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      }
      rafId = requestAnimationFrame(loop);
    }

    function onMove(e) {
      tx = e.clientX - 190;
      ty = e.clientY - 240;
      if (!rafId) loop();
    }

    $$('.servizio-card', grid).forEach(card => {
      const img = card.querySelector('.servizio-img');

      card.addEventListener('mouseenter', () => {
        images.forEach(i => i.classList.remove('servizio-img--active'));
        img.classList.add('servizio-img--active');
        active = img;
        grid.classList.add('is-hovering');
      });
      card.addEventListener('mouseleave', () => {
        img.classList.remove('servizio-img--active');
        grid.classList.remove('is-hovering');
        active = null;
        cancelAnimationFrame(rafId);
        rafId = null;
      });
    });

    window.addEventListener('mousemove', onMove, { passive: true });
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

  /* ─── HERO VIDEO pause offscreen ─── */
  (function videoPerf() {
    if (!('IntersectionObserver' in window)) return;
    $$('.hero-video, .video-ambient-media').forEach(v => {
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
