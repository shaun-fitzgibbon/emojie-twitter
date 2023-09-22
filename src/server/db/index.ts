import { Client } from "@planetscale/database";
import { drizzle } from "drizzle-orm/planetscale-serverless";

import { env } from "~/env.mjs";
import * as posts from "./schema/posts";
import * as keepAlive from "./schema/keepAlive";

const schema = { ...posts, ...keepAlive };

export const db = drizzle(
  new Client({
    url: env.DATABASE_URL,
  }).connection(),
  { schema },
);
