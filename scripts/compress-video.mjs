/**
 * Compresses the placeholder reel MP4s so the repo + Cloudflare Pages deploy
 * stay small (Pages rejects files > 25 MB). These are temporary previews that
 * will be swapped for YouTube embeds later, so quality is intentionally modest:
 * ~640px wide, no audio, faststart. Safe to re-run (skips already-small files).
 *
 *   node scripts/compress-video.mjs
 */
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, renameSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from '@ffmpeg-installer/ffmpeg';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = resolve(root, 'public/assets/portfolio');
const MAX_OK = 8 * 1024 * 1024; // leave anything already under 8 MB alone

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = resolve(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.mp4$/i.test(name)) compress(p, st.size);
  }
}

function compress(file, size) {
  if (size <= MAX_OK) {
    console.log(`skip  ${(size / 1048576).toFixed(1)}MB  ${rel(file)}`);
    return;
  }
  const tmp = file.replace(/\.mp4$/i, '.tmp.mp4');
  execFileSync(
    ffmpeg.path,
    [
      '-y', '-i', file,
      '-vf', "scale='min(640,iw)':-2",
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '32',
      '-an',
      '-movflags', '+faststart',
      tmp,
    ],
    { stdio: ['ignore', 'ignore', 'ignore'] },
  );
  const newSize = statSync(tmp).size;
  rmSync(file);
  renameSync(tmp, file);
  console.log(`ok    ${(size / 1048576).toFixed(1)}MB -> ${(newSize / 1048576).toFixed(1)}MB  ${rel(file)}`);
}

const rel = (p) => p.replace(root + '\\', '').replace(/\\/g, '/');

if (!existsSync(ROOT)) {
  console.error('no portfolio assets at', ROOT);
  process.exit(1);
}
walk(ROOT);
console.log('compress-video: done');
