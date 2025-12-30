import { Hono } from "hono";
import { db } from "../../db/db.ts"
import { blogSchema } from "../../schema/blogs/index.ts";
import { count, eq } from "drizzle-orm";

const app = new Hono();

app.get('/', async(c) => {
    const limit = Math.min(Number(c.req.query('limit')) || 10, 50);
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0);

    const [posts, countResult] = await Promise.all([
        db
          .select({
            id: blogSchema.id,
            title: blogSchema.title,
            createdAt: blogSchema.createdAt,
            status: blogSchema.status
          })
          .from(blogSchema)
          .where(eq(status,"published"))
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
});

export default app;