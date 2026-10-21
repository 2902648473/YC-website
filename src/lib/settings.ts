import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { getRequestUrl } from "@tanstack/react-start/server";
import { getRequestDeploymentConfig } from "./deployment-config.mjs";

// Only public SEO settings are serialized. Bindings stay on the Worker.
export const getSiteSettings = createServerFn({ method: "GET" }).handler(() =>
  getRequestDeploymentConfig(env, getRequestUrl()),
);
