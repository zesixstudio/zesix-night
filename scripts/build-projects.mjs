/**
 * Generates portfolio/<slug>.html from content/projects.json.
 * Reads the REAL files under public/assets/<folder> so galleries, mockups and
 * book-flips match whatever was imported. Missing folders degrade to slots.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const projects = JSON.parse(readFileSync(resolve(root, 'content/projects.json'), 'utf-8'));
const site = JSON.parse(readFileSync(resolve(root, 'content/site.json'), 'utf-8'));

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** real files in public/assets/<folder>, as web paths */
function assetFiles(folder, exts) {
  if (!folder) return [];
  const dir = resolve(root, 'public/assets', folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => exts.test(f))
    .sort()
    .map((f) => `/assets/${folder}/${f}`);
}
const imgs = (folder) => assetFiles(folder, /\.(jpe?g|png|webp)$/i);
const vids = (folder) => assetFiles(folder, /\.mp4$/i);

const outDir = resolve(root, 'portfolio');
mkdirSync(outDir, { recursive: true });
for (const f of readdirSync(outDir)) if (f.endsWith('.html')) rmSync(resolve(outDir, f));

/* ---------- presentation renderers ---------- */

function galleryHTML(item, gid) {
  const video = item.mode === 'gallery-video';
  let files = video ? vids(item.folder) : imgs(item.folder);
  if (!files.length) files = Array.from({ length: video ? 3 : 6 }, () => '');
  const tiles = files
    .map((src) =>
      video
        ? `<button class="tile tile--v ${src ? '' : 'tile--empty'}" data-lightbox data-type="video" data-group="${gid}" data-src="${esc(src)}" data-caption="${esc(item.caption || '')}" data-cursor="Play">
             ${src ? `<video data-loop-tile muted loop playsinline preload="metadata" src="${esc(src)}#t=0.1"></video>` : ''}
             <span class="tile__play" aria-hidden="true"></span>
           </button>`
        : `<button class="tile ${src ? '' : 'tile--empty'}" data-lightbox data-group="${gid}" data-src="${esc(src)}" data-caption="${esc(item.caption || '')}" data-cursor="View">
             ${src ? `<img loading="lazy" src="${esc(src)}" alt="${esc(item.label)} — Zesix Studio" />` : ''}
           </button>`,
    )
    .join('');
  return `<div class="sc-gallery" data-reveal-group>${tiles}</div>`;
}

function mockupHTML(item, kind, gid) {
  let files = imgs(item.folder);
  if (item.src) files = [item.src];
  if (!files.length) files = [''];
  const frames = files
    .map(
      (src) => `<button class="mock mock--${kind} ${src ? '' : 'mock--empty'}" data-reveal ${src ? `data-lightbox data-group="${gid}" data-src="${esc(src)}" data-caption="${esc(item.caption || '')}" data-cursor="View"` : ''}>
        <span class="mock__frame">
          ${src ? `<img loading="lazy" src="${esc(src)}" alt="${esc(item.label)} — Zesix Studio" />` : `<span class="mock__hint">${esc(item.folder || '')}</span>`}
        </span>
      </button>`,
    )
    .join('');
  return `<div class="sc-mocks sc-mocks--${kind}">${frames}</div>`;
}

function videoEmbedHTML(item) {
  const list = item.items && item.items.length ? item.items : [];
  const local = vids(item.folder);
  if (!list.length && local.length) {
    return `<div class="sc-embeds" data-reveal-group>${local
      .map((s) => `<div class="sc-embed" data-reveal-child><video controls playsinline preload="metadata" src="${esc(s)}"></video></div>`)
      .join('')}</div>`;
  }
  return `<div class="sc-embeds ${list.length > 1 ? 'sc-embeds--multi' : ''}" data-reveal-group>
    ${list
      .map(
        (u) =>
          `<div class="sc-embed" data-reveal-child><iframe src="${esc(u)}" title="${esc(item.label)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>`,
      )
      .join('')}
  </div>`;
}

function igReelHTML(item) {
  const list = (item.items || []).map((u) => (u.endsWith('/embed') ? u : u.replace(/\/?$/, '/') + 'embed'));
  return `<div class="sc-embeds sc-embeds--reels" data-reveal-group>
    ${list
      .map((u) => `<div class="sc-embed sc-embed--reel" data-reveal-child><iframe src="${esc(u)}" title="${esc(item.label)}" loading="lazy" scrolling="no" allowtransparency="true"></iframe></div>`)
      .join('')}
  </div>`;
}

function bookFlipHTML(item) {
  let pages = imgs(item.folder);
  if (!pages.length) pages = Array.from({ length: 6 }, () => '');
  return `<div class="book" data-bookflip data-reveal>
    <div class="book__stage">
      ${pages
        .map(
          (src, i) =>
            `<div class="book__page ${src ? '' : 'book__page--empty'}" style="z-index:${pages.length - i}">${src ? `<img loading="lazy" src="${esc(src)}" alt="${esc(item.label)} page ${i + 1}" />` : ''}</div>`,
        )
        .join('')}
    </div>
    <div class="book__ctrls">
      <button class="book__btn" data-book-prev aria-label="Previous page" data-cursor="Back">&#8249;</button>
      <span class="book__count" data-book-count>1 / ${pages.length}</span>
      <button class="book__btn" data-book-next aria-label="Next page" data-cursor="Next">&#8250;</button>
    </div>
  </div>`;
}

function itemHTML(item, i) {
  const gid = `g${i}`;
  let body = '';
  switch (item.mode) {
    case 'gallery':
    case 'gallery-video': body = galleryHTML(item, gid); break;
    case 'mockup-billboard': body = mockupHTML(item, 'billboard', gid); break;
    case 'mockup-kiosk': body = mockupHTML(item, 'kiosk', gid); break;
    case 'mockup-newspaper': body = mockupHTML(item, 'newspaper', gid); break;
    case 'mockup-stand': body = mockupHTML(item, 'stand', gid); break;
    case 'mockup-phone': body = mockupHTML(item, 'phone', gid); break;
    case 'video-embed': body = videoEmbedHTML(item); break;
    case 'ig-reel': body = igReelHTML(item); break;
    case 'book-flip': body = bookFlipHTML(item); break;
    case 'note': body = `<p class="sc-note" data-reveal>${esc(item.caption || '')}</p>`; break;
  }
  const svc = (item.services || [])
    .map((s) => `<a class="sc-block__svc" href="/services/${s}.html">${s.replace(/-/g, ' ')}</a>`)
    .join('');
  return `<section class="sc-block">
    <div class="container-x">
      <div class="sc-block__head" data-reveal>
        <span class="sc-block__no">${String(i + 1).padStart(2, '0')}</span>
        <h2>${esc(item.label)}</h2>
        ${item.caption && item.mode !== 'note' ? `<p>${esc(item.caption)}</p>` : ''}
        ${svc ? `<div class="sc-block__svcs">${svc}</div>` : ''}
      </div>
      ${body}
    </div>
  </section>`;
}

function pageHTML(p, next) {
  const title = `${esc(p.name)} — ${esc(site.name)} case study`;
  const path = `/portfolio/${p.slug}.html`;
  const hl = (p.highlights || [])
    .map(
      (h) =>
        `<li data-reveal-child><b><span data-count="${/^\d+$/.test(String(h.value)) ? h.value : ''}">${esc(h.value)}</span>${esc(h.suffix || '')}</b><span>${esc(h.label)}</span></li>`,
    )
    .join('');
  const narrative = ['challenge', 'approach', 'result']
    .filter((k) => p[k])
    .map(
      (k) => `<div class="cs-narr__row" data-reveal>
        <span class="label">${k}</span>
        <p>${esc(p[k])}</p>
      </div>`,
    )
    .join('');
  const showcase = (p.showcase || []).map(itemHTML).join('\n');
  const tReel = p.testimonialReel
    ? `<section class="sc-block"><div class="container-x"><div class="sc-block__head" data-reveal><span class="sc-block__no">&#9733;</span><h2>Testimonial reel</h2></div><div class="tmn__reel" data-reveal><iframe src="${esc(p.testimonialReel)}" title="Testimonial reel" loading="lazy"></iframe></div></div></section>`
    : '';
  const tRow = p.testimonial
    ? `<section class="sc-block"><div class="container-x"><blockquote class="cs-quote" data-reveal>&ldquo;${esc(p.testimonial.quote)}&rdquo;<cite>${esc(p.testimonial.name)}</cite></blockquote></div></section>`
    : '';

  return `<!-- AUTO-GENERATED by scripts/build-projects.mjs — edit content/projects.json -->
<head>
{{> head title="${title}" description="${esc(p.intro)}" path="${path}" ogType="article" }}
</head>

{{> lamp }}
{{> header }}

<main id="main" data-theme="${esc(p.theme || 'blue')}">
  <article class="cs" style="--accent:${esc(p.accent || '#88bee6')}">
    <header class="cs-hero">
      <div class="glow-blue" style="width:44rem;height:44rem;right:-8rem;top:-12rem;background:radial-gradient(circle,color-mix(in srgb,var(--accent) 26%,transparent),transparent 70%)"></div>
      <div class="container-x">
        <a class="cs-back link-u" href="/portfolio.html" data-cursor="Back">&larr; All work</a>
        <p class="label" data-reveal>${esc(p.category)} &middot; ${p.feature === 'case-study' ? 'Case study' : 'Client'}</p>
        <h1 class="text-display" data-reveal>${esc(p.name)}</h1>
        <p class="cs-hero__intro text-lead" data-reveal>${esc(p.intro)}</p>
        ${hl ? `<ul class="cs-hl" data-reveal-group>${hl}</ul>` : ''}
      </div>
    </header>

    ${narrative ? `<section class="cs-narr"><div class="container-x">${narrative}</div></section>` : ''}

    ${showcase}
    ${tReel}
    ${tRow}

    <nav class="cs-next">
      <div class="container-x">
        <span class="label">Next</span>
        <a class="cs-next__link" href="/portfolio/${next.slug}.html" data-cursor="Open">${esc(next.name)} &rarr;</a>
      </div>
    </nav>
  </article>

  {{> cta heading="Want results like this?" cta="Start a project" }}
</main>

{{> footer }}
`;
}

projects.forEach((p, i) => {
  const next = projects[(i + 1) % projects.length];
  writeFileSync(resolve(outDir, `${p.slug}.html`), pageHTML(p, next), 'utf-8');
});

console.log(`build-projects: wrote ${projects.length} case-study page(s) to portfolio/`);
