// @ts-ignore `.open-next/worker.ts` is generated at build time
import { default as handler } from "./.open-next/worker.js";

import { drizzle } from "drizzle-orm/d1";

import { elecTable } from "./db/schema.js";
import { getElec } from "./lib/cron.js";

export default {
  fetch: handler.fetch,

  async scheduled(event, env) {
    const db = drizzle(env.DB, { schema: { elecTable } });
    const roomids = JSON.parse(env.roomids) as number[];
    const timestamp = performance.now();
    for (const roomId of roomids) {
      const power = await getElec(roomId);
      await db.insert(elecTable).values({
        timestamp,
        roomId: roomId,
        power,
      });
    }
  },
} satisfies ExportedHandler<CloudflareEnv>;

// The re-export is only required if your app uses the DO Queue and DO Tag Cache
// See https://opennext.js.org/cloudflare/caching for details
// @ts-ignore `.open-next/worker.ts` is generated at build time
export { DOQueueHandler, DOShardedTagCache } from "./.open-next/worker.js";
