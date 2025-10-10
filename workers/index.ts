import { Hono } from "hono";
import { cache } from "hono/cache";
import { zValidator } from "@hono/zod-validator";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { env } from "cloudflare:workers";

import { elecTable } from "./db/schema";
import { db } from "./db/db";
import { scheduled } from "./cron";

const app = new Hono<{ Bindings: Env }>()
  .basePath("/api")
  .get("/rooms", async (c) => {
    return c.json(JSON.parse(env.roomids) as number[], 200);
  })
  .use(cache({
    cacheName: "v1",
    cacheControl: "public,max-age=3600",
  }))
  .get(
    "/elec/:room_id",
    zValidator(
      "query",
      z.object({
        pastdays: z.string()
          .transform((val) => parseInt(val))
          .default(1)
          .pipe(z.int().min(1).max(30)),
      }),
    ),
    async (c) => {
      const room_id = parseInt(c.req.param("room_id"));
      const { pastdays } = c.req.valid("query");
      const data = await db.query.elecTable.findMany({
        where: and(
          eq(elecTable.roomId, room_id),
          gt(
            elecTable.timestamp,
            performance.now() - pastdays * 24 * 60 * 60 * 1000,
          ),
        ),
        columns: {
          roomId: false,
        },
      });
      return c.json(data, 200);
    },
  );

export type AppType = typeof app;

export default {
  fetch: app.fetch,
  scheduled: scheduled,
} satisfies ExportedHandler<Env>;
