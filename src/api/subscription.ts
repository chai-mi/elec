import { db } from "@/db/db.ts";
import { subscribeTable, webpushTable } from "@/db/schema.ts";
import { appServer, vapidKeys } from "@/utils/webpush.ts";
import { zValidator } from "@hono/zod-validator";
import { exportApplicationServerKey } from "@negrel/webpush";
import { waitUntil } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

export const subscription = new Hono()
  .get(
    "/key",
    async (c) => {
      const publicKey = await exportApplicationServerKey(vapidKeys);
      return c.json({ publicKey: publicKey });
    },
  )
  .post(
    "/",
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

      if (userinfo.room_ids.length === 0) {
        await db.batch([
          db
            .delete(subscribeTable)
            .where(eq(subscribeTable.user, userinfo.username)),
          db
            .delete(webpushTable)
            .where(eq(webpushTable.user, userinfo.username)),
        ]);
        waitUntil(
          appServer
            .subscribe(subscription)
            .pushTextMessage(
              JSON.stringify({ title: "已删除订阅" }),
              {},
            ),
        );
        return c.newResponse(null, 204);
      }

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
      return c.json({ success: true }, 201);
    },
  );

export type subscription = typeof subscription;
