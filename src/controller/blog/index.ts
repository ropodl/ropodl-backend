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

export const getOne = () => async (c: Context) => {
  const slug = c.req.param("slug");

  const post = await db.query.blogSchema.findFirst({
    where: (blogs, { eq }) => eq(blogs.slug, slug),
  });

  if (!post) {
    return c.json({ success: false, message: "Blog not found" }, 404);
  }

  return c.json({
    success: true,
    data: post,
  });
};

export const create = () => async (c: Context) => {
  const body = await c.req.json();

  try {
    const [newPost] = await db.insert(blogSchema).values({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      featured: body.featured_image_id, // Assuming the ID is passed
      status: body.status,
    }).returning();

    return c.json({
      success: true,
      data: newPost,
    }, 201);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const update = () => async (c: Context) => {
  const slug = c.req.param("slug");
  const body = await c.req.json();

  try {
    const [updatedPost] = await db.update(blogSchema)
      .set({
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        featured: body.featured_image_id,
        status: body.status,
        updatedAt: new Date(),
      })
      .where((blogs) => ({ eq: [blogs.slug, slug] }))
      .returning();

    if (!updatedPost) {
      return c.json({ success: false, message: "Blog not found" }, 404);
    }

    return c.json({
      success: true,
      data: updatedPost,
    });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const remove = () => async (c: Context) => {
  const slug = c.req.param("slug");

  const [deletedPost] = await db.delete(blogSchema)
    .where((blogs) => ({ eq: [blogs.slug, slug] }))
    .returning();

  if (!deletedPost) {
    return c.json({ success: false, message: "Blog not found" }, 404);
  }

  return c.json({
    success: true,
    message: "Blog deleted successfully",
  });
};