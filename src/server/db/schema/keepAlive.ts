import { timestamp, serial, varchar } from "drizzle-orm/mysql-core";
import { mysqlTable } from "./_table/table";

export const keepAlive = mysqlTable("keep_alive", {
  id: serial("id"),
  content: varchar("content", { length: 255 }).notNull(),
  createdAt: timestamp("UTC_created_at").defaultNow().notNull(),
});
