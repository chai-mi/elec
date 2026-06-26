import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";

export const relations = defineRelations(schema, (r) => ({
  subscribeTable: {
    webpush: r.one.webpushTable({
      from: r.subscribeTable.user,
      to: r.webpushTable.user,
    }),
  },
}));
