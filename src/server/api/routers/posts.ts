import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import { posts, type Post } from "~/server/db/schema/posts";

const addUserDataToPosts = async (posts: Post[]) => {
  const users = (
    await clerkClient.users.getUserList({
      userId: posts.map((post) => post.authorId),
      limit: 100,
    })
  ).map(filterUserForClient);

  return posts.map((post) => {
    const author = users.find((user) => user.id === post.authorId);
    if (!author?.username)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Author for post not found",
      });

    return {
      post,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

// Create a new ratelimiter, that allows 3 requests per 1 minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(2, "1 m"),
  analytics: true,
});

export const postsRouter = createTRPCRouter({
  // getAll
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.db.query.posts.findMany({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return addUserDataToPosts(posts);
  }),

  //g etById
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db.query.posts.findFirst({
        where: (posts, { eq }) => eq(posts.id, input.id),
      });

      if (!post)
        throw new TRPCError({
          code: "NOT_FOUND",
        });

      return (await addUserDataToPosts([post]))[0];
    }),

  // getByUserId
  getByUserId: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(({ ctx, input }) =>
      ctx.db.query.posts
        .findMany({
          where: (posts, { eq }) => eq(posts.authorId, input.userId),
          limit: 100,
          orderBy: (posts, { desc }) => [desc(posts.createdAt)],
        })
        .then(addUserDataToPosts),
    ),

  // create
  create: privateProcedure
    .input(
      z.object({
        content: z
          .string()
          .emoji("Only emojis are allowed in posts")
          .min(1)
          .max(280),
      }),
    )
    .mutation(async ({ ctx: { userId: authorId, db }, input }) => {
      const { success } = await ratelimit.limit(authorId);
      if (!success) throw new TRPCError({ code: "TOO_MANY_REQUESTS" });
      return await db
        .insert(posts)
        .values({ authorId, content: input.content });
    }),
});
