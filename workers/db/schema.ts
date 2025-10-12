import { relations } from "drizzle-orm";
import {
  index,
  int,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const elecTable = sqliteTable(
  "elec",
  {
    timestamp: int("timestamp").notNull(),
    roomId: int("room_id").notNull(),
    power: real("power").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.timestamp, table.roomId] }),
    index("time_room_idx").on(table.timestamp, table.roomId),
  ],
);

export const webpushTable = sqliteTable(
  "webpush",
  {
    user: text("user").primaryKey(),
    endpoint: text("endpoint").notNull(),
    expirationTime: int("expiration_time"),
    keysAuth: text("keys_auth").notNull(),
    keysP256dh: text("keys_p256dh").notNull(),
  },
);

export const subscribeTable = sqliteTable(
  "subscribe",
  {
    roomId: int("room_id").notNull(),
    user: text("user").notNull().references(() => webpushTable.user),
  },
  (table) => [
    index("room_idx").on(table.roomId),
    index("user_idx").on(table.user),
  ],
);

export const subscribeRelations = relations(
  subscribeTable,
  ({ one }) => ({
    webpush: one(webpushTable, {
      fields: [subscribeTable.user],
      references: [webpushTable.user],
    }),
  }),
);
