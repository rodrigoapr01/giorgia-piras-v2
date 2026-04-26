/* ──────────────────────────────────────────────────────────────────────
   Services carousel — dot indicator
   Su mobile: il track è scrollabile orizzontalmente con scroll-snap.
   IntersectionObserver sulle card (root = track) → la card con la
   massima frazione visibile diventa "attiva" e accende il dot relativo.
   Desktop ≥768px: i dots sono nascosti via CSS, l'IO continua a girare
   ma non ha effetto visivo.
   ────────────────────────────────────────────────────────────────────── */
(() => {
  const track = document.querySelector('.services-track');
  const dots = Array.from(document.querySelectorAll('.services-dots .dot'));
  if (!track || !dots.length) return;

  const cards = Array.from(track.querySelectorAll('.service-card'));
  if (!cards.length) return;

  // Track del rapporto visibilità per ogni card. Aggiornato ad ogni fire
  // dell'observer. Il dot attivo è sempre quello della card col valore più
  // alto, purché sopra una soglia minima (evita falsi positivi).
  const ratios = new Map();
  cards.forEach((c) => ratios.set(c, 0));

  const ACTIVE_MIN = 0.55;

  function refreshDots() {
    let bestCard = null;
    let bestRatio = 0;
    ratios.forEach((r, card) => {
      if (r > bestRatio) {
        bestRatio = r;
        bestCard = card;
      }
    });
    if (!bestCard || bestRatio < ACTIVE_MIN) return;
    const idx = cards.indexOf(bestCard);
    if (idx === -1) return;
    dots.forEach((d, i) => d.classList.toggle('active', i === idx));
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      ratios.set(entry.target, entry.intersectionRatio);
    });
    refreshDots();
  }, {
    root: track,
    // Soglie fitte = aggiornamenti fluidi durante lo swipe.
    threshold: [0, 0.25, 0.5, 0.6, 0.75, 0.9, 1],
  });

  cards.forEach((card) => io.observe(card));
})();
