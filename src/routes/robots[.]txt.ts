import { createFileRoute } from "@tanstack/react-router";
import { env } from "cloudflare:workers";
import {
  getRequestDeploymentConfig,
  robotsText,
} from "../lib/deployment-config.mjs";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: ({ request }) =>
        new Response(robotsText(getRequestDeploymentConfig(env, request.url)), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
          },
        }),
    },
  },
});
