import { drizzle } from "drizzle-orm/d1";
import { elecTable } from "./schema";
import { env } from "cloudflare:workers";

export const db = drizzle(env.DB, { schema: { elecTable } });
