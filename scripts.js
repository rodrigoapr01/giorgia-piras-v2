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

    /* Parte fuori schermo + invisibile: evita il "puntino orfano" al
       centro del viewport finché l'utente non muove il mouse (anche su
       dispositivi ibridi dove isTouch ritorna falso negativo). */
    let tx = -100, ty = -100;
    let cx = tx, cy = ty;
    const ease = 0.18;
    el.style.opacity = '0';
    let hasMoved = false;

    window.addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (!hasMoved) {
        /* Primo movimento reale: snap alla posizione corrente e rendi visibile */
        cx = tx; cy = ty;
        el.style.opacity = '';
        hasMoved = true;
      }
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

  /* ─── HERO LOAD ANIMATION (watermark + caption) ─── */
  loaded(() => {
    if (!window.gsap) return;
    const caption = $('.hero-caption__text');
    const watermark = $('.hero-watermark');
    if (reducedMotion) {
      if (caption) caption.style.opacity = '1';
      if (watermark) watermark.style.opacity = '0.88';
      return;
    }
    if (watermark) {
      gsap.set(watermark, { opacity: 0, y: -6 });
      gsap.to(watermark, { opacity: 0.88, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.4 });
    }
    if (caption) {
      gsap.set(caption, { opacity: 0, y: 8 });
      gsap.to(caption, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.7 });
    }
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

  /* ─── MACRO CALCULATOR — Mifflin-St Jeor + counter rAF ─── */
  (function initMacroCalc() {
    const root = document.querySelector('.macro-calc');
    if (!root) return;

    const state = {
      sesso: 'f',
      peso: 65,
      altezza: 165,
      eta: 30,
      attivita: 1.375,
      obiettivo: 1,
    };

    const outputs = {
      peso:    root.querySelector('[data-output="peso"]'),
      altezza: root.querySelector('[data-output="altezza"]'),
      eta:     root.querySelector('[data-output="eta"]'),
      kcal:    root.querySelector('[data-output="kcal"]'),
      prot:    root.querySelector('[data-output="prot"]'),
      carb:    root.querySelector('[data-output="carb"]'),
      fat:     root.querySelector('[data-output="fat"]'),
    };

    function compute() {
      const { sesso, peso, altezza, eta, attivita, obiettivo } = state;
      /* Mifflin-St Jeor */
      const bmr = sesso === 'f'
        ? 10 * peso + 6.25 * altezza - 5 * eta - 161
        : 10 * peso + 6.25 * altezza - 5 * eta + 5;
      const tdee = bmr * attivita;
      const kcal = Math.round(tdee * obiettivo);
      /* Split 25/50/25 (prot/carb/fat) in calorie → grammi */
      const prot = Math.round((kcal * 0.25) / 4);
      const carb = Math.round((kcal * 0.50) / 4);
      const fat  = Math.round((kcal * 0.25) / 9);
      return { kcal, prot, carb, fat };
    }

    function animateNumber(el, to, duration = 400) {
      if (!el) return;
      const from = parseInt(el.textContent.replace(/\D/g, ''), 10) || 0;
      if (from === to) return;
      if (reducedMotion) { el.textContent = to.toLocaleString('it-IT'); return; }
      const t0 = performance.now();
      function step(now) {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(from + (to - from) * eased).toLocaleString('it-IT');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    function update() {
      const { kcal, prot, carb, fat } = compute();
      animateNumber(outputs.kcal, kcal);
      animateNumber(outputs.prot, prot);
      animateNumber(outputs.carb, carb);
      animateNumber(outputs.fat, fat);
    }

    function updateSliderFill(slider) {
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const val = parseFloat(slider.value);
      const pct = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, #C4391D 0%, #C4391D ${pct}%, #222 ${pct}%, #222 100%)`;
    }

    /* Slider binding */
    root.querySelectorAll('.mc-slider').forEach(slider => {
      const key = slider.getAttribute('data-input');
      updateSliderFill(slider);
      slider.addEventListener('input', () => {
        const val = parseInt(slider.value, 10);
        state[key] = val;
        if (outputs[key]) outputs[key].textContent = val;
        updateSliderFill(slider);
        update();
      });
    });

    /* Pills binding */
    root.querySelectorAll('.mc-pills').forEach(group => {
      const key = group.getAttribute('data-group');
      group.addEventListener('click', (e) => {
        const btn = e.target.closest('.mc-pill');
        if (!btn) return;
        group.querySelectorAll('.mc-pill').forEach(p => p.classList.remove('is-active'));
        btn.classList.add('is-active');
        const raw = btn.getAttribute('data-value');
        const parsed = parseFloat(raw);
        state[key] = isNaN(parsed) ? raw : parsed;
        update();
      });
    });

    /* Primo render solo quando la sezione entra in viewport → counter è animato */
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) { update(); io.unobserve(e.target); }
        });
      }, { threshold: 0.2 });
      io.observe(root);
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

  /* ─── BEFORE/AFTER COMPARISON SLIDER (clip-path + rAF lerp) ─── */
  (() => {
    const container    = document.getElementById('comparisonContainer');
    const afterWrapper = document.getElementById('comparisonAfter');
    const handle       = document.getElementById('comparisonHandle');
    if (!container || !afterWrapper || !handle) return;

    let isDragging = false;
    let currentX   = 50;
    let targetX    = 50;
    let rafId      = null;

    const render = () => {
      currentX += (targetX - currentX) * 0.25;
      afterWrapper.style.clipPath = `inset(0 ${100 - currentX}% 0 0)`;
      handle.style.left           = currentX + '%';

      if (Math.abs(targetX - currentX) > 0.1) {
        rafId = requestAnimationFrame(render);
      } else {
        currentX = targetX;
        afterWrapper.style.clipPath = `inset(0 ${100 - currentX}% 0 0)`;
        handle.style.left           = currentX + '%';
        rafId = null;
      }
    };

    const updateTarget = (clientX) => {
      const rect = container.getBoundingClientRect();
      targetX = Math.min(Math.max(((clientX - rect.left) / rect.width) * 100, 0), 100);
      if (!rafId) rafId = requestAnimationFrame(render);
    };

    const startDrag = (clientX) => {
      isDragging = true;
      container.classList.add('is-dragging');
      updateTarget(clientX);
    };

    const stopDrag = () => {
      isDragging = false;
      container.classList.remove('is-dragging');
    };

    /* Mouse */
    container.addEventListener('mousedown', (e) => { startDrag(e.clientX); e.preventDefault(); });
    window.addEventListener('mousemove', (e) => { if (isDragging) updateTarget(e.clientX); });
    window.addEventListener('mouseup', stopDrag);
    container.addEventListener('mouseleave', stopDrag);

    /* Touch */
    container.addEventListener('touchstart', (e) => startDrag(e.touches[0].clientX), { passive: true });
    container.addEventListener('touchmove',  (e) => { if (isDragging) updateTarget(e.touches[0].clientX); }, { passive: true });
    container.addEventListener('touchend',   stopDrag);
  })();

  /* ─── TESTIMONIALS SHUFFLE STACK (drag to cycle, N cards) ─── */
  (function testimonialsShuffle() {
    const stack = document.getElementById('testimonialsStack');
    if (!stack) return;

    const cards = Array.from(stack.querySelectorAll('.testimonial-card'));
    if (cards.length < 3) return;

    /* Ordine logico: [front, middle, back, hidden, hidden, …] */
    let order = [...cards];

    const SWIPE_THRESHOLD = 150; /* px */
    const ROTATE_BASE     = -6;
    const POSITIONS       = ['front', 'middle', 'back'];

    let isDragging      = false;
    let startX          = 0;
    let deltaX          = 0;
    let activeCard      = null;
    let activePointerId = null;

    function applyPositions() {
      order.forEach((card, i) => {
        card.setAttribute('data-position', i < 3 ? POSITIONS[i] : 'hidden');
        card.style.transform = '';
        card.classList.remove('is-leaving');
      });
    }

    function shuffle() {
      const front = order.shift();
      order.push(front);
      applyPositions();
    }

    /* Reset robusto: qualsiasi cosa succeda, riportiamo lo stato a zero.
       Chiamata dai safety net (blur, visibilitychange, contextmenu, pointerleave). */
    function resetDragState() {
      if (activeCard) {
        activeCard.classList.remove('is-dragging');
        activeCard.style.transform = '';
        if (activePointerId !== null) {
          try { activeCard.releasePointerCapture(activePointerId); } catch (_) {}
        }
      }
      isDragging      = false;
      activeCard      = null;
      activePointerId = null;
      deltaX          = 0;
      startX          = 0;
    }

    function onPointerDown(e) {
      /* Solo bottone primario (0) — ignora tasto destro/centrale */
      if (e.button !== undefined && e.button !== 0) return;

      const target = e.target.closest('.testimonial-card');
      if (!target || target.getAttribute('data-position') !== 'front') return;

      isDragging      = true;
      activeCard      = target;
      activePointerId = e.pointerId;
      startX          = e.clientX;
      deltaX          = 0;

      activeCard.classList.add('is-dragging');
      try { activeCard.setPointerCapture(e.pointerId); } catch (_) {}
    }

    function onPointerMove(e) {
      if (!isDragging || !activeCard || e.pointerId !== activePointerId) return;
      deltaX = e.clientX - startX;
      const rotation = ROTATE_BASE + deltaX * 0.04;
      activeCard.style.transform = `translateX(${deltaX}px) rotate(${rotation}deg)`;
    }

    function onPointerUp(e) {
      if (!isDragging || !activeCard) return;
      /* Ignora pointer secondari diversi da quello attivo */
      if (e.pointerId !== undefined && e.pointerId !== activePointerId) return;

      /* Cattura riferimenti + stato locale PRIMA di resettare */
      const card       = activeCard;
      const pid        = activePointerId;
      const savedDelta = deltaX;

      /* Reset stato SUBITO, prima di qualsiasi altra operazione.
         Così anche se il setTimeout viene preempted da un'altra gesture,
         gli altri elementi della pagina ricevono già pointer events puliti. */
      isDragging      = false;
      activeCard      = null;
      activePointerId = null;
      deltaX          = 0;

      card.classList.remove('is-dragging');
      try { card.releasePointerCapture(pid); } catch (_) {}

      if (-savedDelta > SWIPE_THRESHOLD) {
        card.classList.add('is-leaving');
        card.style.transform = '';
        setTimeout(() => { shuffle(); }, 350);
      } else {
        card.style.transform = '';
      }
    }

    /* Safety net: qualsiasi evento "sporco" resetta lo stato */
    function onPointerCancel()   { resetDragState(); }
    function onWindowBlur()      { resetDragState(); }
    function onVisibilityChange(){ if (document.hidden) resetDragState(); }
    function onContextMenu()     { resetDragState(); }

    /* pointerdown solo sullo stack — non globale */
    stack.addEventListener('pointerdown', onPointerDown);

    /* move/up su window — necessari per tracciare drag oltre l'elemento */
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup',   onPointerUp);

    /* Safety net listeners */
    window.addEventListener('pointercancel', onPointerCancel);
    window.addEventListener('blur',          onWindowBlur);
    window.addEventListener('contextmenu',   onContextMenu);
    document.addEventListener('visibilitychange', onVisibilityChange);

    /* Puntatore esce dalla finestra del browser durante il drag → reset */
    document.addEventListener('pointerleave', (e) => {
      if (isDragging && e.target === document.documentElement) {
        resetDragState();
      }
    });

    applyPositions();
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
