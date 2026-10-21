import { site, navigation, steps, faqs, gallery } from '../data/site.mjs';

export const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const paths = {
  phone: '<path d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5C3 13.6 10.4 21 19.5 21a1.5 1.5 0 0 0 1.5-1.5V17l-5-2-2 2c-3.1-1.5-5.5-3.9-7-7l2-2-2-5Z"/>',
  wechat: '<path d="M21 11c0 4.4-4 8-9 8-1.2 0-2.5-.2-3.6-.6L4 21l.8-4.3A7.4 7.4 0 0 1 3 12c0-4.4 4-8 9-8s9 3 9 7Z"/><path d="M8 11h.01M12 11h.01M16 11h.01" stroke-width="3"/>',
  arrow: '<path d="M4 12h15m-5-5 5 5-5 5"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  location: '<path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  car: '<path d="m5 9 2-5h10l2 5M4 9h16v9H4zM6 18v3m12-3v3M7 13h.01M17 13h.01"/><path d="M1 9h3m16 0h3"/>',
  building: '<path d="M3 21h18M5 21V3h10v18m0-12h4v12M8 7h4M8 11h4M8 15h4M9 21v-2h2v2"/>',
  recycle: '<path d="m9 5 3-3 4 7M12 2l-2 6M19 10l3 5-3 5h-7m10-5h-6M9 20H3l-2-5 4-7m-2 12 3-5"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  zoom: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5M10.5 7.5v6m-3-3h6"/>',
};
export function icon(name) {
  return `<svg class="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name] || paths.arrow}</svg>`;
}

export function contactButtons() {
  return `<div class="button-row"><a class="button" href="${site.phoneHref}">${icon('phone')}电话咨询</a><a class="button button-outline" href="${site.wechatImage}" data-wechat>${icon('wechat')}微信联系</a></div>`;
}

export function stepsHtml() {
  return `<ol class="step-list">${steps.map(([title, text, focus], i) => `<li><span class="step-number" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><h3>${escapeHtml(title)}</h3>${focus ? `<p class="step-focus"><strong>${escapeHtml(focus)}</strong></p>` : ''}<p>${escapeHtml(text)}</p></li>`).join('')}</ol>`;
}

export function faqHtml(items = faqs) {
  return `<div class="faq-list">${items.map(([question, answer]) => `<details><summary>${escapeHtml(question)}<span class="faq-toggle" aria-hidden="true"></span></summary><div class="faq-answer"><p>${escapeHtml(answer)}</p></div></details>`).join('')}</div>`;
}

export function galleryHtml(items = gallery) {
  return `<div class="gallery-grid">${items.map(item => `<figure class="gallery-item"><a class="gallery-image" href="${item.original}" data-lightbox data-caption="${escapeHtml(item.title)}" aria-label="放大查看${item.title}（集团资料图）"><img src="${item.image}" width="${item.width}" height="${item.height}" alt="${item.title}，集团资料图" loading="lazy"><span class="gallery-zoom">${icon('zoom')}</span></a><figcaption><h3>${item.title}</h3></figcaption></figure>`).join('')}</div>`;
}

export function photoHtml(item, { className = '', priority = false } = {}) {
  return `<figure class="editorial-photo ${escapeHtml(className)}"><a class="editorial-photo-link" href="${item.original}" data-lightbox data-caption="${escapeHtml(item.title)}" aria-label="放大查看${escapeHtml(item.title)}（集团资料图）"><img src="${item.image}" width="${item.width}" height="${item.height}" alt="${escapeHtml(item.title)}，集团资料图" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'}><span class="gallery-zoom">${icon('zoom')}</span></a><figcaption><strong>${escapeHtml(item.title)}</strong></figcaption></figure>`;
}

export function header(active) {
  return `<a class="skip-link" href="#main-content">跳到主要内容</a>
  <header class="site-header">
    <div class="topbar"><div class="container topbar-inner"><span>${icon('location')}${site.region}</span></div></div>
    <div class="container masthead"><a class="brand" href="/index.html" aria-label="玉成智造首页"><img src="/assets/brand/logo.svg" width="66" height="66" alt=""><span class="brand-type"><strong>${site.brandName}</strong><span>报废汽车回收与资源循环利用</span></span></a><div class="header-contact"><span class="header-phone-icon">${icon('phone')}</span><div><span>咨询电话</span><a href="${site.phoneHref}">${site.phone}</a></div></div><a class="mobile-phone" href="${site.phoneHref}" aria-label="电话咨询 ${site.phone}">${icon('phone')}</a><button class="menu-toggle js-only" id="menu-toggle" type="button" aria-controls="site-menu" aria-expanded="false" aria-label="展开导航菜单">${icon('menu')}<span>菜单</span></button></div>
    <div class="nav-bar"><nav id="site-menu" class="container main-nav" aria-label="主导航">${navigation.map(([key, href, text]) => `<a href="${href}"${active === key ? ' aria-current="page"' : ''}>${text}</a>`).join('')}<a class="nav-wechat" href="${site.wechatImage}" data-wechat>${icon('wechat')}微信联系</a></nav></div>
  </header>`;
}

export function footer() {
  return `<footer class="site-footer"><div class="container footer-main"><div class="footer-brand"><a class="brand" href="/index.html"><img src="/assets/brand/logo.svg" width="52" height="52" alt=""><strong>${site.brandName}</strong></a><p>立足上海嘉定<br>关注报废机动车回收与资源循环利用</p></div><div class="footer-links"><h2>网站导航</h2><div>${navigation.slice(1).map(([, href, text]) => `<a href="${href}">${text}</a>`).join('')}</div></div><div class="footer-contact"><h2>联系我们</h2><p class="footer-contact-name">${site.contactName}<a href="${site.wechatImage}" data-wechat>微信联系</a></p><a class="footer-phone" href="${site.phoneHref}">${site.phone}</a><p>所在区域：${site.region}</p></div></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${site.brandName}</span><span>具体业务受理范围及安排，请与业务人员确认。</span></div></footer>
  <nav class="mobile-contact" aria-label="快捷联系"><a href="${site.phoneHref}">${icon('phone')}电话咨询</a><a href="${site.wechatImage}" data-wechat>${icon('wechat')}微信联系</a></nav>
  <div id="contact-feedback" class="contact-feedback" role="status" aria-live="polite" aria-atomic="true"></div>
  <dialog id="media-dialog" class="media-dialog" aria-labelledby="dialog-title" data-contact-name="${escapeHtml(site.contactName)}"><div class="dialog-heading"><h2 id="dialog-title">图片预览</h2><button type="button" class="icon-button" data-dialog-close aria-label="关闭图片预览">${icon('close')}</button></div><div class="dialog-image-wrap"><img id="dialog-image" alt="" width="960" height="1424"></div><p id="dialog-caption" class="dialog-caption"></p><a id="dialog-original" class="text-link" href="${site.wechatImage}">查看原图${icon('arrow')}</a></dialog>`;
}

export function innerHero(page) {
  return `<section class="inner-hero"><div class="container"><p class="breadcrumbs"><a href="/index.html">首页</a><span aria-hidden="true">/</span><span>${page.heading}</span></p><h1>${page.heading}</h1><p>${page.intro}</p></div><img class="inner-hero-mark" src="/assets/brand/logo.svg" width="280" height="280" alt="" aria-hidden="true"></section>`;
}
