import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db/index";
import { keepAlive } from "~/server/db/schema/keepAlive";

import { env } from "~/env.mjs";

type ResponseData = {
  message: string;
  status: number;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const secret = req.headers?.authorization;
  if (!secret)
    return res.status(401).json({ status: 400, message: "No secret supplied" });

  if (secret === `Bearer ${env.CRON_SECRET}`) {
    await db.insert(keepAlive).values({ content: "Keeping db Alive" });
    res.status(201).json({ status: 201, message: "Db Updated" });
  } else {
    res.status(401).json({ status: 401, message: "Not authed Db not updated" });
  }
}
