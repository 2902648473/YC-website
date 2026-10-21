import { pageDetails, type PageKey } from "../data/pages";
import { pageMetadata } from "./deployment-config.mjs";

type Settings = { siteUrl: string | null; indexing: boolean };
export function pageHead(
  key: PageKey,
  matches: Array<{ loaderData?: unknown }>,
) {
  const settings = (matches[0]?.loaderData ?? {
    siteUrl: null,
    indexing: false,
  }) as Settings;
  const metadata = pageMetadata(settings, key);
  const page = pageDetails[key];
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { name: "robots", content: metadata.robots },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "zh_CN" },
      { property: "og:site_name", content: "玉成智造" },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      ...(metadata.canonical
        ? [{ property: "og:url", content: metadata.canonical }]
        : []),
    ],
    links: metadata.canonical
      ? [{ rel: "canonical", href: metadata.canonical }]
      : [],
  };
}
