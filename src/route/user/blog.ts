import { Hono } from "hono";
import { db } from "../../db/db.ts"
import { blogSchema } from "../../schema/blogs/index.ts";
import { count, eq, and, lt, gt, desc, asc } from "drizzle-orm";
import { mediaSchema } from "../../schema/media.ts";

const app = new Hono();

app.get('/', async (c) => {
  const limit = Math.min(Number(c.req.query('limit')) || 10, 50);
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0);

  const [posts, countResult] = await Promise.all([
    db
      .select({
        id: blogSchema.id,
        title: blogSchema.title,
        slug: blogSchema.slug,
        excerpt: blogSchema.excerpt,
        status: blogSchema.status,
        createdAt: blogSchema.createdAt,
        featured_image: mediaSchema,
      })
      .from(blogSchema)
      .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
      .where(eq(blogSchema.status, "published"))
      .orderBy(desc(blogSchema.updatedAt))
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

app.get("/:slug", async (c) => {
  const slug = c.req.param('slug');

  const [post] = await db.select({
    id: blogSchema.id,
    title: blogSchema.title,
    excerpt: blogSchema.excerpt,
    content: blogSchema.content,
    featured_image: mediaSchema,
    created_at: blogSchema.createdAt
  })
    .from(blogSchema)
    .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
    .where(eq(blogSchema.slug, slug))
    .limit(1)

  if (!post) {
    return c.json({ success: false, message: "Post not found" }, 404);
  }

  const [previous, next] = await Promise.all([
    db.select({
      title: blogSchema.title,
      slug: blogSchema.slug,
      featured_image: mediaSchema,
    }).from(blogSchema)
    .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
      .where(and(
        eq(blogSchema.status, "published"),
        lt(blogSchema.createdAt, post.created_at)
      ))
      .orderBy(desc(blogSchema.createdAt))
      .limit(1)
      .then(res => res[0] || null),
    db.select({
      title: blogSchema.title,
      slug: blogSchema.slug,
      featured_image: mediaSchema,
    }).from(blogSchema)
    .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
      .where(and(
        eq(blogSchema.status, "published"),
        gt(blogSchema.createdAt, post.created_at)
      ))
      .orderBy(asc(blogSchema.createdAt))
      .limit(1)
      .then(res => res[0] || null)
  ]);

  return c.json({
    success: true,
    data: post,
    previous,
    next
  })
})

export default app;