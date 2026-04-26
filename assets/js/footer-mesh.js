/* ──────────────────────────────────────────────────────────────────────
   Footer mesh-gradient background (canvas 2D)
   - Palette v2: rosso mattone, terracotta, peach, cream
   - Battery-friendly: animates only while footer intersects viewport
   - prefers-reduced-motion → un singolo frame statico
   ────────────────────────────────────────────────────────────────────── */
(() => {
  const canvas = document.querySelector('.footer-mesh-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  // Palette v2 — warm editorial
  const blobs = [
    { color: 'rgba(196, 57, 29, 0.55)',   x: 0.15, y: 0.20, r: 0.55, sx:  0.00012, sy:  0.00018, px: 0.0, py: 0.0 }, // rosso mattone
    { color: 'rgba(228, 130, 90, 0.50)',  x: 0.75, y: 0.30, r: 0.60, sx: -0.00015, sy:  0.00010, px: 0.7, py: 0.3 }, // terracotta
    { color: 'rgba(245, 200, 170, 0.55)', x: 0.40, y: 0.80, r: 0.65, sx:  0.00009, sy: -0.00013, px: 1.4, py: 0.9 }, // peach
    { color: 'rgba(255, 245, 230, 0.45)', x: 0.85, y: 0.85, r: 0.50, sx: -0.00011, sy: -0.00009, px: 2.1, py: 1.5 }, // cream
  ];

  let w = 0;
  let h = 0;
  let t0 = performance.now();
  let running = false;
  let rafId = null;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = rect.width;
    h = rect.height;
    if (w === 0 || h === 0) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(now) {
    if (w === 0 || h === 0) {
      if (running) rafId = requestAnimationFrame(draw);
      return;
    }
    const t = now - t0;

    // Base off-white che combacia con --bg (#F5F1E8) — niente "linea" dove
    // il footer incontra la sezione precedente.
    ctx.fillStyle = '#F5F1E8';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'multiply';
    const maxR = Math.max(w, h);
    for (const b of blobs) {
      const cx = (b.x + Math.sin(t * b.sx + b.px) * 0.18) * w;
      const cy = (b.y + Math.cos(t * b.sy + b.py) * 0.22) * h;
      const r = b.r * maxR;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, b.color);
      g.addColorStop(1, 'rgba(245, 241, 232, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = 'source-over';

    if (running) rafId = requestAnimationFrame(draw);
  }

  function start() {
    if (running) return;
    running = true;
    t0 = performance.now();
    rafId = requestAnimationFrame(draw);
  }

  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Reduced motion → un solo frame statico (niente loop)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Resize handling — debounced via rAF
  let resizeRaf = null;
  function onResize() {
    if (resizeRaf) cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => {
      resize();
      if (!running && !reduce) draw(performance.now());
      else if (reduce) draw(performance.now());
    });
  }

  resize();
  window.addEventListener('resize', onResize, { passive: true });

  if (reduce) {
    // Disegna un frame e basta.
    draw(performance.now());
    return;
  }

  // Avvia il rAF solo quando il footer è in vista — battery-friendly.
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => (e.isIntersecting ? start() : stop()));
    }, { threshold: 0.05 });
    io.observe(canvas);
  } else {
    // Fallback: avvia subito.
    start();
  }

  // Pause quando la tab non è visibile (extra battery saver)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
    else if (canvas.getBoundingClientRect().top < window.innerHeight) start();
  });
})();
