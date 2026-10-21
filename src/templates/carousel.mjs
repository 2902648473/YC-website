import { escapeHtml, icon } from './components.mjs';

export function photoCarouselHtml(items, { id = 'photo-carousel', label = '产业与作业环境' } = {}) {
  if (!items?.length) return '';
  return `<section class="photo-carousel" id="${escapeHtml(id)}" data-carousel role="region" aria-label="${escapeHtml(label)}">
    <div class="photo-carousel__viewport" data-carousel-viewport>
      ${items.map((item, index) => `<figure class="photo-carousel__slide" data-carousel-slide>
        <a class="photo-carousel__image" href="${escapeHtml(item.original)}" data-lightbox data-title="${escapeHtml(item.title)}" data-caption="${escapeHtml(item.title)}" aria-label="放大查看${escapeHtml(item.title)}（集团资料图）">
          <img src="${escapeHtml(item.image)}" width="${item.width}" height="${item.height}" alt="${escapeHtml(item.alt || `${item.title}，集团资料图`)}" loading="lazy" decoding="async">
          <span class="gallery-zoom">${icon('zoom')}</span>
        </a>
        <figcaption><strong data-carousel-title>${escapeHtml(item.title)}</strong></figcaption>
      </figure>`).join('')}
    </div>
    <div class="photo-carousel__controls js-only">
      <button type="button" class="photo-carousel__button" data-carousel-previous aria-label="上一张图片"><span aria-hidden="true">←</span>上一张</button>
      <p class="photo-carousel__count" data-carousel-status role="status" aria-live="polite" aria-atomic="true">1 / ${items.length}</p>
      <button type="button" class="photo-carousel__button" data-carousel-next aria-label="下一张图片">下一张<span aria-hidden="true">→</span></button>
    </div>
    <div class="photo-carousel__thumbnails js-only" role="group" aria-label="选择图片">
      ${items.map((item, index) => `<button class="photo-carousel__thumbnail" type="button" data-carousel-index="${index}" aria-label="查看第 ${index + 1} 张：${escapeHtml(item.title)}" aria-pressed="${index === 0}"><img src="${escapeHtml(item.image)}" width="${item.width}" height="${item.height}" alt="" loading="lazy"><span>${escapeHtml(item.title)}</span></button>`).join('')}
    </div>
  </section>`;
}
