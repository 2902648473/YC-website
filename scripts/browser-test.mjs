import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = path.join(projectRoot, '.work', 'qa');
const args = process.argv.slice(2);
let baseUrl = 'http://127.0.0.1:4173/';
for (let index = 0; index < args.length; index += 1) {
  const argument = args[index];
  if (argument === '--help' || argument === '-h') {
    console.log('用法：node scripts/browser-test.mjs [--url http://127.0.0.1:4173/]');
    console.log('先运行构建与预览服务。结果及截图写入 .work/qa，不修改发布目录。');
    console.log('可选环境变量：PLAYWRIGHT_MODULE（已有模块路径）、BROWSER_EXECUTABLE（已有浏览器可执行文件）。');
    process.exit(0);
  }
  if (argument === '--url') baseUrl = args[++index];
  else if (argument.startsWith('--url=')) baseUrl = argument.slice(6);
  else throw new Error(`未知参数：${argument}`);
}
const origin = new URL(baseUrl).origin;
baseUrl = new URL('/', baseUrl).href;

const require = createRequire(import.meta.url);
let playwright;
let playwrightEntry;
const moduleCandidates = [
  process.env.PLAYWRIGHT_MODULE,
  'playwright',
  path.join(path.dirname(path.dirname(process.execPath)), 'node_modules', 'playwright'),
].filter(Boolean);
const moduleErrors = [];
for (const candidate of moduleCandidates) {
  try {
    playwrightEntry = require.resolve(candidate);
    playwright = require(candidate);
    break;
  } catch (error) { moduleErrors.push(`${candidate}: ${error.message.split('\n')[0]}`); }
}
if (!playwright) throw new Error(`未找到已有 Playwright；不会自动安装。\n${moduleErrors.join('\n')}`);
const playwrightVersion = JSON.parse(fs.readFileSync(path.join(path.dirname(playwrightEntry), 'package.json'), 'utf8')).version;
const { chromium } = playwright;
const report = {
  testedAt: new Date().toISOString(), baseUrl, playwrightVersion,
  browser: null, launchAttempts: [], cases: [], screenshots: [],
  limitations: [
    '本脚本的 200% 检查仅使用 1440/2 = 720 CSS px 视口重排近似，不以 deviceScaleFactor 冒充缩放。独立真实 Chrome 200% 缩放记录见同目录 real-zoom.json，以该文件的实际证据为准。',
    '只核对电话链接，不触发外呼；不发送微信消息，未在微信端验证二维码有效性。',
  ],
};
fs.mkdirSync(outputDirectory, { recursive: true });

let browser;
const browserOptions = process.env.BROWSER_EXECUTABLE
  ? [{ executablePath: process.env.BROWSER_EXECUTABLE }]
  : [{}, { channel: 'chrome' }, { channel: 'msedge' }];
for (const option of browserOptions) {
  try {
    browser = await chromium.launch({ headless: true, timeout: 15000, ...option });
    report.browser = { version: browser.version(), launchOption: option, defaultExecutable: chromium.executablePath() };
    break;
  } catch (error) {
    report.launchAttempts.push({ option, error: error.message.split('\n')[0] });
  }
}
if (!browser) {
  fs.writeFileSync(path.join(outputDirectory, 'browser-results.json'), `${JSON.stringify(report, null, 2)}\n`);
  throw new Error('已有浏览器均无法启动。请指定 BROWSER_EXECUTABLE；测试脚本不会下载浏览器。');
}

const pages = ['index', 'services', 'guide', 'facilities', 'about', 'contact', '404'];
const widths = [320, 375, 768, 1440];
const screenshotCases = new Map([
  ['index-375', 'home375.png'], ['index-1440', 'home1440.png'],
  ['contact-375', 'contact375.png'], ['contact-1440', 'contact1440.png'],
  ['facilities-1440', 'facilities1440.png'], ['guide-768', 'guide768.png'],
  ['about-375', 'about375.png'], ['about-1440', 'about1440.png'],
]);
const address = (name) => new URL(`${name}.html`, baseUrl).href;

async function runCase(name, operation) {
  const started = Date.now();
  try {
    const detail = await operation();
    report.cases.push({ name, passed: true, durationMs: Date.now() - started, detail });
    console.log(`PASS ${name}`);
  } catch (error) {
    report.cases.push({ name, passed: false, durationMs: Date.now() - started, error: error.stack || error.message });
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function observe(page) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
  page.on('response', (response) => {
    if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  page.on('requestfailed', (request) => errors.push(`requestfailed: ${request.url()} ${request.failure()?.errorText}`));
  return errors;
}

async function go(page, name) {
  const response = await page.goto(address(name), { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, `页面 ${name} 应独立返回 HTTP 200`);
  await page.locator('h1').waitFor({ state: 'visible' });
}

async function imageCheck(page) {
  const images = page.locator('img[src]');
  for (let index = 0; index < await images.count(); index += 1) {
    const image = images.nth(index);
    // Enhanced carousels retain hidden lazy slides for their no-JS fallback.
    // Their sources are checked by explicitly selecting every image below.
    if (await image.getAttribute('loading') === 'lazy') {
      if (!await image.isVisible()) continue;
      await image.scrollIntoViewIfNeeded();
    }
    await image.evaluate(async (element) => {
      if (!element.complete) await new Promise((resolve, reject) => {
        element.addEventListener('load', resolve, { once: true });
        element.addEventListener('error', () => reject(new Error(`图片无法加载：${element.src}`)), { once: true });
      });
      if (!element.naturalWidth) throw new Error(`图片缺失：${element.src}`);
      await element.decode();
    }, null, { timeout: 10000 });
  }
  return images.count();
}

async function noOverflow(page) {
  const geometry = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  assert.ok(geometry.document <= geometry.viewport + 1, `页面横向溢出：${JSON.stringify(geometry)}`);
  assert.ok(geometry.body <= geometry.viewport + 1, `正文横向溢出：${JSON.stringify(geometry)}`);
  return geometry;
}

async function checkPhone(page) {
  const numbers = await page.locator('a[href^="tel:"]').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  assert.ok(numbers.length > 0, '应有电话咨询入口');
  assert.ok(numbers.every((value) => value === 'tel:18321103133'), '所有拨号链接应使用同一确认号码');
  return numbers.length;
}

async function screenshot(page, filename, { fullPage = true } = {}) {
  await page.evaluate(() => window.scrollTo(0, 0));
  const target = path.join(outputDirectory, filename);
  await page.screenshot({ path: target, fullPage, animations: 'disabled' });
  report.screenshots.push(target);
}

async function assertDialogClosed(page, trigger) {
  await page.waitForFunction(() => !document.querySelector('#media-dialog').open);
  assert.equal(await trigger.evaluate((element) => element === document.activeElement), true, '关闭后焦点应返回触发链接');
  assert.notEqual(await page.locator('body').evaluate((element) => getComputedStyle(element).overflow), 'hidden', '关闭后应恢复页面滚动');
}

async function carouselIndex(page, index) {
  await page.waitForFunction((expected) => document.querySelector('[data-carousel]').dataset.carouselActiveIndex === String(expected), index);
  const carousel = page.locator('[data-carousel]');
  assert.equal(await carousel.locator('[data-carousel-status]').textContent(), `${index + 1} / 4`);
  assert.equal(await carousel.locator('[data-carousel-index][aria-pressed="true"]').getAttribute('data-carousel-index'), String(index));
  await carousel.locator('[data-carousel-slide]:visible img').evaluate((image) => image.decode());
}

async function touchSwipe(session, bounds, direction = -1, vertical = false) {
  const x = bounds.x + bounds.width * (direction < 0 ? .78 : .22);
  const y = bounds.y + bounds.height * .5;
  const distance = Math.min(160, bounds.width * .5) * direction;
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
  for (let step = 1; step <= 5; step += 1) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{
      x: vertical ? x : x + distance * step / 5,
      y: vertical ? y + distance * step / 5 : y, id: 1,
    }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

async function dialogScenario(page, selector) {
  const trigger = page.locator(selector).filter({ visible: true }).first();
  await trigger.scrollIntoViewIfNeeded();
  const source = await trigger.getAttribute('href');
  const dialog = page.locator('#media-dialog');
  const open = async () => {
    await trigger.focus();
    await trigger.press('Enter');
    await page.waitForFunction(() => document.querySelector('#media-dialog').open);
    await page.locator('#dialog-image').evaluate(async (image) => {
      await image.decode();
      if (!image.naturalWidth) throw new Error('弹窗图片无法加载');
    });
    assert.equal(new URL(await page.locator('#dialog-original').getAttribute('href'), baseUrl).href, new URL(source, baseUrl).href);
    assert.equal(await dialog.evaluate((element) => element.contains(document.activeElement)), true, '弹窗打开后焦点应在内部');
  };
  await open();
  const dialogKind = selector.includes('wechat') ? 'wechat' : 'gallery';
  await screenshot(page, `${dialogKind}-dialog${page.viewportSize().width}.png`, { fullPage: false });
  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press('Tab');
    assert.equal(await dialog.evaluate((element) => element.contains(document.activeElement)), true, 'Tab 焦点应留在模态框内');
  }
  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press('Shift+Tab');
    assert.equal(await dialog.evaluate((element) => element.contains(document.activeElement)), true, 'Shift+Tab 焦点应留在模态框内');
  }
  await page.keyboard.press('Escape');
  await assertDialogClosed(page, trigger);
  await open();
  await page.locator('[data-dialog-close]').click();
  await assertDialogClosed(page, trigger);
  await open();
  const bounds = await dialog.boundingBox();
  assert.ok(bounds.x > 2 || bounds.y > 2, '应存在可点击的弹窗外背景');
  await page.mouse.click(2, 2);
  await assertDialogClosed(page, trigger);
  return { source, closeMethods: ['Escape', 'close button', 'backdrop'], keyboardFocus: true };
}

try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    for (const name of pages) {
      await runCase(`layout-${name}-${width}`, async () => {
        const page = await context.newPage();
        const errors = observe(page);
        try {
          await go(page, name);
          assert.equal(await page.locator('h1').count(), 1);
          assert.equal(await page.locator('html').getAttribute('lang'), 'zh-CN');
          const current = page.locator('#site-menu [aria-current="page"]');
          assert.equal(await current.count(), name === '404' ? 0 : 1, '当前页导航状态应准确');
          if (name !== '404') assert.equal(await current.getAttribute('href'), `/${name}.html`);
          const images = await imageCheck(page);
          const geometry = await noOverflow(page);
          const phoneLinks = await checkPhone(page);
          if (width <= 375) {
            assert.equal(await page.locator('.mobile-contact').isVisible(), true);
            assert.ok(Number.parseFloat(await page.locator('body').evaluate((element) => getComputedStyle(element).paddingBottom)) >= 60);
          }
          const filename = screenshotCases.get(`${name}-${width}`);
          if (filename) await screenshot(page, filename);
          assert.deepEqual(errors, [], '不应出现脚本、控制台或资源错误');
          return { geometry, images, phoneLinks };
        } finally { await page.close(); }
      });
    }
    await context.close();
  }

  await runCase('mobile-menu-keyboard', async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 850 } });
    const page = await context.newPage();
    const errors = observe(page);
    try {
      await go(page, 'index');
      const toggle = page.locator('#menu-toggle');
      const menu = page.locator('#site-menu');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await menu.isVisible(), false);
      await toggle.focus();
      await toggle.press('Enter');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'true');
      assert.equal(await toggle.getAttribute('aria-label'), '收起导航菜单');
      assert.equal(await menu.isVisible(), true);
      await page.keyboard.press('Tab');
      assert.equal(await menu.locator('a').first().evaluate((element) => element === document.activeElement), true);
      await page.keyboard.press('Escape');
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.equal(await toggle.getAttribute('aria-label'), '展开导航菜单');
      assert.equal(await toggle.evaluate((element) => element === document.activeElement), true);
      await toggle.press('Enter');
      const contactLink = menu.locator('a[href="/contact.html"]');
      await contactLink.focus();
      await Promise.all([page.waitForURL(address('contact')), contactLink.press('Enter')]);
      assert.equal(await toggle.getAttribute('aria-expanded'), 'false');
      assert.deepEqual(errors, []);
      return { keyboard: ['Enter opens', 'Tab reaches links', 'Escape closes and restores focus', 'Enter navigates'] };
    } finally { await context.close(); }
  });

  await runCase('faq-keyboard', async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 850 } });
    const page = await context.newPage();
    try {
      await go(page, 'guide');
      const details = page.locator('.faq-list details').first();
      const summary = details.locator('summary');
      assert.equal(await details.getAttribute('open'), null);
      await summary.focus();
      await summary.press('Enter');
      assert.equal(await details.evaluate((element) => element.open), true);
      assert.equal(await details.locator('.faq-answer').isVisible(), true);
      await summary.press('Enter');
      assert.equal(await details.evaluate((element) => element.open), false);
      return { expandAndCollapse: true };
    } finally { await context.close(); }
  });

  for (const width of [375, 1440]) {
    await runCase(`wechat-dialog-${width}`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = observe(page);
      try {
        await go(page, 'contact');
        const result = await dialogScenario(page, 'main a[data-wechat]');
        assert.match(await page.locator('#dialog-caption').textContent(), /保存/);
        assert.deepEqual(errors, []);
        return result;
      } finally { await context.close(); }
    });
    await runCase(`gallery-dialog-${width}`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = observe(page);
      try {
        await go(page, 'facilities');
        const result = await dialogScenario(page, 'a[data-lightbox]');
        assert.equal(await page.locator('#dialog-caption').textContent(), '拆解作业工位');
        assert.deepEqual(errors, []);
        return result;
      } finally { await context.close(); }
    });
  }

  for (const width of [375, 1440]) {
    await runCase(`about-carousel-${width}`, async () => {
      const context = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = observe(page);
      try {
        await go(page, 'about');
        assert.equal(await page.locator('.about-timeline li').count(), 6);
        const carousel = page.locator('[data-carousel]');
        const trigger = carousel.locator('[data-carousel-slide]:visible a');
        const next = carousel.locator('[data-carousel-next]');
        await carousel.scrollIntoViewIfNeeded();
        await carouselIndex(page, 0);
        for (const index of [1, 2, 3, 0]) {
          await next.click();
          await carouselIndex(page, index);
        }
        await carousel.locator('[data-carousel-previous]').click();
        await carouselIndex(page, 3);
        await carousel.locator('[data-carousel-index="1"]').click();
        await carouselIndex(page, 1);
        await page.keyboard.press('ArrowRight');
        await carouselIndex(page, 2);
        assert.equal(await carousel.locator('[data-carousel-index="2"]').evaluate((el) => el === document.activeElement), true);
        await page.keyboard.press('ArrowLeft');
        await carouselIndex(page, 1);
        const imagePath = path.join(outputDirectory, `about-carousel${width}.png`);
        await carousel.screenshot({ path: imagePath });
        report.screenshots.push(imagePath);
        await trigger.focus();
        await trigger.press('Enter');
        const dialog = page.locator('#media-dialog');
        await page.waitForFunction(() => document.querySelector('#media-dialog').open);
        await page.locator('#dialog-image').evaluate((image) => image.decode());
        assert.equal(await page.locator('[data-dialog-gallery-controls]').isVisible(), true);
        for (let index = 0; index < 4; index += 1) {
          await page.locator('[data-dialog-gallery-next]').click();
          await carouselIndex(page, (index + 2) % 4);
          await page.locator('#dialog-image').evaluate((image) => image.decode());
          assert.equal(await page.locator('#dialog-image').getAttribute('src'), await trigger.getAttribute('href'));
        }
        await page.keyboard.press('ArrowLeft');
        await carouselIndex(page, 0);
        await page.locator('#dialog-image').evaluate((image) => image.decode());
        await page.keyboard.press('ArrowRight');
        await carouselIndex(page, 1);
        await page.locator('#dialog-image').evaluate((image) => image.decode());
        for (const key of ['Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Shift+Tab', 'Shift+Tab']) {
          await page.keyboard.press(key);
          assert.equal(await dialog.evaluate((el) => el.contains(document.activeElement)), true);
        }
        await page.screenshot({ path: path.join(outputDirectory, `about-carousel-dialog${width}.png`) });
        await page.keyboard.press('Escape');
        await assertDialogClosed(page, trigger);
        await trigger.press('Enter');
        await page.locator('[data-dialog-close]').click();
        await assertDialogClosed(page, trigger);
        await trigger.press('Enter');
        await page.mouse.click(2, 2);
        await assertDialogClosed(page, trigger);
        const wechat = page.locator('a[data-wechat]').filter({ visible: true }).first();
        await wechat.click();
        await page.waitForFunction(() => document.querySelector('#media-dialog').open);
        assert.equal(await page.locator('[data-dialog-gallery-controls]').isVisible(), false);
        assert.equal(await page.locator('#dialog-original').isVisible(), true);
        assert.equal(await page.locator('.dialog-image-wrap').getAttribute('data-watermark'), null);
        await page.keyboard.press('Escape');
        await assertDialogClosed(page, wechat);
        await noOverflow(page);
        assert.deepEqual(errors, []);
        return { images: 4, wrapping: true, thumbnailAndArrowKeys: true, modalGroup: true, focusRestored: true, wechatReset: true };
      } finally { await context.close(); }
    });
  }

  await runCase('about-carousel-touch', async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 850 }, hasTouch: true, isMobile: true });
    const page = await context.newPage();
    const errors = observe(page);
    try {
      await go(page, 'about');
      const photo = page.locator('[data-carousel-slide]:visible a');
      await photo.scrollIntoViewIfNeeded();
      const session = await context.newCDPSession(page);
      await touchSwipe(session, await photo.boundingBox(), -1);
      await carouselIndex(page, 1);
      assert.equal(await page.locator('#media-dialog').evaluate((el) => el.open), false, '滑动不应误触放大');
      await touchSwipe(session, await photo.boundingBox(), 1);
      await carouselIndex(page, 0);
      await touchSwipe(session, await photo.boundingBox(), -1, true);
      await carouselIndex(page, 0);
      // Keyboard activation avoids the deliberate 450 ms post-swipe ghost-click guard.
      await photo.focus();
      await photo.press('Enter');
      await page.waitForFunction(() => document.querySelector('#media-dialog').open);
      await page.locator('#dialog-image').evaluate((image) => image.decode());
      await touchSwipe(session, await page.locator('.dialog-image-wrap').boundingBox(), -1);
      await carouselIndex(page, 1);
      await page.locator('#dialog-image').evaluate((image) => image.decode());
      await page.keyboard.press('Escape');
      await assertDialogClosed(page, photo);
      assert.deepEqual(errors, []);
      return { dispatchedBrowserTouchEvents: true, leftRightSwipe: true, verticalGestureDoesNotChangeImage: true, modalSwipe: true };
    } finally { await context.close(); }
  });

  await runCase('about-carousel-no-javascript', async () => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 850 } });
    const page = await context.newPage();
    const errors = observe(page);
    try {
      await go(page, 'about');
      const carousel = page.locator('[data-carousel]');
      assert.equal(await carousel.locator('[data-carousel-slide]').count(), 4);
      assert.equal(await carousel.locator('[data-carousel-next]').isVisible(), false);
      assert.equal(await carousel.locator('[data-carousel-index]').first().isVisible(), false);
      for (let index = 0; index < 4; index += 1) {
        const link = carousel.locator('a').nth(index);
        await link.scrollIntoViewIfNeeded();
        await link.locator('img').evaluate((image) => image.decode());
        const expected = new URL(await link.getAttribute('href'), baseUrl).href;
        await link.click();
        await page.waitForURL(expected);
        assert.ok(await page.locator('img').evaluate((image) => image.naturalWidth > 1000));
        await go(page, 'about');
      }
      await noOverflow(page);
      assert.deepEqual(errors, []);
      return { allFourImagesAccessible: true, originalLinks: true, inertControlsHidden: true };
    } finally { await context.close(); }
  });

  await runCase('about-carousel-image-error-recovery', async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 850 } });
    const page = await context.newPage();
    try {
      await go(page, 'about');
      const trigger = page.locator('[data-carousel-slide]:visible a');
      const blocked = await trigger.getAttribute('href');
      await page.route(blocked, (route) => route.abort('failed'));
      await trigger.click();
      await page.waitForFunction(() => document.querySelector('#dialog-caption').textContent.includes('暂时无法载入'));
      await page.locator('[data-dialog-gallery-next]').click();
      await page.locator('#dialog-image').evaluate((image) => image.decode());
      assert.doesNotMatch(await page.locator('#dialog-caption').textContent(), /无法载入/);
      await page.keyboard.press('Escape');
      await assertDialogClosed(page, trigger);
      return { intentionalOriginalImageFailure: true, nextImageRecovers: true };
    } finally { await context.close(); }
  });

  await runCase('certificate-dialog-watermark', async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 850 } });
    const page = await context.newPage();
    const errors = observe(page);
    try {
      await go(page, 'index');
      const trigger = page.locator('a[data-watermark]').first();
      await trigger.click();
      await page.locator('#dialog-image').evaluate((image) => image.decode());
      assert.equal(await page.locator('#dialog-original').isVisible(), false);
      assert.match(await page.locator('.dialog-image-wrap').getAttribute('data-watermark'), /仅供官网展示/);
      await page.keyboard.press('Escape');
      await assertDialogClosed(page, trigger);
      await page.locator('a[data-wechat]').filter({ visible: true }).first().click();
      await page.locator('#dialog-image').evaluate((image) => image.decode());
      assert.equal(await page.locator('#dialog-original').isVisible(), true);
      assert.equal(await page.locator('.dialog-image-wrap').getAttribute('data-watermark'), null);
      assert.deepEqual(errors, []);
      return { certificateOriginalLinkHidden: true, watermarkPresent: true, wechatReset: true };
    } finally { await context.close(); }
  });

  await runCase('clipboard-success-real-readback', async () => {
    const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 1440, height: 900 } });
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
    const page = await context.newPage();
    try {
      await go(page, 'contact');
      await page.evaluate(() => navigator.clipboard.writeText('clipboard-verification-start'));
      await page.locator('[data-copy-phone]').click();
      await page.waitForFunction(() => document.querySelector('#contact-feedback').dataset.state === 'success'
        && document.querySelector('#contact-feedback').textContent.includes('已复制'));
      assert.equal(await page.evaluate(() => navigator.clipboard.readText()), '18321103133');
      return { actualClipboardReadback: '18321103133' };
    } finally { await context.close(); }
  });

  await runCase('clipboard-failure-feedback', async () => {
    const context = await browser.newContext({ viewport: { width: 375, height: 850 } });
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
        writeText: async () => { throw new DOMException('Deliberate test denial', 'NotAllowedError'); },
      } });
    });
    const page = await context.newPage();
    try {
      await go(page, 'contact');
      await page.locator('[data-copy-phone]').click();
      await page.waitForFunction(() => document.querySelector('#contact-feedback').dataset.state === 'error'
        && document.querySelector('#contact-feedback').textContent.includes('手动复制'));
      const feedback = await page.locator('#contact-feedback').textContent();
      assert.match(feedback, /复制未完成/);
      assert.doesNotMatch(feedback, /已复制/);
      return { simulatedClipboardWriteDenial: true, feedback };
    } finally { await context.close(); }
  });

  for (const [name, id] of [['services', 'vehicle-checklist-template'], ['guide', 'consultation-info-template']]) {
    await runCase(`template-copy-${name}`, async () => {
      const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 1440, height: 900 } });
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin });
      const page = await context.newPage();
      const errors = observe(page);
      try {
        await go(page, name);
        const value = await page.locator(`#${id}`).inputValue();
        assert.ok(value.includes('车辆') && value.includes('资料'));
        await page.locator(`[data-copy-template="${id}"]`).focus();
        await page.keyboard.press('Enter');
        await page.waitForFunction(() => document.querySelector('#contact-feedback').dataset.state === 'success');
        const copied = await page.evaluate(() => navigator.clipboard.readText());
        assert.equal(copied.replace(/\r\n/g, '\n'), value);
        assert.deepEqual(errors, []);
        return { keyboardCopy: true, actualClipboardMatchesTemplate: true };
      } finally { await context.close(); }
    });
    for (const mode of ['denied', 'unavailable']) {
      await runCase(`template-copy-${name}-${mode}`, async () => {
        const context = await browser.newContext({ viewport: { width: 375, height: 850 } });
        await context.addInitScript((mode) => {
          Object.defineProperty(navigator, 'clipboard', { configurable: true, value: mode === 'unavailable' ? undefined : {
            writeText: async () => { throw new DOMException('Deliberate test denial', 'NotAllowedError'); },
          } });
        }, mode);
        const page = await context.newPage();
        const errors = observe(page);
        try {
          await go(page, name);
          await page.locator(`[data-copy-template="${id}"]`).click();
          await page.waitForFunction(() => document.querySelector('#contact-feedback').dataset.state === 'error'
            && document.querySelector('#contact-feedback').textContent.includes('已选中模板'));
          const selection = await page.locator(`#${id}`).evaluate((element) => ({ focused: document.activeElement === element,
            start: element.selectionStart, end: element.selectionEnd, length: element.value.length }));
          assert.equal(selection.focused, true);
          assert.equal(selection.start, 0);
          assert.equal(selection.end, selection.length);
          assert.deepEqual(errors, []);
          return { mode, templateSelectedForManualCopy: true };
        } finally { await context.close(); }
      });
    }
  }

  await runCase('no-javascript-fallbacks', async () => {
    const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 850 } });
    const page = await context.newPage();
    const errors = observe(page);
    try {
      for (const name of pages) {
        await go(page, name);
        assert.ok((await page.locator('main').innerText()).length > 50, '关闭 JS 后应仍有正文');
        assert.equal(await page.locator('#site-menu').isVisible(), true, '关闭 JS 后手机导航应直接显示');
        assert.equal(await page.locator('#site-menu a[href$=".html"]').count(), 6);
        if (name === 'contact') assert.equal(await page.locator('[data-copy-phone]').isVisible(), false, '关闭 JS 后应隐藏无法执行的复制按钮');
        if (['services', 'guide'].includes(name)) {
          assert.equal(await page.locator('[data-copy-template]').isVisible(), false, '关闭 JS 后应隐藏模板复制按钮');
          const template = page.locator('.preparation-template textarea');
          assert.equal(await template.isVisible(), true);
          assert.ok((await template.inputValue()).includes('车辆'));
        }
        await checkPhone(page);
        await noOverflow(page);
        const original = page.locator('a[data-wechat]').first();
        assert.equal(await original.getAttribute('href'), '/assets/contact/contact-manager.png');
        const response = await context.request.get(new URL(await original.getAttribute('href'), baseUrl).href);
        assert.equal(response.status(), 200);
        assert.match(response.headers()['content-type'], /image\/png/);
      }
      await go(page, 'contact');
      await page.locator('#site-menu a[href="/guide.html"]').click();
      await page.waitForURL(address('guide'));
      assert.equal(await page.locator('h1').textContent(), '咨询与办理准备');
      await go(page, 'contact');
      await page.locator('main a[data-wechat]').first().click();
      await page.waitForURL(new URL('/assets/contact/contact-manager.png', baseUrl).href);
      assert.equal(await page.locator('img').evaluate((image) => image.naturalWidth), 960);
      await go(page, 'facilities');
      const originalLink = page.locator('a[data-lightbox]').first();
      const expected = new URL(await originalLink.getAttribute('href'), baseUrl).href;
      await originalLink.click();
      await page.waitForURL(expected);
      assert.equal(await page.locator('img').evaluate((image) => image.naturalWidth), 1080);
      assert.deepEqual(errors, []);
      return { pages: pages.length, visibleNavigation: true, realNavigation: true, contactOriginal: true, galleryOriginal: true };
    } finally { await context.close(); }
  });

  await runCase('200-percent-reflow-approximation', async () => {
    const context = await browser.newContext({ viewport: { width: 720, height: 450 }, deviceScaleFactor: 1 });
    const page = await context.newPage();
    try {
      for (const name of ['index', 'contact', 'about']) {
        await go(page, name);
        await imageCheck(page);
        await noOverflow(page);
        await checkPhone(page);
        assert.equal(await page.locator('#menu-toggle').isVisible(), true);
      }
      await screenshot(page, 'about-reflow720.png');
      return { method: '720 CSS px viewport = half of 1440 baseline; reflow approximation only', deviceScaleFactor: 1, realBrowserZoomVerified: false };
    } finally { await context.close(); }
  });

  await runCase('reduced-motion', async () => {
    const context = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    try {
      await go(page, 'index');
      assert.equal(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches), true);
      const styles = await page.locator('.gallery-image img, .button, #site-menu a').evaluateAll((elements) => elements.map((element) => {
        const style = getComputedStyle(element);
        return { transitionDuration: style.transitionDuration, animationName: style.animationName };
      }));
      assert.ok(styles.length > 0);
      for (const style of styles) {
        assert.ok(style.transitionDuration.split(',').every((duration) => Number.parseFloat(duration) <= 0.0001), '减少动态效果时过渡应接近零');
        assert.equal(style.animationName, 'none');
      }
      await go(page, 'about');
      const carouselStyles = await page.locator('[data-carousel], [data-carousel-slide]:visible img').evaluateAll((elements) => elements.map((element) => ({
        animationName: getComputedStyle(element).animationName,
        transitionDuration: getComputedStyle(element).transitionDuration,
      })));
      assert.ok(carouselStyles.every((style) => style.animationName === 'none' && style.transitionDuration.split(',').every((duration) => Number.parseFloat(duration) <= .0001)));
      await page.locator('[data-carousel-next]').click();
      await carouselIndex(page, 1);
      return { prefersReducedMotion: true, checkedElements: styles.length + carouselStyles.length, manualCarouselWorks: true };
    } finally { await context.close(); }
  });

  await runCase('unknown-route-404', async () => {
    const context = await browser.newContext();
    try {
      const response = await context.request.get(new URL('/this-page-does-not-exist.html', baseUrl).href);
      assert.equal(response.status(), 404);
      const body = await response.text();
      assert.match(body, /返回首页/);
      assert.match(body, /\/contact\.html/);
      return { status: 404, recoveryLinks: true };
    } finally { await context.close(); }
  });
} finally {
  await browser.close();
  report.passed = report.cases.every((test) => test.passed);
  report.summary = { total: report.cases.length, passed: report.cases.filter((test) => test.passed).length, failed: report.cases.filter((test) => !test.passed).length };
  fs.writeFileSync(path.join(outputDirectory, 'browser-results.json'), `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify({ ...report.summary, report: path.join(outputDirectory, 'browser-results.json') }));
  if (!report.passed) process.exitCode = 1;
}
