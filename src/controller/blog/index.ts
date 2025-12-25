import type { Context } from "hono";
import { db } from "../../db/db.ts";
import { blogSchema } from "../../schema/blogs/index.ts";
import { count } from "drizzle-orm";

export const all = () => async (c: Context) => {
  const limit = Math.min(Number(c.req.query("limit")) || 10, 50);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);

  // 2. Run queries in parallel to reduce total wait time
  const [posts, countResult] = await Promise.all([
    db
      .select({
        id: blogSchema.id,
        title: blogSchema.title,
        createdAt: blogSchema.createdAt,
        status: blogSchema.status
        // Avoid selecting huge 'content' fields here
      })
      .from(blogSchema)
      .limit(limit)
      .offset(offset),
    db.select({ total: count(blogSchema.id) }).from(blogSchema),
  ]);

  const total = countResult[0]?.total || 0;

  return c.json({
    success: true,
    meta: {
      total,
      count: posts.length,
      limit,
      offset,
    },
    data: posts,
  });
};