import { mkdir, readFile, writeFile, cp, rm, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { site } from '../src/data/site.mjs';
import * as components from '../src/templates/components.mjs';
import { renderHome } from '../src/pages/home.mjs';
import { renderInnerPages } from '../src/pages/inner.mjs';
import { contentPageKeys, getDeploymentConfig, pageMetadata, robotsText, sitemapXml } from './deployment-config.mjs';

// Reject a bad production URL before touching the existing build.
const deployment = getDeploymentConfig();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Invalid build output path');

const helpers = {
  contactButtons: components.contactButtons,
  faqHtml: components.faqHtml,
  stepsHtml: components.stepsHtml,
  galleryHtml: components.galleryHtml,
  photoHtml: components.photoHtml,
  icon: components.icon,
};

const pages = { index: renderHome({ site, helpers }), ...renderInnerPages({ site, helpers }) };
const requiredPages = [...contentPageKeys, '404'];
for (const key of requiredPages) {
  if (!pages[key]?.body || !pages[key]?.title || !pages[key]?.description) throw new Error(`Incomplete page: ${key}`);
}
const styles = await Promise.all(['main.css', 'inner.css', 'preparation.css', 'home.css', 'services.css', 'about.css', 'carousel.css'].map(name => readFile(path.join(root, 'src/styles', name), 'utf8')));
const clientScript = await readFile(path.join(root, 'src/scripts/main.js'), 'utf8');
// Only this verified output directory is regenerated. Internal inputs never enter it.
await rm(output, { recursive: true, force: true });
await mkdir(path.join(output, 'assets'), { recursive: true });
await writeFile(path.join(output, 'assets/site.css'), styles.join('\n'));
await writeFile(path.join(output, 'assets/main.js'), clientScript);
await cp(path.join(root, 'public/favicon.ico'), path.join(output, 'favicon.ico'));

const allowedAssets = [
  'brand/logo.svg',
  'contact/contact-manager.png',
  'documents/recycling-qualification-page-1.webp',
  'documents/recycling-qualification-page-2.webp',
  'images/dismantling-1.webp', 'images/dismantling-1-original.jpg',
  'images/dismantling-2.webp', 'images/dismantling-2-original.jpg',
  'images/parts-warehouse.webp', 'images/parts-warehouse-original.png',
  'images/parts-campus.webp', 'images/parts-campus-original.png',
  'images/parts-workshop.webp', 'images/parts-workshop-original.png',
  'images/recycling-line.webp', 'images/recycling-line-original.jpg',
  'images/vehicle-dismantling.webp', 'images/vehicle-dismantling-original.jpg',
];
for (const asset of allowedAssets) {
  const source = path.join(root, 'public/assets', asset);
  if (!(await stat(source)).isFile()) throw new Error(`Missing public asset: ${asset}`);
  const destination = path.join(output, 'assets', asset);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(source, destination);
}
for (const key of requiredPages) {
  const page = pages[key];
  const metadata = pageMetadata(deployment, key);
  const socialMetadata = metadata.canonical ? `
  <link rel="canonical" href="${components.escapeHtml(metadata.canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:site_name" content="${components.escapeHtml(site.brandName)}">
  <meta property="og:title" content="${components.escapeHtml(page.title)}">
  <meta property="og:description" content="${components.escapeHtml(page.description)}">
  <meta property="og:url" content="${components.escapeHtml(metadata.canonical)}">` : '';
  const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${components.escapeHtml(page.description)}">
  <meta name="robots" content="${metadata.robots}">${socialMetadata}
  <meta name="theme-color" content="#246AA3">
  <title>${components.escapeHtml(page.title)}</title>
  <link rel="icon" href="/assets/brand/logo.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/site.css">
  <script src="/assets/main.js" defer></script>
</head>
<body class="page-${key}">
${components.header(key)}
<main id="main-content" tabindex="-1">${key === 'index' ? '' : components.innerHero(page)}${page.body}</main>
${components.footer()}
</body>
</html>\n`;
  await writeFile(path.join(output, `${key}.html`), html);
}
await writeFile(path.join(output, 'robots.txt'), robotsText(deployment));
const sitemap = sitemapXml(deployment);
if (sitemap) await writeFile(path.join(output, 'sitemap.xml'), sitemap);
console.log(`Built ${requiredPages.length} pages and ${allowedAssets.length + 1} public assets into dist/.`);
console.log(`Search indexing: ${deployment.indexing ? 'enabled' : 'disabled'}; canonical domain: ${deployment.siteUrl ?? 'not configured'}.`);
console.log('Preview: node scripts/serve.mjs --port 4173');
