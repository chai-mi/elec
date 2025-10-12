import { Hono } from "hono";
import { cache } from "hono/cache";
import { zValidator } from "@hono/zod-validator";
import { and, eq, gt } from "drizzle-orm";
import { z } from "zod";
import { env, waitUntil } from "cloudflare:workers";

import { elecTable, subscribeTable, webpushTable } from "./db/schema";
import { db } from "./db/db";
import { scheduled } from "./cron";
import { appServer, vapidKeys } from "./webpush";
import { exportApplicationServerKey } from "@negrel/webpush";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

const subscription = app
  .get(
    "/subscription/key",
    async (c) => {
      const publicKey = await exportApplicationServerKey(vapidKeys);
      return c.json({ publicKey: publicKey });
    },
  )
  .post(
    "/subscription",
    zValidator(
      "json",
      z.object({
        subscription: z.object({
          endpoint: z.string(),
          expirationTime: z.number().nullable(),
          keys: z.object({
            auth: z.string(),
            p256dh: z.string(),
          }),
        }),
        userinfo: z.object({
          username: z.uuid(),
          room_ids: z.array(z.number()),
        }),
      }),
    ),
    async (c) => {
      const { subscription, userinfo } = c.req.valid("json");
      console.log(subscription);

      await db.batch([
        db.insert(webpushTable).values({
          user: userinfo.username,
          endpoint: subscription.endpoint,
          keysAuth: subscription.keys.auth,
          keysP256dh: subscription.keys.p256dh,
          expirationTime: subscription.expirationTime,
        }).onConflictDoUpdate({
          target: webpushTable.user,
          set: {
            endpoint: subscription.endpoint,
            keysAuth: subscription.keys.auth,
            keysP256dh: subscription.keys.p256dh,
            expirationTime: subscription.expirationTime,
          },
        }),
        db.delete(subscribeTable).where(eq(
          subscribeTable.user,
          userinfo.username,
        )),
        db.insert(subscribeTable).values(userinfo.room_ids.map((r) => ({
          roomId: r,
          user: userinfo.username,
        }))),
      ]);

      waitUntil(
        appServer
          .subscribe(subscription)
          .pushTextMessage(
            JSON.stringify({ title: "订阅成功" }),
            {},
          ),
      );
      return c.json({ success: true });
    },
  );

export type subscription = typeof subscription;

const front = app
  .get("/rooms", (c) => c.json(JSON.parse(env.roomids) as number[]))
  .use(
    cache({
      cacheName: "v1",
      cacheControl: "public,max-age=3600",
    }),
  )
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
      return c.json(data);
    },
  );

export type front = typeof front;

export default {
  fetch: app.fetch,
  scheduled: scheduled,
} satisfies ExportedHandler<Env>;
