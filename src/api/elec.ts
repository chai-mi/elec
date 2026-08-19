import { db } from "@/db/db.ts";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

export const front = new Hono()
  .get(
    "/:room_id",
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
        where: {
          roomId: room_id,
          RAW: (table, { gt }) =>
            gt(
              table.timestamp,
              performance.now() - pastdays * 24 * 60 * 60 * 1000,
            ),
        },
        columns: {
          roomId: false,
        },
      });
      return c.json(data);
    },
  );

export type front = typeof front;
