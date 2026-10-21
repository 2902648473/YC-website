import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { getRequestDeploymentConfig, pageMetadata, contentPageKeys } from '../src/lib/deployment-config.mjs';

const args = process.argv.slice(2);
if (args.includes('--help')) {
  console.log('Usage: npm run test:smoke -- --url http://127.0.0.1:4173/');
  process.exit(0);
}
const urlArg = args.indexOf('--url');
const origin = new URL(urlArg >= 0 ? args[urlArg + 1] : 'http://127.0.0.1:4173/').origin;
const vars = JSON.parse(readFileSync(new URL('../wrangler.jsonc', import.meta.url))).vars;
const config = getRequestDeploymentConfig(vars, origin);
const documents = new Map();
const localReferences = new Set();
const fetchPage = pathname => fetch(origin + pathname, { signal: AbortSignal.timeout(15000) });

for (const key of [...contentPageKeys, '404']) {
  const pathname = key === 'index' ? '/' : `/${key}.html`;
  const response = await fetchPage(pathname);
  assert.equal(response.status, key === '404' ? 404 : 200, pathname);
  const html = await response.text();
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(html, /<html lang="zh-CN"/);
  assert.equal([...html.matchAll(/<h1(?:\s|>)/g)].length, 1, `${pathname}: one SSR heading`);
  assert.match(html, /18321103133/);
  const metadata = pageMetadata(config, key);
  assert.ok(html.includes(`name="robots" content="${metadata.robots}"`), `${pathname}: robots`);
  if (metadata.canonical) assert.ok(html.includes(`rel="canonical" href="${metadata.canonical}"`), `${pathname}: canonical`);
  else assert.ok(!html.includes('rel="canonical"'), `${pathname}: no guessed canonical`);
  for (const [, reference] of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
    if (reference.startsWith('/') || reference.startsWith('#')) localReferences.add(new URL(reference.replaceAll('&amp;', '&'), origin + pathname).href);
  }
  documents.set(pathname, html);
  console.log(`PASS SSR ${pathname} (${response.status})`);
}

const redirect = await fetch(origin + '/index.html?from=old', { redirect: 'manual' });
assert.equal(redirect.status, 301);
assert.equal(new URL(redirect.headers.get('location'), origin).pathname, '/');
assert.equal(new URL(redirect.headers.get('location'), origin).searchParams.get('from'), 'old');
for (const href of localReferences) {
  const target = new URL(href);
  let html = documents.get(target.pathname);
  if (!html) {
    const response = await fetch(href, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, `Resource: ${target.pathname}`);
    if (response.headers.get('content-type')?.includes('text/html')) {
      html = await response.text();
      documents.set(target.pathname, html);
    }
  }
  if (target.hash && html) assert.ok(html.includes(`id="${decodeURIComponent(target.hash.slice(1))}"`), `Missing anchor ${target.pathname}${target.hash}`);
}
const missing = await fetchPage('/missing-page-for-verification');
assert.equal(missing.status, 404);
assert.match(await missing.text(), /返回首页/);
const incompletePath = await fetchPage('/about');
assert.equal(incompletePath.status, 404);
assert.match(await incompletePath.text(), /class="page-404"/);
const robots = await fetchPage('/robots.txt');
assert.equal(robots.status, 200);
assert.match(await robots.text(), config.indexing ? /Sitemap:/ : /Disallow: \//);
const sitemap = await fetchPage('/sitemap.xml');
assert.equal(sitemap.status, config.indexing ? 200 : 404);
if (config.indexing) assert.equal([...(await sitemap.text()).matchAll(/<loc>/g)].length, 6);
console.log(`PASS ${localReferences.size} local links/assets, anchors, redirect, 404, robots and sitemap`);
