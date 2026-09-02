/**
 * Per-page animated artwork. Canvas scenes only (the SVG ones are markup + CSS
 * inside the pages). Everything is gated by prefers-reduced-motion and by an
 * IntersectionObserver so it never runs off-screen.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initArtwork() {
  if (reduced) return;
  document.querySelectorAll('canvas[data-artwork]').forEach((cv) => {
    const kind = cv.dataset.artwork;
    if (kind === 'beam') beam(cv);
    if (kind === 'constellation') constellation(cv);
  });
}

function fit(cv) {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const r = cv.getBoundingClientRect();
  cv.width = Math.max(1, r.width * dpr);
  cv.height = Math.max(1, r.height * dpr);
  const ctx = cv.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: r.width, h: r.height };
}

function runWhenVisible(cv, frame) {
  let running = false;
  let raf = 0;
  const loop = (t) => {
    frame(t);
    raf = requestAnimationFrame(loop);
  };
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => {
      if (e.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!e.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
  });
  io.observe(cv);
}

/* Home: dust drifting upward through the lamp beam. */
function beam(cv) {
  let { ctx, w, h } = fit(cv);
  addEventListener('resize', () => ({ ctx, w, h } = fit(cv)), { passive: true });
  const N = Math.min(90, Math.round(w / 12));
  const P = Array.from({ length: N }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.6 + 0.3,
    s: Math.random() * 0.25 + 0.05,
    a: Math.random() * 0.5 + 0.1,
    d: Math.random() * Math.PI * 2,
  }));
  runWhenVisible(cv, () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of P) {
      p.y -= p.s;
      p.x += Math.sin((p.d += 0.01)) * 0.15;
      if (p.y < -4) {
        p.y = h + 4;
        p.x = Math.random() * w;
      }
      const beamX = w * 0.5;
      const spread = 0.18 + (p.y / h) * 0.5;
      const inBeam = Math.abs(p.x - beamX) < w * spread;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(185,220,244,${inBeam ? p.a : p.a * 0.25})`;
      ctx.fill();
    }
  });
}

/* About: slowly drifting node field with proximity links. */
function constellation(cv) {
  let { ctx, w, h } = fit(cv);
  addEventListener('resize', () => ({ ctx, w, h } = fit(cv)), { passive: true });
  const N = Math.min(46, Math.round((w * h) / 16000));
  const P = Array.from({ length: N }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
  }));
  runWhenVisible(cv, () => {
    ctx.clearRect(0, 0, w, h);
    for (const p of P) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;
    }
    for (let i = 0; i < P.length; i++) {
      for (let j = i + 1; j < P.length; j++) {
        const dx = P[i].x - P[j].x,
          dy = P[i].y - P[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(P[i].x, P[i].y);
          ctx.lineTo(P[j].x, P[j].y);
          ctx.strokeStyle = `rgba(136,190,230,${0.12 * (1 - dist / 120)})`;
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(P[i].x, P[i].y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(185,220,244,0.7)';
      ctx.fill();
    }
  });
}
