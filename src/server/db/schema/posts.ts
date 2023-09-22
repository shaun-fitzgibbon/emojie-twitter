import {
  mysqlTableCreator,
  timestamp,
  index,
  varchar,
} from "drizzle-orm/mysql-core";
import cuid2 from "@paralleldrive/cuid2";
/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const mysqlTable = mysqlTableCreator((name) => `emojie_twitter_${name}`);

export const posts = mysqlTable(
  "posts",
  {
    id: varchar("id", { length: 128 }).$defaultFn(() => cuid2.createId()),
    content: varchar("content", { length: 255 }).notNull(),
    authorId: varchar("author_id", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").onUpdateNow(),
  },
  // (table) => {
  //   return {
  //     authorIdx: index("author_idx").on(table.authorId),
  //   };
  // },
);

export type Post = typeof posts.$inferSelect; // return type when queried
export type NewPost = typeof posts.$inferInsert; // insert type
