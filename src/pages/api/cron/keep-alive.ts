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
  // if (!secret) return new Response("No secret provided", { });
  if (!secret)
    return res.status(401).json({ status: 400, message: "No secret supplied" });

  if (secret === env.CRON_SECRET) {
    const response = await db
      .insert(keepAlive)
      .values({ content: "Keeping db Alive" });

    console.log(response);

    res.status(201).json({ status: 201, message: "Db Updated" });
  } else {
    res.status(401).json({ status: 401, message: "Not authed Db not updated" });
  }
}
