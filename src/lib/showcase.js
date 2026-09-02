/**
 * Portfolio presentation behaviours for case-study pages:
 *  - gallery lightbox (images + looping video tiles)
 *  - gallery-video autoplay when in view
 *  - book-flip catalogue (2-page spread, turn both directions)
 * Mockup frames are pure CSS; no JS needed beyond this.
 */
export function initShowcase() {
  lightbox();
  autoplayVideoTiles();
  bookFlip();
}

/* ---------- lightbox ---------- */
function lightbox() {
  const tiles = [...document.querySelectorAll('[data-lightbox]')];
  if (!tiles.length) return;

  const modal = document.createElement('div');
  modal.className = 'lb';
  modal.hidden = true;
  modal.innerHTML = `
    <button class="lb__close" aria-label="Close">&times;</button>
    <button class="lb__nav lb__prev" aria-label="Previous">&#8249;</button>
    <figure class="lb__stage"></figure>
    <button class="lb__nav lb__next" aria-label="Next">&#8250;</button>`;
  document.body.appendChild(modal);
  const stage = modal.querySelector('.lb__stage');
  let group = [];
  let idx = 0;

  const render = () => {
    const el = group[idx];
    const isVideo = el.dataset.type === 'video' || /\.(mp4|webm)$/i.test(el.dataset.src || '');
    stage.innerHTML = isVideo
      ? `<video src="${el.dataset.src}" controls autoplay loop playsinline></video>`
      : `<img src="${el.dataset.src}" alt="${el.dataset.caption || ''}" />`;
    if (el.dataset.caption) stage.insertAdjacentHTML('beforeend', `<figcaption>${el.dataset.caption}</figcaption>`);
  };
  const open = (t) => {
    group = tiles.filter((x) => x.dataset.group === t.dataset.group);
    idx = group.indexOf(t);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    render();
  };
  const close = () => {
    modal.hidden = true;
    document.body.style.overflow = '';
    stage.innerHTML = '';
  };
  const step = (d) => {
    idx = (idx + d + group.length) % group.length;
    render();
  };

  tiles.forEach((t) =>
    t.addEventListener('click', (e) => {
      e.preventDefault();
      open(t);
    }),
  );
  modal.querySelector('.lb__close').addEventListener('click', close);
  modal.querySelector('.lb__prev').addEventListener('click', () => step(-1));
  modal.querySelector('.lb__next').addEventListener('click', () => step(1));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  window.addEventListener('keydown', (e) => {
    if (modal.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') step(-1);
    if (e.key === 'ArrowRight') step(1);
  });
}

/* ---------- looping video tiles ---------- */
function autoplayVideoTiles() {
  const vids = document.querySelectorAll('video[data-loop-tile]');
  if (!vids.length) return;
  const io = new IntersectionObserver(
    (es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())),
    { threshold: 0.25 },
  );
  vids.forEach((v) => {
    v.muted = true;
    v.loop = true;
    v.playsInline = true;
    io.observe(v);
  });
}

/* ---------- book-flip catalogue ---------- */
function bookFlip() {
  document.querySelectorAll('[data-bookflip]').forEach((book) => {
    const pages = [...book.querySelectorAll('.book__page')];
    if (pages.length < 2) return;
    let i = 0;
    const prevBtn = book.querySelector('[data-book-prev]');
    const nextBtn = book.querySelector('[data-book-next]');
    const counter = book.querySelector('[data-book-count]');

    const render = () => {
      pages.forEach((p, n) => {
        p.classList.toggle('is-turned', n < i);
        p.style.zIndex = String(n < i ? n : pages.length - n);
      });
      if (counter) counter.textContent = `${Math.min(i + 1, pages.length)} / ${pages.length}`;
      if (prevBtn) prevBtn.disabled = i === 0;
      if (nextBtn) nextBtn.disabled = i >= pages.length;
    };
    nextBtn?.addEventListener('click', () => {
      if (i < pages.length) i++;
      render();
    });
    prevBtn?.addEventListener('click', () => {
      if (i > 0) i--;
      render();
    });
    book.addEventListener('click', (e) => {
      if (e.target.closest('button')) return;
      const r = book.getBoundingClientRect();
      if (e.clientX - r.left > r.width / 2) {
        if (i < pages.length) i++;
      } else if (i > 0) i--;
      render();
    });
    render();
  });
}
