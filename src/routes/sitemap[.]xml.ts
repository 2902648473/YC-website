import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import {
  getRequestDeploymentConfig,
  sitemapXml,
} from "../lib/deployment-config.mjs";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const xml = sitemapXml(getRequestDeploymentConfig(env, request.url));
        return new Response(xml || "Search indexing is disabled.", {
          status: xml ? 200 : 404,
          headers: {
            "Content-Type": xml
              ? "application/xml; charset=utf-8"
              : "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "X-Robots-Tag": "noindex",
          },
        });
      },
    },
  },
});
