/* ──────────────────────────────────────────────────────────────────────
   Footer mesh-gradient background (canvas 2D) — v2
   - Palette: rosso mattone, terracotta, peach, cream
   - Sempre in loop (footer-only, costo trascurabile)
   - prefers-reduced-motion → animazione rallentata al 30%, non bloccata
   ────────────────────────────────────────────────────────────────────── */
(() => {
  const canvas = document.querySelector('.footer-mesh-bg');
  if (!canvas) { console.warn('[footer-mesh] canvas non trovato'); return; }
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const speedMul = reduce ? 0.3 : 1;

  // Palette v2 — warm editorial. Velocità ~5x rispetto alla v1.
  const blobs = [
    { color: 'rgba(196, 57, 29, 0.55)',   x: 0.15, y: 0.20, r: 0.55, sx:  0.00060, sy:  0.00090, px: 0.0, py: 0.0 },
    { color: 'rgba(228, 130, 90, 0.50)',  x: 0.75, y: 0.30, r: 0.60, sx: -0.00075, sy:  0.00050, px: 0.7, py: 0.3 },
    { color: 'rgba(245, 200, 170, 0.55)', x: 0.40, y: 0.80, r: 0.65, sx:  0.00045, sy: -0.00065, px: 1.4, py: 0.9 },
    { color: 'rgba(255, 245, 230, 0.45)', x: 0.85, y: 0.85, r: 0.50, sx: -0.00055, sy: -0.00045, px: 2.1, py: 1.5 },
  ];

  let w = 0, h = 0, t0 = performance.now();

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function draw(now) {
    const t = (now - t0) * speedMul;
    ctx.fillStyle = '#F5F3F0';
    ctx.fillRect(0, 0, w, h);

    ctx.globalCompositeOperation = 'multiply';
    const maxR = Math.max(w, h);
    for (const b of blobs) {
      const cx = (b.x + Math.sin(t * b.sx + b.px) * 0.25) * w;
      const cy = (b.y + Math.cos(t * b.sy + b.py) * 0.30) * h;
      const r = b.r * maxR;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      g.addColorStop(0, b.color);
      g.addColorStop(1, 'rgba(245, 243, 240, 0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = 'source-over';
    requestAnimationFrame(draw);
  }

  resize();
  window.addEventListener('resize', resize);

  // Aspetta il primo frame per assicurare layout pronto
  requestAnimationFrame((now) => {
    console.log('[footer-mesh] avvio loop, w/h:', w, h, 'reduce:', reduce);
    if (w === 0 || h === 0) resize();
    t0 = now;
    draw(now);
  });
})();
