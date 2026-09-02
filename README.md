# Zesix Studio — website (night edition)

Dark, interactive marketing site for **Zesix Studio**, a digital marketing company in
Raipur. Static multi-page site built with Vite + Tailwind CSS + vanilla JS + GSAP.

Signature bits: a pull-cord hanging lamp (off = "Creative People Don't Work At Day Time"),
custom cursor, scroll-driven section colours, stacked parallax services, an orbiting
"creative engine" hero artwork, an AI-×-human handshake section, and a portfolio shown
through mockups, galleries and flip-through catalogues.

## Local development

```bash
npm install
npm run dev        # http://localhost:5273
npm run build      # -> dist/
npm run preview
```

`npm run gen` regenerates the per-project (`portfolio/*.html`) and per-service
(`services/*.html`) pages from `content/*.json`; it runs automatically before dev/build.

### Content

Everything editable lives in `content/`:

| file | what |
|---|---|
| `site.json` | nav, contact, socials, stats, lamp copy |
| `services.json` | the six services + per-service page copy |
| `projects.json` | the six portfolio brands, case-study text, showcase items |
| `testimonials.json` | the testimonial reel + text testimonials |

### Media pipeline (one-offs)

```bash
npm run import              # scripts/import-assets.mjs  — pulls client media from the local Drive download
node scripts/compress-video.mjs   # shrinks placeholder reel MP4s (< ~4 MB each)
```

Portfolio media lives in `public/assets/portfolio/<slug>/…`. The reel MP4s are
temporary previews — they'll be replaced with YouTube embeds.

## Deploy — Cloudflare Pages

Connect this GitHub repo in **Cloudflare → Workers & Pages → Create → Pages → Connect to Git**:

| setting | value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | 20 (set env var `NODE_VERSION=20`) |

`dist/404.html` is served automatically as the not-found page. Every push to `main`
triggers a new deployment.

CLI alternative:

```bash
npm run build
npx wrangler pages deploy dist --project-name=zesix-night --branch=main
```
