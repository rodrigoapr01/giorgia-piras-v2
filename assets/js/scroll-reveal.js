/* ──────────────────────────────────────────────────────────────────────
   Scroll reveal + parallax decorativo
   - One-shot reveal su .reveal (IntersectionObserver, threshold 0.15,
     rootMargin -8% bottom così l'animazione parte poco prima del
     contatto col viewport).
   - Parallax leggero sui .parallax-num solo desktop ≥768px e con
     prefers-reduced-motion: no-preference.
   - Reduced motion → tutto immediatamente visibile, niente listener.
   ────────────────────────────────────────────────────────────────────── */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── 1. Reveal on scroll ────────────────────────────────────────────
  const targets = document.querySelectorAll('.reveal');

  if (targets.length && !reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target); // one-shot
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

    targets.forEach((el) => io.observe(el));

    // Sicurezza A: tutti gli elementi che al primo paint sono già nel
    // viewport (o quasi) vengono accesi subito così non vediamo "pagina
    // vuota" sopra la piega.
    requestAnimationFrame(() => {
      targets.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    });

    // Sicurezza B: dopo 2.5s, qualsiasi elemento ancora non rivelato
    // viene forzato visibile. Protegge da edge case in cui IO o rAF
    // non firano (tab background al load, browser bug, etc.) — meglio
    // un'animazione persa che una sezione invisibile.
    setTimeout(() => {
      targets.forEach((el) => {
        if (!el.classList.contains('is-visible')) {
          el.classList.add('is-visible');
          io.unobserve(el);
        }
      });
    }, 2500);
  } else {
    // Reduced motion o no IO → mostra tutto subito
    targets.forEach((el) => el.classList.add('is-visible'));
  }

  // ─── 2. Parallax leggero sui numeri giganti ─────────────────────────
  const parallaxNums = document.querySelectorAll('.parallax-num');
  if (parallaxNums.length && !reduce && window.innerWidth >= 768) {
    let ticking = false;

    const update = () => {
      parallaxNums.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        // ~30% più lento dello scroll, in direzione opposta per dare
        // profondità (numeri "fissi" nel layer di sfondo).
        const offset = center * -0.12;
        el.style.transform = `translate3d(0, ${offset}px, 0)`;
      });
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    // Primo frame, così il parallax è in posizione corretta anche se la
    // pagina è caricata già scrollata (anchor hash, ricaricamento...).
    update();
  }
})();
