import type { ReactNode } from "react";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useRouterState,
} from "@tanstack/react-router";
import { SiteLayout, InnerHero } from "../components/shared";
import { NotFoundPage } from "../components/pages/not-found";
import { pageDetails, type PageKey } from "../data/pages";
import { getSiteSettings } from "../lib/settings";
import stylesheet from "../styles/site.css?url";

export const Route = createRootRoute({
  loader: () => getSiteSettings(),
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "theme-color", content: "#246AA3" },
      { title: pageDetails["404"].title },
      { name: "description", content: pageDetails["404"].description },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [
      { rel: "icon", href: "/assets/brand/logo.svg", type: "image/svg+xml" },
      { rel: "stylesheet", href: stylesheet },
    ],
  }),
  shellComponent: RootDocument,
  component: Layout,
  notFoundComponent: NotFoundPage,
  errorComponent: () => (
    <main className="container section">
      <h1>页面暂时无法打开</h1>
      <p>
        请稍后刷新重试，或直接致电 <a href="tel:18321103133">18321103133</a>{" "}
        联系姚经理。
      </p>
      <a href="/">返回首页</a>
    </main>
  ),
});

function usePageKey(): PageKey {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  if (pathname === "/" || pathname === "/index.html") return "index";
  const match = pathname.match(/^\/(services|guide|facilities|about|contact)\.html$/);
  return match ? (match[1] as PageKey) : "404";
}

function Layout() {
  const key = usePageKey();
  return (
    <SiteLayout key={key} active={key}>
      {key !== "index" && <InnerHero page={pageDetails[key]} />}
      <Outlet />
    </SiteLayout>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  const key = usePageKey();
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body className={`page-${key}`}>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
