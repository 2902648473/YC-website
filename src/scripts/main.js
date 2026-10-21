(() => {
  'use strict';

  function initialize() {
    const root = document.documentElement;
    const menuToggle = document.getElementById('menu-toggle');
    const menu = document.getElementById('site-menu');
    const mobile = window.matchMedia('(max-width: 760px)');

    function setMenu(open, restoreFocus = false) {
      if (!menu || !menuToggle) return;
      const expanded = mobile.matches && open;
      menu.dataset.open = String(expanded);
      menuToggle.setAttribute('aria-expanded', String(expanded));
      menuToggle.setAttribute('aria-label', expanded ? '收起导航菜单' : '展开导航菜单');
      if (restoreFocus) menuToggle.focus({ preventScroll: true });
    }

    if (menuToggle && menu) {
      setMenu(false);
      menuToggle.addEventListener('click', () => {
        setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
      });
      menu.addEventListener('click', (event) => {
        if (event.target instanceof Element && event.target.closest('a')) setMenu(false);
      });
      const resetMenu = () => setMenu(false);
      if (typeof mobile.addEventListener === 'function') mobile.addEventListener('change', resetMenu);
      else mobile.addListener(resetMenu);
    }

    function bindSwipe(element, onSwipe) {
      if (!element) return;
      let start = null;
      let suppressClickUntil = 0;
      const touches = new Set();
      element.addEventListener('pointerdown', (event) => {
        if (event.pointerType !== 'touch') return;
        touches.add(event.pointerId);
        start = touches.size === 1 && event.isPrimary
          ? { id: event.pointerId, x: event.clientX, y: event.clientY }
          : null;
      });
      element.addEventListener('pointerup', (event) => {
        const gesture = start;
        touches.delete(event.pointerId);
        start = null;
        if (!gesture || gesture.id !== event.pointerId) return;
        const deltaX = event.clientX - gesture.x;
        const deltaY = event.clientY - gesture.y;
        if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.4) return;
        if (onSwipe(deltaX < 0 ? 1 : -1) === false) return;
        suppressClickUntil = Date.now() + 450;
        event.preventDefault();
      });
      element.addEventListener('pointercancel', (event) => {
        touches.delete(event.pointerId);
        start = null;
      });
      element.addEventListener('click', (event) => {
        if (event.detail === 0 || Date.now() >= suppressClickUntil) return;
        event.preventDefault();
        event.stopImmediatePropagation();
      }, true);
    }

    const carousels = new Map();
    document.querySelectorAll('[data-carousel]').forEach((element) => {
      const slides = [...element.querySelectorAll('[data-carousel-slide]')];
      const viewport = element.querySelector('[data-carousel-viewport]');
      const trigger = slides[0]?.querySelector('a[data-lightbox]');
      const image = trigger?.querySelector('img');
      const title = slides[0]?.querySelector('[data-carousel-title]');
      const status = element.querySelector('[data-carousel-status]');
      const thumbnails = [...element.querySelectorAll('[data-carousel-index]')];
      if (!trigger || !image || !title || !status || !viewport) return;
      const items = slides.map((slide) => {
        const link = slide.querySelector('a[data-lightbox]');
        const photo = link?.querySelector('img');
        if (!link || !photo) return null;
        return {
          href: link.href,
          title: link.dataset.title || '',
          caption: link.dataset.caption || '',
          alt: photo.alt,
          image: photo.getAttribute('src'),
          width: Number(photo.getAttribute('width')),
          height: Number(photo.getAttribute('height')),
        };
      });
      if (items.some((item) => !item)) return;
      const carousel = {
        element, items, trigger, index: 0,
        select(index, { focusImage = false, announce = true } = {}) {
          this.index = (index + items.length) % items.length;
          const item = items[this.index];
          trigger.href = item.href;
          trigger.dataset.title = item.title;
          trigger.dataset.caption = item.caption;
          trigger.setAttribute('aria-label', `放大查看${item.title}（集团资料图）`);
          image.src = item.image;
          image.alt = item.alt;
          image.width = item.width;
          image.height = item.height;
          title.textContent = item.title;
          slides[0].setAttribute('aria-label', `第 ${this.index + 1} 张，共 ${items.length} 张`);
          status.textContent = `${this.index + 1} / ${items.length}`;
          status.setAttribute('aria-label', announce
            ? `第 ${this.index + 1} 张，共 ${items.length} 张：${item.title}`
            : `${this.index + 1} / ${items.length}`);
          element.dataset.carouselActiveIndex = String(this.index);
          thumbnails.forEach((button, i) => button.setAttribute('aria-pressed', String(i === this.index)));
          if (focusImage) trigger.focus({ preventScroll: true });
        },
      };
      // Keep one stable link for the enhanced view so closing a gallery returns
      // focus to the same visible trigger, even after switching the image.
      slides.forEach((slide, index) => { slide.hidden = index !== 0; });
      slides[0].setAttribute('role', 'group');
      slides[0].setAttribute('aria-roledescription', '图片');
      element.setAttribute('aria-roledescription', '图片轮播');
      element.dataset.ready = 'true';
      element.querySelector('[data-carousel-previous]')?.addEventListener('click', () => carousel.select(carousel.index - 1));
      element.querySelector('[data-carousel-next]')?.addEventListener('click', () => carousel.select(carousel.index + 1));
      thumbnails.forEach((button) => button.addEventListener('click', () => carousel.select(Number(button.dataset.carouselIndex))));
      element.addEventListener('keydown', (event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        carousel.select(carousel.index + (event.key === 'ArrowRight' ? 1 : -1));
        const thumbnail = event.target.closest('[data-carousel-index]');
        if (thumbnail) thumbnails[carousel.index]?.focus({ preventScroll: true });
      });
      bindSwipe(viewport, (direction) => carousel.select(carousel.index + direction));
      carousel.select(0, { announce: false });
      carousels.set(element, carousel);
    });

    const dialog = document.getElementById('media-dialog');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogImage = document.getElementById('dialog-image');
    const dialogCaption = document.getElementById('dialog-caption');
    const dialogOriginal = document.getElementById('dialog-original');
    const hasDialog = dialog && dialogTitle && dialogImage && dialogCaption && dialogOriginal
      && typeof dialog.showModal === 'function';
    let dialogTrigger = null;
    let previousOverflow = '';
    let pointerStartedOutside = false;
    let dialogCarousel = null;
    let dialogGalleryControls = null;
    let dialogGalleryStatus = null;

    function mediaSource(trigger) {
      try {
        const source = new URL(trigger.href, window.location.href);
        return source.origin === window.location.origin
          && ['http:', 'https:', 'file:'].includes(source.protocol) ? source : null;
      } catch {
        return null;
      }
    }

    function showMedia(trigger) {
      const source = mediaSource(trigger);
      if (!source) return false;
      const isWechat = trigger.hasAttribute('data-wechat');
      const contactName = dialog.dataset.contactName || '业务人员';
      const title = trigger.dataset.title || (isWechat ? `微信联系${contactName}` : '集团工艺资料');
      const baseCaption = trigger.dataset.caption || (isWechat
        ? `请扫描二维码添加${contactName}的微信。`
        : '图片预览');
      const caption = isWechat && !baseCaption.includes('保存')
        ? `${baseCaption} 手机可保存联系图片后，在微信中识别二维码。`
        : baseCaption;
      dialogTitle.textContent = title;
      dialogCaption.textContent = caption;
      dialogImage.alt = isWechat ? `${contactName}的微信二维码与联系方式` : (trigger.querySelector('img')?.alt || title);
      dialogImage.src = source.href;
      dialogOriginal.href = source.href;
      dialogOriginal.textContent = isWechat ? '查看联系图片原图' : '查看原图';
      const watermark = trigger.dataset.watermark;
      const imageWrap = dialogImage.parentElement;
      dialogOriginal.hidden = Boolean(watermark);
      if (watermark) imageWrap.dataset.watermark = watermark;
      else delete imageWrap.dataset.watermark;
      dialog.dataset.galleryOpen = String(Boolean(dialogCarousel));
      if (dialogGalleryControls) dialogGalleryControls.hidden = !dialogCarousel;
      if (dialogCarousel && dialogGalleryStatus) {
        dialogGalleryStatus.textContent = `${dialogCarousel.index + 1} / ${dialogCarousel.items.length}`;
        dialogGalleryStatus.setAttribute('aria-label', `第 ${dialogCarousel.index + 1} 张，共 ${dialogCarousel.items.length} 张：${title}`);
      }
      return true;
    }

    function moveDialogGallery(direction) {
      if (!dialogCarousel || !dialog.open) return false;
      dialogCarousel.select(dialogCarousel.index + direction);
      return showMedia(dialogCarousel.trigger);
    }

    function restoreDialogFocus() {
      document.body.style.overflow = previousOverflow;
      root.classList.remove('has-open-dialog');
      const target = dialogTrigger;
      dialogTrigger = null;
      dialogCarousel = null;
      dialog.dataset.galleryOpen = 'false';
      if (dialogGalleryControls) dialogGalleryControls.hidden = true;
      if (!target || !target.isConnected) return;
      if (mobile.matches && menu && menu.contains(target) && menu.dataset.open !== 'true') {
        menuToggle?.focus({ preventScroll: true });
      } else target.focus({ preventScroll: true });
    }

    if (hasDialog) {
      if (carousels.size) {
        dialogGalleryControls = document.createElement('div');
        dialogGalleryControls.className = 'dialog-gallery-controls';
        dialogGalleryControls.dataset.dialogGalleryControls = '';
        dialogGalleryControls.hidden = true;
        dialogGalleryControls.setAttribute('role', 'group');
        dialogGalleryControls.setAttribute('aria-label', '切换图片');
        const previous = document.createElement('button');
        previous.type = 'button';
        previous.className = 'dialog-gallery-button';
        previous.dataset.dialogGalleryPrevious = '';
        previous.textContent = '← 上一张';
        previous.setAttribute('aria-label', '上一张图片');
        previous.addEventListener('click', () => moveDialogGallery(-1));
        dialogGalleryStatus = document.createElement('p');
        dialogGalleryStatus.className = 'dialog-gallery-status';
        dialogGalleryStatus.dataset.dialogGalleryStatus = '';
        dialogGalleryStatus.setAttribute('role', 'status');
        dialogGalleryStatus.setAttribute('aria-live', 'polite');
        dialogGalleryStatus.setAttribute('aria-atomic', 'true');
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'dialog-gallery-button';
        next.dataset.dialogGalleryNext = '';
        next.textContent = '下一张 →';
        next.setAttribute('aria-label', '下一张图片');
        next.addEventListener('click', () => moveDialogGallery(1));
        dialogGalleryControls.append(previous, dialogGalleryStatus, next);
        dialogImage.parentElement.after(dialogGalleryControls);
        bindSwipe(dialogImage.parentElement, moveDialogGallery);
      }
      dialog.addEventListener('close', restoreDialogFocus);
      dialog.addEventListener('keydown', (event) => {
        if (dialogCarousel && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey
          && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
          event.preventDefault();
          moveDialogGallery(event.key === 'ArrowRight' ? 1 : -1);
          return;
        }
        if (event.key !== 'Tab') return;
        const controls = [...dialog.querySelectorAll('button:not([disabled]), a[href]')]
          .filter((element) => element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (!first) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      dialog.querySelectorAll('[data-dialog-close]').forEach((button) => {
        button.addEventListener('click', () => dialog.close());
      });
      const outsideDialog = (event) => {
        const bounds = dialog.getBoundingClientRect();
        return event.clientX < bounds.left || event.clientX > bounds.right
          || event.clientY < bounds.top || event.clientY > bounds.bottom;
      };
      dialog.addEventListener('pointerdown', (event) => {
        pointerStartedOutside = event.target === dialog && outsideDialog(event);
      });
      dialog.addEventListener('click', (event) => {
        if (pointerStartedOutside && event.target === dialog && outsideDialog(event)) dialog.close();
        pointerStartedOutside = false;
      });
      dialogImage.addEventListener('error', () => {
        dialogCaption.textContent = dialogOriginal.hidden
          ? '图片暂时无法载入，请关闭预览后刷新页面重试。'
          : '图片暂时无法载入，请通过“查看原图”重试。';
      });
    }

    document.addEventListener('click', (event) => {
      if (!hasDialog || event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
        || !(event.target instanceof Element)) return;
      const trigger = event.target.closest('a[data-wechat], a[data-lightbox]');
      if (!trigger) return;
      if (!mediaSource(trigger)) return;
      dialogCarousel = carousels.get(trigger.closest('[data-carousel]')) || null;
      if (!showMedia(trigger)) return;
      dialogTrigger = trigger;
      previousOverflow = document.body.style.overflow;
      try {
        dialog.showModal();
      } catch {
        dialogTrigger = null;
        return;
      }
      event.preventDefault();
      document.body.style.overflow = 'hidden';
      root.classList.add('has-open-dialog');
      dialog.querySelector('[data-dialog-close]')?.focus({ preventScroll: true });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !dialog?.open && mobile.matches
        && menuToggle?.getAttribute('aria-expanded') === 'true') {
        event.preventDefault();
        setMenu(false, true);
      }
    });

    const feedback = document.getElementById('contact-feedback');
    let feedbackTimer;
    let announcementFrame;
    function announce(message, state) {
      if (!feedback) return;
      clearTimeout(feedbackTimer);
      cancelAnimationFrame(announcementFrame);
      feedback.textContent = '';
      feedback.dataset.state = state;
      feedback.classList.add('is-visible');
      announcementFrame = requestAnimationFrame(() => { feedback.textContent = message; });
      feedbackTimer = setTimeout(() => feedback.classList.remove('is-visible'), 8000);
    }

    document.querySelectorAll('[data-copy-phone]').forEach((button) => {
      button.addEventListener('click', async () => {
        const phone = button.dataset.phone || '';
        if (!phone || !/^[+\d\s()-]+$/.test(phone)) {
          announce('暂时无法复制，请直接选中页面电话号码并手动复制。', 'error');
          return;
        }
        if (typeof navigator.clipboard?.writeText !== 'function') {
          announce(`浏览器不支持直接复制，请选中号码 ${phone} 并手动复制。`, 'error');
          return;
        }
        try {
          await navigator.clipboard.writeText(phone);
          announce(`电话 ${phone} 已复制。`, 'success');
        } catch {
          announce(`复制未完成，请选中号码 ${phone} 并手动复制。`, 'error');
        }
      });
    });

    document.querySelectorAll('[data-copy-template]').forEach((button) => {
      button.addEventListener('click', async () => {
        const template = document.getElementById(button.dataset.copyTemplate || '');
        if (!(template instanceof HTMLTextAreaElement) || !template.value.trim()) {
          announce('模板暂时无法复制，请根据页面中的字段手动整理。', 'error');
          return;
        }
        const selectTemplate = () => {
          template.focus();
          template.select();
          announce('复制未完成，已选中模板。请使用系统复制操作后粘贴填写。', 'error');
        };
        if (typeof navigator.clipboard?.writeText !== 'function') {
          selectTemplate();
          return;
        }
        try {
          await navigator.clipboard.writeText(template.value);
          announce(button.dataset.copySuccess || '模板已复制，可粘贴后填写。', 'success');
        } catch {
          selectTemplate();
        }
      });
    });

    root.classList.add('js');
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
