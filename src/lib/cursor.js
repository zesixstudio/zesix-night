/**
 * Custom cursor: a small blue dot + a trailing ring that scales on hover over
 * interactive targets and shows a contextual label ("VIEW", "DRAG", "PLAY").
 * Disabled on touch / coarse pointers and when reduced motion is requested.
 */
export function initCursor() {
  const fine = window.matchMedia('(pointer: fine)').matches;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!fine || reduced) return;

  const root = document.createElement('div');
  root.className = 'cursor';
  root.innerHTML = `
    <div class="cursor__ring"><span class="cursor__label"></span></div>
    <div class="cursor__dot"></div>`;
  document.body.appendChild(root);
  document.documentElement.classList.add('has-cursor');

  const ring = root.querySelector('.cursor__ring');
  const dot = root.querySelector('.cursor__dot');
  const label = root.querySelector('.cursor__label');

  let x = innerWidth / 2,
    y = innerHeight / 2;
  let rx = x,
    ry = y;

  addEventListener(
    'mousemove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.transform = `translate(${x}px, ${y}px)`;
    },
    { passive: true },
  );

  const loop = () => {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  const HOVER = 'a, button, [data-cursor], input, textarea, select, .chip, summary';
  addEventListener(
    'mouseover',
    (e) => {
      const t = e.target.closest(HOVER);
      root.classList.toggle('is-hover', !!t);
      const l = t && t.getAttribute('data-cursor');
      label.textContent = l && l !== 'true' ? l : '';
      root.classList.toggle('is-label', !!label.textContent);
    },
    { passive: true },
  );

  addEventListener('mousedown', () => root.classList.add('is-down'));
  addEventListener('mouseup', () => root.classList.remove('is-down'));
  addEventListener('mouseleave', () => root.classList.add('is-out'));
  addEventListener('mouseenter', () => root.classList.remove('is-out'));
}
