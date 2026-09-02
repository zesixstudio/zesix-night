import './styles/tailwind.css';
import { initMotion } from './lib/motion.js';
import { initCursor } from './lib/cursor.js';
import { initLamp } from './lib/lamp.js';
import { initArtwork } from './lib/artwork.js';
import { initPortfolio } from './lib/portfolio.js';
import { initShowcase } from './lib/showcase.js';
import { initThemeScroll, initNavBubble } from './lib/theme-scroll.js';
import { initHomeServices } from './lib/home-services.js';

function initHeader() {
  const header = document.querySelector('[data-header]');
  if (!header) return;
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 12);
  onScroll();
  addEventListener('scroll', onScroll, { passive: true });

  const toggle = header.querySelector('[data-menu-toggle]');
  const panel = header.querySelector('[data-menu-panel]');
  if (toggle && panel) {
    const set = (open) => {
      header.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      document.body.style.overflow = open ? 'hidden' : '';
    };
    toggle.addEventListener('click', () => set(!header.classList.contains('menu-open')));
    panel.addEventListener('click', (e) => e.target.closest('a') && set(false));
    addEventListener('keydown', (e) => e.key === 'Escape' && set(false));
  }

  const here = location.pathname.replace(/index\.html$/, '').replace(/\/$/, '') || '/';
  header.querySelectorAll('[data-nav-link]').forEach((a) => {
    const href = a.getAttribute('href').replace(/\.html$/, '').replace(/\/$/, '') || '/';
    const active = href === '/' ? here === '/' : here.startsWith(href);
    if (active) a.setAttribute('aria-current', 'page');
  });
}

function initWhatsApp() {
  document.querySelectorAll('[data-wa]').forEach((a) => {
    a.href = `https://wa.me/${a.dataset.wa}?text=${encodeURIComponent(a.dataset.waMsg || '')}`;
  });
}

function initYear() {
  document.querySelectorAll('[data-year]').forEach((el) => (el.textContent = String(new Date().getFullYear())));
}

function boot() {
  initHeader();
  initYear();
  initWhatsApp();
  initThemeScroll();
  initNavBubble();
  initLamp();
  initCursor();
  initHomeServices();
  initPortfolio();
  initShowcase();
  initArtwork();
  initMotion();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
