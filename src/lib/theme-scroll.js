/**
 * Scroll-driven section colour (fondofdesigns style): a fixed .page-bg layer
 * eases between per-section palettes as [data-theme] sections pass the viewport
 * centre. Also drives the frosted-nav "bubble" selection.
 */
const THEMES = {
  black: ['#0a0b0d', '#88bee6'],
  blue: ['#0b1622', '#88bee6'],
  teal: ['#08201e', '#5eead4'],
  orange: ['#1e1712', '#f4b183'],
  grey: ['#141517', '#c7cdd4'],
};

export function initThemeScroll() {
  const body = document.body;
  if (!document.querySelector('.page-bg')) {
    const bg = document.createElement('div');
    bg.className = 'page-bg';
    body.prepend(bg);
  }
  body.classList.add('has-page-bg');

  const set = (theme) => {
    if (body.dataset.activeTheme === theme) return;
    const [bg, accent] = THEMES[theme] || THEMES.black;
    body.style.setProperty('--page-bg', bg);
    body.style.setProperty('--sec-accent', accent);
    body.dataset.activeTheme = theme;
  };

  const sections = [...document.querySelectorAll('[data-theme]')];
  if (!sections.length) {
    set('black');
    return;
  }
  set(sections[0].dataset.theme || 'black');

  let ticking = false;
  const update = () => {
    ticking = false;
    const mid = innerHeight * 0.5;
    for (const s of sections) {
      const r = s.getBoundingClientRect();
      if (r.top <= mid && r.bottom >= mid) {
        set(s.dataset.theme || 'black');
        return;
      }
    }
  };
  addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}

/** Frosted top-nav bubble that slides under the current / hovered link. */
export function initNavBubble() {
  const nav = document.querySelector('[data-header] .hdr__nav');
  const bubble = nav?.querySelector('[data-nav-bubble]');
  if (!nav || !bubble) return;
  const links = [...nav.querySelectorAll('a')];

  const moveTo = (el) => {
    if (!el) {
      bubble.style.opacity = '0';
      return;
    }
    bubble.style.opacity = '1';
    bubble.style.width = `${el.offsetWidth}px`;
    bubble.style.transform = `translateX(${el.offsetLeft}px)`;
  };

  const current = () => links.find((a) => a.getAttribute('aria-current') === 'page');
  const rest = () => moveTo(current());

  links.forEach((a) => a.addEventListener('mouseenter', () => moveTo(a)));
  nav.addEventListener('mouseleave', rest);
  addEventListener('resize', rest);
  requestAnimationFrame(rest);
}
