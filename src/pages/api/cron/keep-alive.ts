import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db/index";
import { keepAlive } from "~/server/db/schema/keepAlive";
import { Ratelimit } from "@upstash/ratelimit";

import { env } from "~/env.mjs";
import { Redis } from "@upstash/redis/nodejs";

type ResponseData = {
  message: string;
  status: number;
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "1 m"),
  analytics: true,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  // Cron Secret
  const secret = req.headers?.authorization;
  if (!secret)
    return res.status(401).json({ status: 400, message: "No secret supplied" });

  //Rate Limiter
  const { success } = await ratelimit.limit(secret);
  if (!success)
    return res.status(401).json({ status: 400, message: "No secret supplied" });

  if (secret === `Bearer ${env.CRON_SECRET}`) {
    await db.insert(keepAlive).values({ content: "Keeping db Alive" });
    res.status(201).json({ status: 201, message: "Db Updated" });
  } else {
    res.status(401).json({ status: 401, message: "Not authed Db not updated" });
  }
}
