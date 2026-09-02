import { defineConfig } from 'vite';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';
import { globSync } from 'glob';
import handlebars from 'vite-plugin-handlebars';
import tailwindcss from '@tailwindcss/vite';

const root = dirname(fileURLToPath(import.meta.url));
const readJSON = (p) => JSON.parse(readFileSync(resolve(root, p), 'utf-8'));

const site = readJSON('content/site.json');
const services = readJSON('content/services.json');
const testimonials = readJSON('content/testimonials.json');
const projects = readJSON('content/projects.json');

const pages = globSync('**/*.html', {
  cwd: root,
  ignore: ['node_modules/**', 'dist/**', 'src/**'],
});
const input = Object.fromEntries(
  pages.map((p) => [p.replace(/\.html$/, '').replace(/[\\/]/g, '-'), resolve(root, p)]),
);

const caseStudies = projects.filter((p) => p.feature === 'case-study');
const otherClients = projects.filter((p) => p.feature === 'other');

export default defineConfig({
  root,
  appType: 'mpa',
  plugins: [
    tailwindcss(),
    handlebars({
      partialDirectory: resolve(root, 'src/partials'),
      context: {
        site,
        services,
        testimonials,
        projects,
        caseStudies,
        otherClients,
        featured: caseStudies.slice(0, 4),
        year: new Date().getFullYear(),
      },
      helpers: {
        eq: (a, b) => a === b,
        inc: (a, b) => (a || 0) + (b || 0),
        pad2: (n) => String((n || 0) + 1).padStart(2, '0'),
        slugify: (s) =>
          String(s)
            .toLowerCase()
            .replace(/&/g, 'and')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, ''),
      },
    }),
  ],
  build: { rollupOptions: { input }, outDir: 'dist', emptyOutDir: true },
  server: { port: 5273, open: false },
});
