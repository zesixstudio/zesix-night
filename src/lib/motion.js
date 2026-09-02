/**
 * Motion layer. Content is visible by default; JS only enhances.
 * Reveals use IntersectionObserver + CSS transitions with a hard failsafe.
 * GSAP is loaded lazily only where it earns its weight.
 */
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(pointer: coarse)').matches;

export function initMotion() {
  const html = document.documentElement;
  if (reduced) {
    html.classList.add('motion-off');
    return;
  }
  html.classList.add('js-anim');

  smoothScroll();
  revealObserver();
  magnetic();
  marquees();
  counters();
  tilt();

  setTimeout(() => html.classList.add('motion-done'), 2600);
  window.addEventListener('load', () => setTimeout(() => html.classList.add('motion-done'), 700));
}

async function smoothScroll() {
  if (coarse) return;
  try {
    const { default: Lenis } = await import('lenis');
    const lenis = new Lenis({ duration: 1.05, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    const raf = (t) => {
      lenis.raf(t);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    window.__lenis = lenis;
  } catch {
    /* native scroll */
  }
}

function revealObserver() {
  const els = document.querySelectorAll('[data-reveal], [data-reveal-child]');
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
  );
  els.forEach((el) => {
    const group = el.closest('[data-reveal-group]');
    if (group && el.hasAttribute('data-reveal-child')) {
      const sibs = [...group.querySelectorAll('[data-reveal-child]')];
      el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 10) * 65}ms`;
    }
    io.observe(el);
  });
}

async function magnetic() {
  const els = document.querySelectorAll('[data-magnetic]');
  if (!els.length || coarse) return;
  const { default: gsap } = await import('gsap');
  els.forEach((btn) => {
    const xTo = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3' });
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
    });
    btn.addEventListener('mouseleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}

function marquees() {
  document.querySelectorAll('[data-marquee]').forEach((el) => {
    // markup duplicates its own content; CSS animation handles the loop.
    el.dataset.marqueeReady = '1';
  });
}

function counters() {
  const els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const el = e.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.countSuffix || '';
        const start = performance.now();
        const dur = 1500;
        const tick = (now) => {
          const p = Math.min((now - start) / dur, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target + suffix;
        };
        requestAnimationFrame(tick);
        setTimeout(() => (el.textContent = target + suffix), dur + 400);
      });
    },
    { threshold: 0.6 },
  );
  els.forEach((el) => io.observe(el));
}

function tilt() {
  if (coarse) return;
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    const max = 6;
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${px * max}deg) rotateX(${-py * max}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
