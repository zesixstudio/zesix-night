/**
 * /portfolio hub filtering. Cards render server-side (Handlebars); this toggles
 * visibility, URL-syncs, and slides the frosted "bubble" under the active chip.
 */
export function initPortfolio() {
  const root = document.querySelector('[data-worklist]');
  if (!root) return;
  const cards = [...root.querySelectorAll('[data-work-card]')];
  const chips = [...root.querySelectorAll('[data-filter]')];
  const countEl = root.querySelector('[data-work-count]');
  const emptyEl = root.querySelector('[data-work-empty]');
  const bubble = root.querySelector('[data-bubble]');

  let active = new URLSearchParams(location.search).get('filter') || 'all';

  const moveBubble = () => {
    if (!bubble) return;
    const el = chips.find((c) => c.dataset.filter === active);
    if (!el) return (bubble.style.opacity = '0');
    bubble.style.opacity = '1';
    bubble.style.width = `${el.offsetWidth}px`;
    bubble.style.transform = `translateX(${el.offsetLeft - 4}px)`;
  };

  const apply = () => {
    let shown = 0;
    cards.forEach((c) => {
      const tags = (c.dataset.tags || '').split(' ');
      const ok = active === 'all' || tags.includes(active);
      c.hidden = !ok;
      if (ok) shown++;
    });
    if (countEl) countEl.textContent = `${shown} project${shown === 1 ? '' : 's'}`;
    if (emptyEl) emptyEl.hidden = shown !== 0;
    chips.forEach((ch) => {
      const on = ch.dataset.filter === active;
      ch.classList.toggle('is-active', on);
      ch.setAttribute('aria-pressed', String(on));
    });
    const q = active === 'all' ? '' : `?filter=${active}`;
    history.replaceState(null, '', location.pathname + q);
    moveBubble();
  };

  root.addEventListener('click', (e) => {
    const ch = e.target.closest('[data-filter]');
    if (!ch) return;
    active = ch.dataset.filter;
    apply();
  });
  addEventListener('resize', moveBubble);

  apply();
  requestAnimationFrame(moveBubble);
}
