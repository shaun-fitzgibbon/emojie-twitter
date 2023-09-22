import { timestamp, varchar } from "drizzle-orm/mysql-core";
import cuid2 from "@paralleldrive/cuid2";
import { mysqlTable } from "./_table/table";

export const posts = mysqlTable("post", {
  id: varchar("id", { length: 128 })
    .$defaultFn(() => cuid2.createId())
    .unique(),
  content: varchar("content", { length: 255 }).notNull(),
  authorId: varchar("author_id", { length: 255 }).notNull(),
  createdAtUTC: timestamp("UTC_created_at").defaultNow().notNull(),
  updatedAtUTC: timestamp("UTC_updated_at").onUpdateNow(),
});

export type Post = typeof posts.$inferSelect; // return type when queried
export type NewPost = typeof posts.$inferInsert; // insert type
