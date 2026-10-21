import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { site, navigation, steps, faqs, gallery } from "../data/site.mjs";

export type PhotoItem = {
  image: string;
  original: string;
  width: number;
  height: number;
  title: string;
  alt?: string;
  caption?: string;
};

export function Icon({ name }: { name: string }) {
  const icons: Record<string, ReactNode> = {
    phone: (
      <path d="M7 3H4.5A1.5 1.5 0 0 0 3 4.5C3 13.6 10.4 21 19.5 21a1.5 1.5 0 0 0 1.5-1.5V17l-5-2-2 2c-3.1-1.5-5.5-3.9-7-7l2-2-2-5Z" />
    ),
    wechat: (
      <>
        <path d="M21 11c0 4.4-4 8-9 8-1.2 0-2.5-.2-3.6-.6L4 21l.8-4.3A7.4 7.4 0 0 1 3 12c0-4.4 4-8 9-8s9 3 9 7Z" />
        <path d="M8 11h.01M12 11h.01M16 11h.01" strokeWidth="3" />
      </>
    ),
    arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
    check: <path d="m5 12 4 4L19 6" />,
    location: (
      <>
        <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    car: (
      <>
        <path d="m5 9 2-5h10l2 5M4 9h16v9H4zM6 18v3m12-3v3M7 13h.01M17 13h.01" />
        <path d="M1 9h3m16 0h3" />
      </>
    ),
    building: (
      <path d="M3 21h18M5 21V3h10v18m0-12h4v12M8 7h4M8 11h4M8 15h4M9 21v-2h2v2" />
    ),
    recycle: (
      <path d="m9 5 3-3 4 7M12 2l-2 6M19 10l3 5-3 5h-7m10-5h-6M9 20H3l-2-5 4-7m-2 12 3-5" />
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M3 6h18M3 12h18M3 18h18" />,
    zoom: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5M10.5 7.5v6m-3-3h6" />
      </>
    ),
  };
  return (
    <svg
      className="icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.65"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name] || icons.arrow}
    </svg>
  );
}

type MediaGallery = {
  items: PhotoItem[];
  index: number;
  onSelect: (index: number) => void;
};
type Media = {
  href: string;
  title: string;
  caption: string;
  alt: string;
  watermark?: string;
  isWechat: boolean;
  gallery?: MediaGallery;
};
type SiteInteractions = {
  openMedia: (trigger: HTMLAnchorElement, gallery?: MediaGallery) => boolean;
};
const SiteContext = createContext<SiteInteractions | null>(null);

function useSwipe(onSwipe: (direction: number) => boolean | void) {
  const gesture = useRef<{ id: number; x: number; y: number } | null>(null);
  const touches = useRef(new Set<number>());
  const suppressClickUntil = useRef(0);
  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (event.pointerType !== "touch") return;
      touches.current.add(event.pointerId);
      gesture.current =
        touches.current.size === 1 && event.isPrimary
          ? { id: event.pointerId, x: event.clientX, y: event.clientY }
          : null;
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      const start = gesture.current;
      touches.current.delete(event.pointerId);
      gesture.current = null;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.4) return;
      if (onSwipe(dx < 0 ? 1 : -1) === false) return;
      suppressClickUntil.current = Date.now() + 450;
      event.preventDefault();
    },
    onPointerCancel(event: ReactPointerEvent<HTMLElement>) {
      touches.current.delete(event.pointerId);
      gesture.current = null;
    },
    onClickCapture(event: ReactMouseEvent<HTMLElement>) {
      if (event.detail !== 0 && Date.now() < suppressClickUntil.current) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
  };
}

function isPlainClick(event: ReactMouseEvent) {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

/** React owns the interaction state. Anchors and read-only templates remain useful before hydration. */
export function SiteProvider({ children }: { children: ReactNode }) {
  const [media, setMedia] = useState<Media | null>(null);
  const [imageFailed, setImageFailed] = useState(false);
  const [feedback, setFeedback] = useState({
    message: "",
    state: "",
    visible: false,
  });
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLAnchorElement | null>(null);
  const pointerStartedOutside = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const feedbackFrame = useRef<number | undefined>(undefined);
  const mounted = useRef(false);
  const isOpen = media !== null;

  useEffect(() => {
    mounted.current = true;
    document.documentElement.classList.add("js");
    return () => {
      mounted.current = false;
      document.documentElement.classList.remove("js");
      clearTimeout(feedbackTimer.current);
      if (feedbackFrame.current !== undefined)
        cancelAnimationFrame(feedbackFrame.current);
    };
  }, []);

  const announce = useCallback((message: string, state: string) => {
    if (!mounted.current) return;
    clearTimeout(feedbackTimer.current);
    if (feedbackFrame.current !== undefined)
      cancelAnimationFrame(feedbackFrame.current);
    setFeedback({ message: "", state, visible: true });
    feedbackFrame.current = requestAnimationFrame(() => {
      setFeedback({ message, state, visible: true });
    });
    feedbackTimer.current = setTimeout(
      () => setFeedback((current) => ({ ...current, visible: false })),
      8000,
    );
  }, []);

  const openMedia = useCallback(
    (trigger: HTMLAnchorElement, galleryState?: MediaGallery) => {
      if (!dialog.current || typeof dialog.current.showModal !== "function")
        return false;
      let source: URL;
      try {
        source = new URL(trigger.href, window.location.href);
      } catch {
        return false;
      }
      if (
        source.origin !== window.location.origin ||
        !["http:", "https:"].includes(source.protocol)
      )
        return false;
      const isWechat = trigger.hasAttribute("data-wechat");
      const title =
        trigger.dataset.title ||
        (isWechat ? `微信联系${site.contactName}` : "集团工艺资料");
      let caption =
        trigger.dataset.caption ||
        (isWechat ? `请扫描二维码添加${site.contactName}的微信。` : "图片预览");
      if (isWechat && !caption.includes("保存"))
        caption += " 手机可保存联系图片后，在微信中识别二维码。";
      opener.current = trigger;
      setImageFailed(false);
      setMedia({
        href: source.href,
        title,
        caption,
        alt: isWechat
          ? `${site.contactName}的微信二维码与联系方式`
          : trigger.querySelector("img")?.alt || title,
        watermark: trigger.dataset.watermark,
        isWechat,
        gallery: galleryState,
      });
      return true;
    },
    [],
  );

  useEffect(() => {
    if (!isOpen || !dialog.current) return;
    const element = dialog.current;
    const previousOverflow = document.body.style.overflow;
    try {
      if (!element.open) element.showModal();
    } catch {
      // Preserve the useful original-image navigation if this browser cannot open a modal.
      const source = opener.current?.href;
      setMedia(null);
      if (source) window.location.assign(source);
      return;
    }
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("has-open-dialog");
    element
      .querySelector<HTMLButtonElement>("[data-dialog-close]")
      ?.focus({ preventScroll: true });
    return () => {
      if (element.open) element.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.classList.remove("has-open-dialog");
      const target = opener.current;
      opener.current = null;
      if (!target?.isConnected) return;
      const menu = target.closest<HTMLElement>("#site-menu");
      if (
        window.matchMedia("(max-width: 760px)").matches &&
        menu &&
        menu.dataset.open !== "true"
      ) {
        document.getElementById("menu-toggle")?.focus({ preventScroll: true });
      } else target.focus({ preventScroll: true });
    };
  }, [isOpen]);

  async function copyPhone(button: HTMLButtonElement) {
    const phone = button.dataset.phone || "";
    if (!phone || !/^[+\d\s()-]+$/.test(phone)) {
      announce("暂时无法复制，请直接选中页面电话号码并手动复制。", "error");
      return;
    }
    if (typeof navigator.clipboard?.writeText !== "function") {
      announce(
        `浏览器不支持直接复制，请选中号码 ${phone} 并手动复制。`,
        "error",
      );
      return;
    }
    try {
      await navigator.clipboard.writeText(phone);
      announce(`电话 ${phone} 已复制。`, "success");
    } catch {
      announce(`复制未完成，请选中号码 ${phone} 并手动复制。`, "error");
    }
  }

  async function copyTemplate(button: HTMLButtonElement) {
    const template = document.getElementById(button.dataset.copyTemplate || "");
    if (!(template instanceof HTMLTextAreaElement) || !template.value.trim()) {
      announce("模板暂时无法复制，请根据页面中的字段手动整理。", "error");
      return;
    }
    try {
      if (typeof navigator.clipboard?.writeText !== "function")
        throw new Error("Clipboard is unavailable");
      await navigator.clipboard.writeText(template.value);
      announce(
        button.dataset.copySuccess || "模板已复制，可粘贴后填写。",
        "success",
      );
    } catch {
      if (!mounted.current || !template.isConnected) return;
      template.focus();
      template.select();
      announce(
        "复制未完成，已选中模板。请使用系统复制操作后粘贴填写。",
        "error",
      );
    }
  }

  function handleClick(event: ReactMouseEvent<HTMLDivElement>) {
    if (!isPlainClick(event) || !(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>(
      "button[data-copy-phone], button[data-copy-template]",
    );
    if (button) {
      if (button.hasAttribute("data-copy-phone")) void copyPhone(button);
      else void copyTemplate(button);
      return;
    }
    const anchor = event.target.closest<HTMLAnchorElement>(
      "a[data-wechat], a[data-lightbox]",
    );
    if (anchor && openMedia(anchor)) event.preventDefault();
  }

  function moveGallery(direction: number) {
    if (!media?.gallery) return false;
    const current = media.gallery;
    const index =
      (current.index + direction + current.items.length) % current.items.length;
    const item = current.items[index];
    current.onSelect(index);
    setImageFailed(false);
    setMedia({
      ...media,
      href: item.original,
      title: item.title,
      caption: item.caption || item.title,
      alt: item.alt || `${item.title}，集团资料图`,
      gallery: { ...current, index },
    });
    return true;
  }
  const dialogSwipe = useSwipe(moveGallery);
  const outsideDialog = (event: { clientX: number; clientY: number }) => {
    const bounds = dialog.current?.getBoundingClientRect();
    return Boolean(
      bounds &&
      (event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom),
    );
  };
  const closeDialog = () => {
    if (dialog.current?.open) dialog.current.close();
    else setMedia(null);
  };

  return (
    <SiteContext.Provider value={{ openMedia }}>
      <div className="site-shell" onClick={handleClick}>
        {children}
        <div
          id="contact-feedback"
          className={`contact-feedback${feedback.visible ? " is-visible" : ""}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          data-state={feedback.state}
        >
          {feedback.message}
        </div>
        <dialog
          ref={dialog}
          id="media-dialog"
          className="media-dialog"
          aria-labelledby="dialog-title"
          data-contact-name={site.contactName}
          data-gallery-open={Boolean(media?.gallery)}
          onClose={() => setMedia(null)}
          onCancel={(event) => {
            event.preventDefault();
            closeDialog();
          }}
          onPointerDown={(event) => {
            pointerStartedOutside.current =
              event.target === event.currentTarget && outsideDialog(event);
          }}
          onClick={(event) => {
            if (
              pointerStartedOutside.current &&
              event.target === event.currentTarget &&
              outsideDialog(event)
            )
              closeDialog();
            pointerStartedOutside.current = false;
          }}
          onKeyDown={(event) => {
            if (
              media?.gallery &&
              !event.altKey &&
              !event.ctrlKey &&
              !event.metaKey &&
              !event.shiftKey &&
              ["ArrowLeft", "ArrowRight"].includes(event.key)
            ) {
              event.preventDefault();
              moveGallery(event.key === "ArrowRight" ? 1 : -1);
              return;
            }
            if (event.key !== "Tab") return;
            const controls = [
              ...event.currentTarget.querySelectorAll<HTMLElement>(
                "button:not([disabled]), a[href]",
              ),
            ].filter((element) => element.getClientRects().length > 0);
            const first = controls[0];
            const last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }}
        >
          <div className="dialog-heading">
            <h2 id="dialog-title">{media?.title || "图片预览"}</h2>
            <button
              type="button"
              className="icon-button"
              data-dialog-close=""
              aria-label="关闭图片预览"
              onClick={closeDialog}
            >
              <Icon name="close" />
            </button>
          </div>
          <div
            className="dialog-image-wrap"
            data-watermark={media?.watermark || undefined}
            {...dialogSwipe}
          >
            <img
              id="dialog-image"
              src={media?.href || undefined}
              alt={media?.alt || ""}
              width="960"
              height="1424"
              onError={() => setImageFailed(true)}
            />
          </div>
          <div
            className="dialog-gallery-controls"
            data-dialog-gallery-controls=""
            hidden={!media?.gallery}
            role="group"
            aria-label="切换图片"
          >
            <button
              type="button"
              className="dialog-gallery-button"
              data-dialog-gallery-previous=""
              aria-label="上一张图片"
              onClick={() => moveGallery(-1)}
            >
              ← 上一张
            </button>
            <p
              className="dialog-gallery-status"
              data-dialog-gallery-status=""
              role="status"
              aria-live="polite"
              aria-atomic="true"
              aria-label={
                media?.gallery
                  ? `第 ${media.gallery.index + 1} 张，共 ${media.gallery.items.length} 张：${media.title}`
                  : undefined
              }
            >
              {media?.gallery
                ? `${media.gallery.index + 1} / ${media.gallery.items.length}`
                : ""}
            </p>
            <button
              type="button"
              className="dialog-gallery-button"
              data-dialog-gallery-next=""
              aria-label="下一张图片"
              onClick={() => moveGallery(1)}
            >
              下一张 →
            </button>
          </div>
          <p id="dialog-caption" className="dialog-caption">
            {imageFailed
              ? media?.watermark
                ? "图片暂时无法载入，请关闭预览后刷新页面重试。"
                : "图片暂时无法载入，请通过“查看原图”重试。"
              : media?.caption || ""}
          </p>
          <a
            id="dialog-original"
            className="text-link"
            href={media?.href || site.wechatImage}
            hidden={Boolean(media?.watermark)}
          >
            {media?.isWechat ? "查看联系图片原图" : "查看原图"}
            <Icon name="arrow" />
          </a>
        </dialog>
      </div>
    </SiteContext.Provider>
  );
}

export function ContactButtons() {
  return (
    <div className="button-row">
      <a className="button" href={site.phoneHref}>
        <Icon name="phone" />
        电话咨询
      </a>
      <a
        className="button button-outline"
        href={site.wechatImage}
        data-wechat=""
      >
        <Icon name="wechat" />
        微信联系
      </a>
    </div>
  );
}

export function Steps() {
  return (
    <ol className="step-list">
      {steps.map(([title, text, focus], index) => (
        <li key={title}>
          <span className="step-number" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3>{title}</h3>
          {focus && (
            <p className="step-focus">
              <strong>{focus}</strong>
            </p>
          )}
          <p>{text}</p>
        </li>
      ))}
    </ol>
  );
}

export function Faq({ items = faqs }: { items?: string[][] }) {
  return (
    <div className="faq-list">
      {items.map(([question, answer]) => (
        <details key={question}>
          <summary>
            {question}
            <span className="faq-toggle" aria-hidden="true" />
          </summary>
          <div className="faq-answer">
            <p>{answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function Gallery({ items = gallery }: { items?: PhotoItem[] }) {
  return (
    <div className="gallery-grid">
      {items.map((item) => (
        <figure className="gallery-item" key={item.original}>
          <a
            className="gallery-image"
            href={item.original}
            data-lightbox=""
            data-caption={item.title}
            aria-label={`放大查看${item.title}（集团资料图）`}
          >
            <img
              src={item.image}
              width={item.width}
              height={item.height}
              alt={`${item.title}，集团资料图`}
              loading="lazy"
            />
            <span className="gallery-zoom">
              <Icon name="zoom" />
            </span>
          </a>
          <figcaption>
            <h3>{item.title}</h3>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export function Photo({
  item,
  className = "",
  priority = false,
}: {
  item: PhotoItem;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure className={`editorial-photo ${className}`}>
      <a
        className="editorial-photo-link"
        href={item.original}
        data-lightbox=""
        data-caption={item.title}
        aria-label={`放大查看${item.title}（集团资料图）`}
      >
        <img
          src={item.image}
          width={item.width}
          height={item.height}
          alt={`${item.title}，集团资料图`}
          fetchPriority={priority ? "high" : undefined}
          loading={priority ? undefined : "lazy"}
        />
        <span className="gallery-zoom">
          <Icon name="zoom" />
        </span>
      </a>
      <figcaption>
        <strong>{item.title}</strong>
      </figcaption>
    </figure>
  );
}

export function InnerHero({
  page,
}: {
  page: { heading: string; intro: string };
}) {
  return (
    <section className="inner-hero">
      <div className="container">
        <p className="breadcrumbs">
          <a href="/index.html">首页</a>
          <span aria-hidden="true">/</span>
          <span>{page.heading}</span>
        </p>
        <h1>{page.heading}</h1>
        <p>{page.intro}</p>
      </div>
      <img
        className="inner-hero-mark"
        src="/assets/brand/logo.svg"
        width="280"
        height="280"
        alt=""
        aria-hidden="true"
      />
    </section>
  );
}

export function Header({ active }: { active: string }) {
  const [open, setOpen] = useState(false);
  const menuToggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 760px)");
    const reset = () => setOpen(false);
    mobile.addEventListener("change", reset);
    return () => mobile.removeEventListener("change", reset);
  }, []);
  useEffect(() => setOpen(false), [active]);
  useEffect(() => {
    if (!open) return;
    const escape = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        !document.querySelector("dialog[open]") &&
        window.matchMedia("(max-width: 760px)").matches
      ) {
        event.preventDefault();
        setOpen(false);
        menuToggle.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", escape);
    return () => document.removeEventListener("keydown", escape);
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main-content">
        跳到主要内容
      </a>
      <header className="site-header">
        <div className="topbar">
          <div className="container topbar-inner">
            <span>
              <Icon name="location" />
              {site.region}
            </span>
          </div>
        </div>
        <div className="container masthead">
          <a className="brand" href="/index.html" aria-label="玉成智造首页">
            <img src="/assets/brand/logo.svg" width="66" height="66" alt="" />
            <span className="brand-type">
              <strong>{site.brandName}</strong>
              <span>报废汽车回收与资源循环利用</span>
            </span>
          </a>
          <div className="header-contact">
            <span className="header-phone-icon">
              <Icon name="phone" />
            </span>
            <div>
              <span>咨询电话</span>
              <a href={site.phoneHref}>{site.phone}</a>
            </div>
          </div>
          <a
            className="mobile-phone"
            href={site.phoneHref}
            aria-label={`电话咨询 ${site.phone}`}
          >
            <Icon name="phone" />
          </a>
          <button
            ref={menuToggle}
            className="menu-toggle js-only"
            id="menu-toggle"
            type="button"
            aria-controls="site-menu"
            aria-expanded={open}
            aria-label={open ? "收起导航菜单" : "展开导航菜单"}
            onClick={() =>
              setOpen(
                (current) =>
                  !current && window.matchMedia("(max-width: 760px)").matches,
              )
            }
          >
            <Icon name="menu" />
            <span>菜单</span>
          </button>
        </div>
        <div className="nav-bar">
          <nav
            id="site-menu"
            className="container main-nav"
            aria-label="主导航"
            data-open={open}
            onClick={(event) => {
              if (event.target instanceof Element && event.target.closest("a"))
                setOpen(false);
            }}
          >
            {navigation.map(([key, href, text]) => (
              <a
                key={key}
                href={href}
                aria-current={active === key ? "page" : undefined}
              >
                {text}
              </a>
            ))}
            <a className="nav-wechat" href={site.wechatImage} data-wechat="">
              <Icon name="wechat" />
              微信联系
            </a>
          </nav>
        </div>
      </header>
    </>
  );
}

export function Footer() {
  return (
    <>
      <footer className="site-footer">
        <div className="container footer-main">
          <div className="footer-brand">
            <a className="brand" href="/index.html">
              <img src="/assets/brand/logo.svg" width="52" height="52" alt="" />
              <strong>{site.brandName}</strong>
            </a>
            <p>
              立足上海嘉定
              <br />
              关注报废机动车回收与资源循环利用
            </p>
          </div>
          <div className="footer-links">
            <h2>网站导航</h2>
            <div>
              {navigation.slice(1).map(([key, href, text]) => (
                <a key={key} href={href}>
                  {text}
                </a>
              ))}
            </div>
          </div>
          <div className="footer-contact">
            <h2>联系我们</h2>
            <p className="footer-contact-name">
              {site.contactName}
              <a href={site.wechatImage} data-wechat="">
                微信联系
              </a>
            </p>
            <a className="footer-phone" href={site.phoneHref}>
              {site.phone}
            </a>
            <p>所在区域：{site.region}</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>
            © {new Date().getFullYear()} {site.brandName}
          </span>
          <span>具体业务受理范围及安排，请与业务人员确认。</span>
        </div>
      </footer>
      <nav className="mobile-contact" aria-label="快捷联系">
        <a href={site.phoneHref}>
          <Icon name="phone" />
          电话咨询
        </a>
        <a href={site.wechatImage} data-wechat="">
          <Icon name="wechat" />
          微信联系
        </a>
      </nav>
    </>
  );
}

export function SiteLayout({
  children,
  active,
}: {
  children: ReactNode;
  active: string;
}) {
  return (
    <SiteProvider>
      <Header active={active} />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <Footer />
    </SiteProvider>
  );
}

export function Carousel({
  slides,
  id = "photo-carousel",
  label = "产业与作业环境",
  className = "",
}: {
  slides: PhotoItem[];
  id?: string;
  label?: string;
  className?: string;
}) {
  const [index, setIndex] = useState(0);
  const [enhanced, setEnhanced] = useState(false);
  const thumbnails = useRef<(HTMLButtonElement | null)[]>([]);
  const interactions = useContext(SiteContext);
  useEffect(() => setEnhanced(true), []);
  const select = (next: number) => {
    const result = (next + slides.length) % slides.length;
    setIndex(result);
    return result;
  };
  const swipe = useSwipe((direction) => {
    if (!slides.length) return false;
    select(index + direction);
  });
  if (!slides.length) return null;
  const current = slides[index] || slides[0];
  return (
    <section
      className={`photo-carousel${className ? ` ${className}` : ""}`}
      id={id}
      data-carousel=""
      data-ready={enhanced ? "true" : undefined}
      data-carousel-active-index={index}
      role="region"
      aria-label={label}
      aria-roledescription={enhanced ? "图片轮播" : undefined}
      onKeyDown={(event) => {
        if (
          event.altKey ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          !["ArrowLeft", "ArrowRight"].includes(event.key)
        )
          return;
        event.preventDefault();
        const next = select(index + (event.key === "ArrowRight" ? 1 : -1));
        if (
          event.target instanceof Element &&
          event.target.closest("[data-carousel-index]")
        )
          thumbnails.current[next]?.focus({ preventScroll: true });
      }}
    >
      <div
        className="photo-carousel__viewport"
        data-carousel-viewport=""
        {...swipe}
      >
        {slides.map((slide, slideIndex) => {
          const item = enhanced && slideIndex === 0 ? current : slide;
          return (
            <figure
              key={slideIndex}
              className="photo-carousel__slide"
              data-carousel-slide=""
              hidden={enhanced && slideIndex !== 0}
              role={enhanced && slideIndex === 0 ? "group" : undefined}
              aria-roledescription={
                enhanced && slideIndex === 0 ? "图片" : undefined
              }
              aria-label={
                enhanced && slideIndex === 0
                  ? `第 ${index + 1} 张，共 ${slides.length} 张`
                  : undefined
              }
            >
              <a
                className="photo-carousel__image"
                href={item.original}
                data-lightbox=""
                data-title={item.title}
                data-caption={item.caption || item.title}
                aria-label={`放大查看${item.title}（集团资料图）`}
                onClick={(event) => {
                  if (
                    isPlainClick(event) &&
                    interactions?.openMedia(event.currentTarget, {
                      items: slides,
                      index: enhanced ? index : slideIndex,
                      onSelect: setIndex,
                    })
                  )
                    event.preventDefault();
                }}
              >
                <img
                  src={item.image}
                  width={item.width}
                  height={item.height}
                  alt={item.alt || `${item.title}，集团资料图`}
                  loading="lazy"
                  decoding="async"
                />
                <span className="gallery-zoom">
                  <Icon name="zoom" />
                </span>
              </a>
              <figcaption>
                <strong data-carousel-title="">{item.title}</strong>
              </figcaption>
            </figure>
          );
        })}
      </div>
      <div className="photo-carousel__controls js-only">
        <button
          type="button"
          className="photo-carousel__button"
          data-carousel-previous=""
          aria-label="上一张图片"
          onClick={() => select(index - 1)}
        >
          <span aria-hidden="true">←</span>上一张
        </button>
        <p
          className="photo-carousel__count"
          data-carousel-status=""
          role="status"
          aria-live="polite"
          aria-atomic="true"
          aria-label={`第 ${index + 1} 张，共 ${slides.length} 张：${current.title}`}
        >
          {index + 1} / {slides.length}
        </p>
        <button
          type="button"
          className="photo-carousel__button"
          data-carousel-next=""
          aria-label="下一张图片"
          onClick={() => select(index + 1)}
        >
          下一张<span aria-hidden="true">→</span>
        </button>
      </div>
      <div
        className="photo-carousel__thumbnails js-only"
        role="group"
        aria-label="选择图片"
      >
        {slides.map((item, itemIndex) => (
          <button
            ref={(element) => {
              thumbnails.current[itemIndex] = element;
            }}
            key={item.original}
            className="photo-carousel__thumbnail"
            type="button"
            data-carousel-index={itemIndex}
            aria-label={`查看第 ${itemIndex + 1} 张：${item.title}`}
            aria-pressed={itemIndex === index}
            onClick={() => select(itemIndex)}
          >
            <img
              src={item.image}
              width={item.width}
              height={item.height}
              alt=""
              loading="lazy"
            />
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

const vehicleFields = [
  ["车牌号／内部编号", "每辆车使用可核对的编号"],
  ["车辆类型", "按实际车辆类型填写"],
  ["所在地区", "写明实际停放地点"],
  ["能否行驶", "可行驶、不可行驶或尚不清楚"],
  ["现有资料状态", "分别写明登记证书、行驶证及号牌是否齐全"],
  ["计划批次", "按本次处置计划填写"],
  ["现场联系人", "填写可联系的现场人员"],
];
const vehicleTemplate = `${vehicleFields.map(([field]) => field).join("\t")}\n${vehicleFields.map(() => "________").join("\t")}\n${vehicleFields.map(() => "________").join("\t")}`;
const consultationText = [
  "车辆所在地：________",
  "车辆类型与数量：________",
  "目前能否行驶：________",
  "本人／代办／企业联系人：________",
  "现有资料及缺失情况：________",
  "最关心的问题：________",
].join("\n");

export function PreparationChecklist() {
  return (
    <div className="preparation-tool" aria-labelledby="vehicle-checklist-title">
      <h3 id="vehicle-checklist-title">企业车辆清单示例</h3>
      <p className="preparation-tool__intro">
        每辆车一行，分别写明所在地点和计划批次，方便逐车核对安排。
      </p>
      <p className="preparation-table-hint">左右滑动表格，查看完整字段。</p>
      <div
        className="preparation-table-scroll"
        role="region"
        aria-label="企业车辆清单字段整理提示，可横向滚动"
        tabIndex={0}
      >
        <table className="preparation-table">
          <caption className="visually-hidden">
            企业车辆清单的七个字段及填写提示
          </caption>
          <thead>
            <tr>
              {vehicleFields.map(([field]) => (
                <th key={field} scope="col">
                  {field}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {vehicleFields.map(([field, hint]) => (
                <td key={field}>{hint}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="preparation-template preparation-template--compact">
        <label htmlFor="vehicle-checklist-template">空白清单</label>
        <p id="vehicle-checklist-help" className="preparation-template__help">
          复制到电子表格后填写，按车辆数量增加行。此清单用于咨询准备。
        </p>
        <textarea
          className="preparation-template__text preparation-template__text--table"
          id="vehicle-checklist-template"
          rows={3}
          readOnly
          wrap="off"
          spellCheck={false}
          aria-describedby="vehicle-checklist-help"
          defaultValue={vehicleTemplate}
        />
        <div className="preparation-template__actions">
          <button
            className="button button-outline js-only"
            type="button"
            data-copy-template="vehicle-checklist-template"
            data-copy-success="企业车辆空白清单已复制。"
          >
            复制空白清单
          </button>
        </div>
      </div>
    </div>
  );
}

export function PreparationConsultation() {
  return (
    <div
      className="consultation-template"
      aria-labelledby="consultation-template-title"
    >
      <div className="consultation-template__intro">
        <h2 className="section-title" id="consultation-template-title">
          首次咨询信息模板
        </h2>
        <p>
          复制后补充车辆情况与最关心的问题，首次联系时可直接参照这份信息说明。
        </p>
        <p>
          暂时不清楚的项目可以注明情况；正式材料的接收人、用途与提供方式，在沟通后再确认。
        </p>
      </div>
      <div className="preparation-template">
        <label htmlFor="consultation-info-template">可复制的咨询内容</label>
        <textarea
          className="preparation-template__text"
          id="consultation-info-template"
          rows={6}
          readOnly
          spellCheck={false}
          aria-describedby="consultation-template-help"
          defaultValue={consultationText}
        />
        <div className="preparation-template__actions">
          <button
            className="button js-only"
            type="button"
            data-copy-template="consultation-info-template"
            data-copy-success="首次咨询信息模板已复制。"
          >
            复制咨询模板
          </button>
          <p
            id="consultation-template-help"
            className="preparation-template__help"
          >
            也可选中文字手动复制。
          </p>
        </div>
      </div>
    </div>
  );
}

export function IndustryOverview() {
  return (
    <section className="section" aria-labelledby="industry-map-title">
      <div className="container">
        <div className="section-heading">
          <h2 className="section-title" id="industry-map-title">
            从整车到零部件与材料
          </h2>
          <p className="section-intro">
            集团产业资料涵盖整车回收、零部件回用、再制造与资源利用。按处理对象梳理这些环节，可以更清楚地理解不同的后续方向。
          </p>
        </div>
        <div className="industry-map" aria-label="汽车循环利用产业关系">
          <div className="industry-map-origin">
            <h3>整车回收与拆解</h3>
            <p>拆解、分类，将车辆与不同资源对象对应起来</p>
          </div>
          <ul className="industry-map-branches">
            <li>
              <h4>零部件分类</h4>
              <p>按部件类型、状态和用途进一步了解适用条件</p>
              <strong>回用件 / 再制造相关路径</strong>
            </li>
            <li>
              <h4>材料分类</h4>
              <p>按材料类别和接收要求衔接后端环节</p>
              <strong>材料加工与资源利用</strong>
            </li>
          </ul>
        </div>
        <dl className="industry-paths">
          <div>
            <dt>回用件</dt>
            <dd>
              关注拆解后可进一步评估利用的零部件。集团相得易配业务资料涉及回用件仓储、销售与流通，连接部件信息和使用需求。
            </dd>
          </div>
          <div>
            <dt>再制造</dt>
            <dd>
              关注汽车总成件等对象。公司介绍中的相关业务覆盖总成件回收、拆解、再制造与再利用，需结合部件类型和状态了解接收条件。
            </dd>
          </div>
          <div>
            <dt>材料利用</dt>
            <dd>
              关注分类后的材料资源。集团资料涉及废钢与轮胎等后端加工方向，按资源类别衔接相应的加工和利用环节。
            </dd>
          </div>
        </dl>
        <p className="industry-map-note">
          具体部件和材料的适用条件、评估要求与后续去向，需结合实际情况确认。
        </p>
      </div>
    </section>
  );
}
