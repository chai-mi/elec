import { front } from "@/api/elec.ts";
import { subscription } from "@/api/subscription.ts";
import type { APIRoute } from "astro";
import { env } from "cloudflare:workers";
import { Hono } from "hono";
import { cache } from "hono/cache";

const app = new Hono().basePath("/api");

app.use(cache({
  cacheName: "v1",
  cacheControl: "public,max-age=3600",
}));

app.route("/subscription", subscription);
app.route("/elec", front);

export const ALL: APIRoute = (c) =>
  app.fetch(c.request, env, c.locals.cfContext);
export const prerender = false;
