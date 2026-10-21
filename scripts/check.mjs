import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDeploymentConfig } from './deployment-config.mjs';

const deployment = getDeploymentConfig();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const expectedPages = ['index.html', 'services.html', 'guide.html', 'facilities.html', 'about.html', 'contact.html', '404.html'];
const publicExtensions = new Set(['.html', '.css', '.js', '.mjs', '.svg', '.png', '.jpg', '.jpeg',
  '.webp', '.avif', '.gif', '.ico', '.woff', '.woff2', '.ttf']);
const textExtensions = new Set(['.html', '.css', '.js', '.mjs', '.svg', '.txt', '.xml']);
const failures = [];
const documents = new Map();
const files = [];
let referenceCount = 0;
function fail(file, message) { failures.push(`${file}：${message}`); }
function relative(file) { return path.relative(root, file).split(path.sep).join('/'); }
function withinRoot(file) {
  const result = path.relative(root, file);
  return result === '' || (result !== '..' && !result.startsWith(`..${path.sep}`) && !path.isAbsolute(result));
}

function decodeEntities(value) {
  return value.replace(/&(#x[\da-f]+|#\d+|amp|quot|apos|lt|gt);/gi, (match, entity) => {
    if (entity[0] === '#') {
      const point = entity[1].toLowerCase() === 'x' ? parseInt(entity.slice(2), 16) : parseInt(entity.slice(1), 10);
      return Number.isInteger(point) && point >= 0 && point <= 0x10ffff ? String.fromCodePoint(point) : match;
    }
    return ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[entity.toLowerCase()];
  });
}

function parseTags(html) {
  const tags = [];
  let offset = 0;
  while (offset < html.length) {
    const start = html.indexOf('<', offset);
    if (start === -1) break;
    if (html.startsWith('<!--', start)) {
      const end = html.indexOf('-->', start + 4);
      offset = end === -1 ? html.length : end + 3;
      continue;
    }
    let quote = '';
    let end = start + 1;
    for (; end < html.length; end += 1) {
      const character = html[end];
      if (quote) { if (character === quote) quote = ''; }
      else if (character === '"' || character === "'") quote = character;
      else if (character === '>') break;
    }
    offset = end + 1;
    const source = html.slice(start + 1, end);
    const name = /^\s*([a-z][a-z\d:-]*)\b/i.exec(source);
    if (!name) continue;
    const attributes = {};
    const attributePattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g;
    for (const match of source.slice(name[0].length).matchAll(attributePattern)) {
      attributes[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '');
    }
    tags.push({ name: name[1].toLowerCase(), attributes });
  }
  return tags;
}

async function walk(directory) {
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    const label = relative(file);
    if (entry.isSymbolicLink()) { fail(label, '发布目录不允许符号链接'); continue; }
    if (entry.name.startsWith('.')) fail(label, '隐藏文件或目录不应发布');
    if (entry.isDirectory()) {
      if (label !== 'assets' && !label.startsWith('assets/')) fail(label, '仅 assets 目录可以进入发布产物');
      await walk(file);
    } else if (entry.isFile()) {
      files.push(file);
      const allowedRoot = expectedPages.includes(label) || ['robots.txt', 'sitemap.xml', 'favicon.ico'].includes(label);
      const allowedAsset = label.startsWith('assets/') && publicExtensions.has(path.extname(file).toLowerCase());
      if (!allowedRoot && !allowedAsset) fail(label, '不在公开文件白名单中（禁止内部清单、PPT 和开发文件）');
    } else fail(label, '不支持的文件类型');
  }
}

const forbiddenPatterns = [
  [/chaichegongsi|\/skin\/index\/|hm\.baidu\.com|cnzz\.com/i, '含参考站或统计代码残留'],
  [/legalNameCandidate|addressCandidate|wechatId|icpNumber|\bTBD\b|\bTODO\b|待确认|占位文案/i, '含内部候选字段或待确认文案'],
  [/玉成智造[（(]上海[）)](?:科技)?有限公司|上海市嘉定区园大路\s*185\s*号/, '含未确认公司全称或详细地址'],
  [/国家级高新技术企业|全国上门|免费拖车|24\s*小时(?:到达|客服)|全面达产后.*(?:3\s*万|4\.5\s*万)/, '含首版不应公开的未经确认承诺或数字'],
  [/file:\/\/\/|(?<![a-z])[a-z]:[\\/]|\.work[\\/]|微信临时/i, '含本机或内部工作路径'],
];

async function checkReference(owner, value, { resource = false } = {}) {
  referenceCount += 1;
  const label = relative(owner);
  if (!value.trim()) { fail(label, '存在空 href/src'); return; }
  if (/^tel:/i.test(value)) {
    if (value !== 'tel:18321103133') fail(label, `电话链接不一致：${value}`);
    return;
  }
  if (/^mailto:/i.test(value)) { fail(label, '不应发布未提供的邮箱入口'); return; }
  let target;
  try { target = new URL(value, `https://local.invalid/${label}`); }
  catch { fail(label, `链接格式错误：${value}`); return; }
  if (!['http:', 'https:'].includes(target.protocol)) { fail(label, `不支持的链接协议：${value}`); return; }
  if (target.origin !== 'https://local.invalid') {
    if (resource) fail(label, `运行资源不应依赖外部地址：${value}`);
    else if (target.protocol !== 'https:') fail(label, `外部链接应使用 HTTPS：${value}`);
    return;
  }
  let pathname;
  let fragment;
  try {
    pathname = decodeURIComponent(target.pathname);
    fragment = decodeURIComponent(target.hash.slice(1));
  } catch { fail(label, `链接编码错误：${value}`); return; }
  if (/[\\\x00-\x1f]/.test(pathname)) { fail(label, `不合法的本地路径：${value}`); return; }
  const file = path.resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
  if (!withinRoot(file)) { fail(label, `链接超出发布目录：${value}`); return; }
  let stats;
  try {
    const actualPath = await fs.realpath(file);
    if (!withinRoot(actualPath)) { fail(label, `链接指向目录外部：${value}`); return; }
    stats = await fs.stat(actualPath);
  } catch { fail(label, `目标不存在：${value}`); return; }
  if (!stats.isFile()) { fail(label, `目标不是文件：${value}`); return; }
  if (target.hash === '' && value.trim().endsWith('#')) fail(label, `空锚点：${value}`);
  if (fragment) {
    const document = documents.get(file);
    if (!document) fail(label, `锚点目标不是已检查的 HTML：${value}`);
    else if (!document.ids.has(fragment)) fail(label, `锚点不存在：${value}`);
  }
}

try {
  const stats = await fs.lstat(root);
  if (!stats.isDirectory() || stats.isSymbolicLink()) throw new Error('dist 必须是实际目录');
  await walk(root);
  for (const file of files) {
    if (!textExtensions.has(path.extname(file).toLowerCase())) continue;
    const source = await fs.readFile(file, 'utf8');
    // This exact transcription is supported by both user-provided certificate pages.
    // Keep the general restriction for company names and addresses elsewhere.
    const contentForChecks = ['index.html', 'about.html'].includes(relative(file))
      ? source.replace('<p class="certificate-company">证照载明企业名称：<strong>玉成智造（上海）科技有限公司</strong></p>', '')
      : source;
    for (const [pattern, message] of forbiddenPatterns) if (pattern.test(contentForChecks)) fail(relative(file), message);
    if (path.extname(file).toLowerCase() !== '.html') continue;
    const tags = parseTags(source);
    const ids = new Set();
    for (const { attributes } of tags) {
      if (attributes.id) {
        if (ids.has(attributes.id)) fail(relative(file), `重复 id：${attributes.id}`);
        ids.add(attributes.id);
      }
    }
    documents.set(file, { source, tags, ids });
  }
  const pageTitles = new Set();
  for (const page of expectedPages) {
    const file = path.join(root, page);
    const document = documents.get(file);
    if (!document) { fail(page, '缺少页面'); continue; }
    const { source, tags } = document;
    if (tags.find((tag) => tag.name === 'html')?.attributes.lang?.toLowerCase() !== 'zh-cn') fail(page, '缺少 lang="zh-CN"');
    if (!tags.some((tag) => tag.name === 'meta' && tag.attributes.charset?.toLowerCase() === 'utf-8')) fail(page, '缺少 UTF-8 编码声明');
    if (!tags.some((tag) => tag.name === 'meta' && tag.attributes.name?.toLowerCase() === 'viewport'
      && /width\s*=\s*device-width/i.test(tag.attributes.content || ''))) fail(page, '缺少正确的 viewport');
    if (!tags.some((tag) => tag.name === 'meta' && tag.attributes.name?.toLowerCase() === 'description'
      && tag.attributes.content?.trim())) fail(page, '缺少页面描述');
    if (tags.filter((tag) => tag.name === 'h1').length !== 1) fail(page, '每页应有且仅有一个 H1');
    const titles = [...source.matchAll(/<title\b[^>]*>([\s\S]*?)<\/title\s*>/gi)];
    const title = decodeEntities(titles[0]?.[1] || '').trim();
    if (titles.length !== 1 || !title) fail(page, '缺少唯一的页面标题');
    else if (pageTitles.has(title)) fail(page, '页面标题与其他页面重复');
    else pageTitles.add(title);
    const robots = tags.filter((tag) => tag.name === 'meta' && tag.attributes.name?.toLowerCase() === 'robots');
    const expectedRobots = deployment.indexing && page !== '404.html' ? 'index, follow' : 'noindex, nofollow';
    if (robots.length !== 1 || robots[0].attributes.content !== expectedRobots) {
      fail(page, `索引声明应为 ${expectedRobots}（检查时须使用与构建相同的 SITE_URL / SITE_INDEXING）`);
    }
    const canonicalTags = tags.filter((tag) => tag.name === 'link' && tag.attributes.rel?.toLowerCase().split(/\s+/).includes('canonical'));
    const ogTags = tags.filter((tag) => tag.name === 'meta' && tag.attributes.property?.toLowerCase().startsWith('og:'));
    if (deployment.siteUrl && page !== '404.html') {
      const expectedUrl = `${deployment.siteUrl}/${page === 'index.html' ? '' : page}`;
      if (canonicalTags.length !== 1 || canonicalTags[0].attributes.href !== expectedUrl) fail(page, `canonical 应唯一且为 ${expectedUrl}`);
      const description = tags.find((tag) => tag.name === 'meta' && tag.attributes.name?.toLowerCase() === 'description')?.attributes.content;
      const expectedOg = { 'og:url': expectedUrl, 'og:type': 'website', 'og:locale': 'zh_CN', 'og:title': title, 'og:description': description };
      for (const [property, content] of Object.entries(expectedOg)) {
        const matches = ogTags.filter((tag) => tag.attributes.property.toLowerCase() === property);
        if (matches.length !== 1 || matches[0].attributes.content !== content) fail(page, `${property} 缺失、重复或与页面内容 / 正式域名不一致`);
      }
      const siteName = ogTags.filter((tag) => tag.attributes.property.toLowerCase() === 'og:site_name');
      if (siteName.length !== 1 || !siteName[0].attributes.content?.trim()) fail(page, '缺少唯一的 og:site_name');
    } else if (canonicalTags.length || ogTags.length) {
      fail(page, '未配置正式域名的页面及 404 页面不应包含 canonical / Open Graph 发布元数据');
    }
    if (!source.includes('18321103133') || !source.includes('姚经理')) fail(page, '缺少统一联系信息');
    if (source.includes('姚昌旭')) fail(page, '联系人称呼未更新');
    if (!tags.some((tag) => tag.attributes.href === 'tel:18321103133')) fail(page, '缺少电话链接');
  }
  for (const [file, { tags }] of documents) {
    for (const { name, attributes } of tags) {
      const isCanonical = name === 'link' && attributes.rel?.toLowerCase().split(/\s+/).includes('canonical');
      if ('href' in attributes) await checkReference(file, attributes.href, { resource: name !== 'a' && name !== 'area' && !isCanonical });
      for (const attribute of ['src', 'poster']) if (attribute in attributes) await checkReference(file, attributes[attribute], { resource: true });
      if (attributes.srcset) {
        for (const item of attributes.srcset.split(',')) await checkReference(file, item.trim().split(/\s+/)[0], { resource: true });
      }
      if (name === 'img') {
        if (!('alt' in attributes)) fail(relative(file), '图片缺少 alt');
        if (!/^\d+$/.test(attributes.width || '') || !/^\d+$/.test(attributes.height || '')
          || Number(attributes.width) < 1 || Number(attributes.height) < 1) fail(relative(file), '图片缺少正数 width/height');
      }
    }
  }
  for (const file of files.filter((candidate) => path.extname(candidate).toLowerCase() === '.css')) {
    const css = await fs.readFile(file, 'utf8');
    for (const match of css.matchAll(/url\(\s*(?:"([^"]*)"|'([^']*)'|([^\s)]*))\s*\)/gi)) {
      await checkReference(file, match[1] ?? match[2] ?? match[3], { resource: true });
    }
  }
  const robotsFile = path.join(root, 'robots.txt');
  if (!files.includes(robotsFile)) fail('robots.txt', '缺少搜索抓取规则');
  else {
    const rules = (await fs.readFile(robotsFile, 'utf8')).split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith('#'));
    const expectedRules = deployment.indexing
      ? ['User-agent: *', 'Allow: /', `Sitemap: ${deployment.siteUrl}/sitemap.xml`]
      : ['User-agent: *', 'Disallow: /'];
    if (JSON.stringify(rules) !== JSON.stringify(expectedRules)) fail('robots.txt', '抓取规则 / 网站地图地址与部署配置不一致');
  }
  const sitemapFile = path.join(root, 'sitemap.xml');
  if (!deployment.indexing && files.includes(sitemapFile)) fail('sitemap.xml', '禁止索引的构建不应发布网站地图');
  if (deployment.indexing) {
    if (!files.includes(sitemapFile)) fail('sitemap.xml', '允许索引的构建必须提供网站地图');
    else {
      const sitemap = await fs.readFile(sitemapFile, 'utf8');
      const expectedUrls = expectedPages.filter((page) => page !== '404.html').map((page) => `${deployment.siteUrl}/${page === 'index.html' ? '' : page}`);
      const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeEntities(match[1]));
      const structure = /^<\?xml version="1\.0" encoding="UTF-8"\?>\s*<urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">\s*(?:<url>\s*<loc>[^<]+<\/loc>\s*<\/url>\s*)+<\/urlset>\s*$/;
      if (!structure.test(sitemap) || locations.length !== expectedUrls.length
        || new Set(locations).size !== expectedUrls.length || expectedUrls.some((url) => !locations.includes(url))) {
        fail('sitemap.xml', '网站地图应是有效 XML，且仅包含正式域名下的六个内容页；首页用根地址，不含 404');
      }
    }
  }
} catch (error) {
  fail('dist', `检查无法完成：${error.message}；请先运行 node scripts/build.mjs`);
}

if (failures.length) {
  console.error(`静态检查失败（${failures.length} 项）：`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`静态检查通过：${expectedPages.length} 个页面，${files.length} 个公开文件，${referenceCount} 个资源/链接引用。`);
  console.log('已核对页面基础信息、本地链接与锚点、联系方式、发布目录、内部内容泄漏与索引 / canonical / 网站地图一致性；浏览器交互另行验收。');
}
