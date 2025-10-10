import {
  index,
  int,
  primaryKey,
  real,
  sqliteTable,
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
