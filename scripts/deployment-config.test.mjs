import test from 'node:test';
import assert from 'node:assert/strict';
import { getDeploymentConfig, getRequestDeploymentConfig, pageMetadata, robotsText, sitemapXml } from './deployment-config.mjs';

test('local and preview builds default to noindex without guessing a public URL', () => {
  const config = getDeploymentConfig({ URL: 'https://preview.example.com', DEPLOY_URL: 'https://deploy.example.com' });
  assert.deepEqual(config, { siteUrl: null, indexing: false });
  assert.deepEqual(pageMetadata(config, 'index'), { robots: 'noindex, nofollow', canonical: null });
  assert.match(robotsText(config), /User-agent: \*\nDisallow: \/\n$/);
  assert.equal(sitemapXml(config), null);
});

test('only the configured HTTPS origin is indexable; previews retain the canonical but disallow crawling', () => {
  const vars = { SITE_URL: 'https://www.example.com', SITE_INDEXING: 'true' };
  const live = getRequestDeploymentConfig(vars, 'https://www.example.com/about.html');
  assert.equal(live.indexing, true);
  assert.equal(pageMetadata(live, 'about').robots, 'index, follow');
  for (const url of ['http://www.example.com/', 'https://preview.workers.dev/', 'http://127.0.0.1:4173/']) {
    const preview = getRequestDeploymentConfig(vars, url);
    assert.equal(preview.indexing, false);
    assert.equal(pageMetadata(preview, 'about').canonical, 'https://www.example.com/about.html');
    assert.equal(sitemapXml(preview), null);
    assert.match(robotsText(preview), /Disallow: \//);
  }
});

test('a final domain can be configured while search indexing remains disabled', () => {
  const config = getDeploymentConfig({ SITE_URL: 'https://WWW.Example.com/' });
  assert.deepEqual(config, { siteUrl: 'https://www.example.com', indexing: false });
  assert.deepEqual(pageMetadata(config, 'index'), { robots: 'noindex, nofollow', canonical: 'https://www.example.com/' });
  assert.deepEqual(pageMetadata(config, 'guide'), { robots: 'noindex, nofollow', canonical: 'https://www.example.com/guide.html' });
  assert.equal(sitemapXml(config), null);
  assert.doesNotMatch(robotsText(config), /Sitemap:/);
});

test('indexing requires an explicit valid final HTTPS root domain', () => {
  assert.throws(() => getDeploymentConfig({ SITE_INDEXING: 'true' }), /requires SITE_URL/);
  assert.throws(() => getDeploymentConfig({ SITE_INDEXING: 'yes' }), /must be true or false/);
  const invalidUrls = [
    'example.com', 'http://example.com', 'https://example.com/YC-website/',
    'https://example.com/a/..', 'https://example.com//', 'https://example.com/?a=b',
    'https://example.com/?', 'https://example.com/#fragment', 'https://example.com/#',
    'https://user:secret@example.com', 'https://@example.com', 'https://:@example.com', 'https://example.com:8443',
    'https://example.com\\folder', 'https://localhost', 'https://foo.localhost',
    'https://foo.local', 'https://foo.home.arpa', 'https://foo.localdomain', 'https://foo.internal', 'https://test.invalid', 'https://foo.test',
    'https://intranet', 'https://127.0.0.1', 'https://127.1', 'https://10.0.0.1',
    'https://192.168.1.1', 'https://172.16.1.1', 'https://[::1]', 'https://[fc00::1]',
    'https://8.8.8.8', 'https://-example.com', 'https://example.com.',
  ];
  for (const SITE_URL of invalidUrls) assert.throws(() => getDeploymentConfig({ SITE_URL }), /SITE_URL/, SITE_URL);
});

test('production metadata and sitemap use six content URLs with a root homepage and exclude 404', () => {
  const config = getDeploymentConfig({ SITE_URL: 'https://www.example.com/', SITE_INDEXING: 'true' });
  const expectedUrls = ['https://www.example.com/', 'https://www.example.com/services.html',
    'https://www.example.com/guide.html', 'https://www.example.com/facilities.html',
    'https://www.example.com/about.html', 'https://www.example.com/contact.html'];
  assert.equal(robotsText(config), 'User-agent: *\nAllow: /\nSitemap: https://www.example.com/sitemap.xml\n');
  const sitemap = sitemapXml(config);
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
  assert.deepEqual([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]), expectedUrls);
  assert.doesNotMatch(sitemap, /404|index\.html/);
  for (const [index, key] of ['index', 'services', 'guide', 'facilities', 'about', 'contact'].entries()) {
    assert.deepEqual(pageMetadata(config, key), { robots: 'index, follow', canonical: expectedUrls[index] });
  }
  assert.deepEqual(pageMetadata(config, '404'), { robots: 'noindex, nofollow', canonical: null });
});
