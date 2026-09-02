/**
 * One-off importer: pulls the client media from the local Drive download into
 * public/assets/, optimising images (sharp) and rasterising catalogue PDFs.
 *
 *   node scripts/import-assets.mjs
 *
 * Safe to re-run. Source is read-only.
 */
import { readdirSync, mkdirSync, existsSync, copyFileSync, rmSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { pdf } from 'pdf-to-img';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'D:/ZESIX STUDIO/ZESIX/Website Files Assets-Night/Website Files';
const OUT = resolve(root, 'public/assets');

const isImg = (f) => /\.(jpe?g|png|webp)$/i.test(f);
const isVid = (f) => /\.mp4$/i.test(f);
const pad = (n) => String(n).padStart(2, '0');

function ensure(dir) {
  mkdirSync(dir, { recursive: true });
}
function clearDir(dir) {
  if (existsSync(dir)) for (const f of readdirSync(dir)) rmSync(resolve(dir, f), { recursive: true, force: true });
}

async function optImage(from, to, { w = 1600, q = 78 } = {}) {
  const png = /\.png$/i.test(from);
  let img = sharp(from, { limitInputPixels: false }).rotate().resize({ width: w, withoutEnlargement: true });
  if (png) await img.png({ quality: 90, compressionLevel: 9 }).toFile(to.replace(/\.\w+$/, '.png'));
  else await img.jpeg({ quality: q, mozjpeg: true }).toFile(to.replace(/\.\w+$/, '.jpg'));
}

function listFiles(dir, filter) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => filter(f))
    .sort()
    .map((f) => resolve(dir, f));
}

/** copy+optimise a folder of images -> OUT/<destRel>/01.jpg ... */
async function importImages(srcDir, destRel, opts = {}) {
  const { nameFilter } = opts;
  const files = listFiles(srcDir, (f) => isImg(f) && (!nameFilter || nameFilter.test(f)));
  if (!files.length) return 0;
  const dest = resolve(OUT, destRel);
  ensure(dest);
  clearDir(dest);
  for (let i = 0; i < files.length; i++) {
    await optImage(files[i], resolve(dest, `${pad(i + 1)}.jpg`), opts);
  }
  return files.length;
}

/** copy a folder of videos -> OUT/<destRel>/01.mp4 ... */
function importVideos(srcDir, destRel) {
  const files = listFiles(srcDir, isVid);
  if (!files.length) return 0;
  const dest = resolve(OUT, destRel);
  ensure(dest);
  clearDir(dest);
  files.forEach((f, i) => copyFileSync(f, resolve(dest, `${pad(i + 1)}.mp4`)));
  return files.length;
}

async function importLogo(srcFile, destRel) {
  if (!existsSync(srcFile)) return console.warn('  ! missing logo', srcFile);
  const dest = resolve(OUT, destRel);
  ensure(dirname(dest));
  await sharp(srcFile, { limitInputPixels: false }).resize({ width: 800, withoutEnlargement: true }).png().toFile(dest);
}

async function importPdf(srcFile, destRel, { scale = 2 } = {}) {
  if (!existsSync(srcFile)) return console.warn('  ! missing pdf', srcFile);
  const dest = resolve(OUT, destRel);
  ensure(dest);
  clearDir(dest);
  const doc = await pdf(srcFile, { scale });
  let i = 0;
  for await (const page of doc) {
    i++;
    await sharp(page).resize({ width: 1400, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(resolve(dest, `${pad(i)}.jpg`));
  }
  return i;
}

const S = (p) => resolve(SRC, p);

async function run() {
  ensure(OUT);

  // ---- brand ----
  await importLogo(S('Zesix Studio Logo/LOGO ZESIX Dark Theme PNG.png'), 'brand/zesix-logo-dark.png');
  await importLogo(S('Zesix Studio Logo/LOGO ZESIX Light Theme PNG.png'), 'brand/zesix-logo-light.png');

  const jobs = [
    // Classic Group
    ['classic-group', async (b) => {
      await importLogo(S('Classic Group/Classic Group Logo White Blue for Dark 14.09.24-01.png'), `portfolio/${b}/logo.png`);
      console.log('  ai-reels', importVideos(S('Classic Group/AI Reels'), `portfolio/${b}/ai-reels`));
      console.log('  posts', await importImages(S('Classic Group/Creative Posts'), `portfolio/${b}/posts`));
      console.log('  hoarding', await importImages(S('Classic Group'), `portfolio/${b}/hoarding`, { w: 2200, nameFilter: /Hoarding/i }));
      console.log('  newspaper', await importImages(S('Classic Group/Newspaper Ad'), `portfolio/${b}/newspaper`, { w: 1800 }));
      console.log('  pole-kiosks', await importImages(S('Classic Group/Pole Kiosk'), `portfolio/${b}/pole-kiosks`));
    }],
    // Customise World
    ['customise-world', async (b) => {
      await importLogo(S('Customise World/Customise World LOGO.png'), `portfolio/${b}/logo.png`);
      console.log('  reels', importVideos(S('Customise World/Reels'), `portfolio/${b}/reels`));
      console.log('  catalogue', await importPdf(S('Customise World/Customise World Catalogue 2025-Digital.pdf'), `portfolio/${b}/catalogue`));
      console.log('  profile', await importPdf(S('Customise World/Customise World Profile.pdf'), `portfolio/${b}/company-profile`));
    }],
    // Ruchikara
    ['ruchikara', async (b) => {
      await importLogo(S('Ruchikara/Ruchikara Logo-01.png'), `portfolio/${b}/logo.png`);
      console.log('  ai-reels', importVideos(S('Ruchikara/AI reels'), `portfolio/${b}/ai-reels`));
      console.log('  reels', importVideos(S('Ruchikara/Reels'), `portfolio/${b}/reels`));
      console.log('  posts', await importImages(S('Ruchikara/Creative Posts'), `portfolio/${b}/posts`));
      console.log('  catalogue', await importPdf(S('Ruchikara/Ruchikara Diwali Hampers Catalogue 13.08.26.pdf'), `portfolio/${b}/catalogue`));
    }],
    // Kaaya
    ['kaaya-unisex-salon', async (b) => {
      await importLogo(S('Kaaya/Kaaya Unisex Salon Logo_Light.png'), `portfolio/${b}/logo.png`);
      console.log('  ai-reels', importVideos(S('Kaaya/AI Driven Reels'), `portfolio/${b}/ai-reels`));
      console.log('  reels', importVideos(S('Kaaya/Reels'), `portfolio/${b}/reels`));
      console.log('  posts', await importImages(S('Kaaya/Creative Posts'), `portfolio/${b}/posts`));
      console.log('  brand-identity', await importPdf(S('Kaaya/Kaaya Unisex Salon Logo Brand Identity _ Zesix Studio.pdf'), `portfolio/${b}/brand-identity`));
    }],
    // Riston
    ['riston-automobiles', async (b) => {
      await importLogo(S('Riston Automobiles/Riston_Logo_PNG-01.png'), `portfolio/${b}/logo.png`);
      console.log('  reels', importVideos(S('Riston Automobiles'), `portfolio/${b}/reels`));
      console.log('  posts', await importImages(S('Riston Automobiles/Creative Posts'), `portfolio/${b}/posts`));
    }],
    // Gymsane
    ['gymsane', async (b) => {
      await importLogo(S('Gymsane/Gymsane Mockup 2.png'), `portfolio/${b}/logo.png`);
      console.log('  posts', await importImages(S('Gymsane/Creative Posts'), `portfolio/${b}/posts`));
      console.log('  pole-kiosks', await importImages(S('Gymsane/Pole Kiosks'), `portfolio/${b}/pole-kiosks`));
    }],
  ];

  for (const [slug, fn] of jobs) {
    console.log(`\n${slug}`);
    await fn(slug);
  }
  console.log('\nimport-assets: done');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
