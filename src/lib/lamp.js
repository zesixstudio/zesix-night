/**
 * The hanging lamp. ON by default (CSS). Pulling the cord turns it OFF:
 * the whole site flips to light mode, all content is hidden, and only
 * "Creative People Don't Work At Day Time / Please turn on the lamp" shows.
 * Pull again to restore night. State is NOT persisted — every page load
 * starts with the lamp ON.
 */
export function initLamp() {
  const lamp = document.querySelector('[data-lamp]');
  if (!lamp) return;
  const cord = lamp.querySelector('[data-lamp-cord]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  let on = true;
  const apply = () => {
    body.classList.toggle('lamp-off', !on);
    lamp.setAttribute('aria-pressed', String(on));
    if (cord) cord.setAttribute('aria-label', on ? 'Turn the lamp off' : 'Turn the lamp on');
    // move focus somewhere sane when content disappears / returns
    if (!on) document.querySelector('.blackout')?.setAttribute('tabindex', '-1');
  };
  apply();

  const toggle = () => {
    on = !on;
    if (!reduced) {
      lamp.classList.remove('is-tug');
      void lamp.offsetWidth;
      lamp.classList.add('is-tug');
    }
    apply();
  };

  // click anywhere on the cord / knob
  cord?.addEventListener('click', (e) => {
    e.preventDefault();
    toggle();
  });
  cord?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  });

  // "pull" gesture: drag the cord downward and release
  let startY = null;
  cord?.addEventListener('pointerdown', (e) => {
    startY = e.clientY;
    cord.setPointerCapture?.(e.pointerId);
    lamp.classList.add('is-pulling');
  });
  cord?.addEventListener('pointermove', (e) => {
    if (startY == null) return;
    const dy = Math.max(0, Math.min(e.clientY - startY, 46));
    lamp.style.setProperty('--pull', dy + 'px');
  });
  const endPull = (e) => {
    if (startY == null) return;
    const dy = e.clientY - startY;
    startY = null;
    lamp.classList.remove('is-pulling');
    lamp.style.removeProperty('--pull');
    if (dy > 22) toggle();
  };
  cord?.addEventListener('pointerup', endPull);
  cord?.addEventListener('pointercancel', () => {
    startY = null;
    lamp.classList.remove('is-pulling');
    lamp.style.removeProperty('--pull');
  });

  // a way out if someone gets stuck in the dark
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !on) toggle();
  });

  // phone / tablet: retract the lamp up + out of the way once the page scrolls
  const mq = window.matchMedia('(max-width: 1024px)');
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const stow = mq.matches && on && window.scrollY > 60;
      lamp.classList.toggle('lamp--stow', stow);
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  mq.addEventListener?.('change', onScroll);
  onScroll();
}
