import {
  int,
  sqliteTable,
  index,
  primaryKey,
  real,
} from "drizzle-orm/sqlite-core";

export const elecTable = sqliteTable(
  "elec",
  {
    timestamp: int("timestamp").notNull(),
    roomId: int("room_id").notNull(),
    power: real("power").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.roomId, table.timestamp] }),
    index("time_room_idx").on(table.roomId, table.timestamp),
  ]
);
