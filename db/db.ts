import { drizzle } from "drizzle-orm/d1";
import { elecTable } from "./schema";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const { env } = await getCloudflareContext({ async: true });
export const db = drizzle(env.DB, { schema: { elecTable } });
