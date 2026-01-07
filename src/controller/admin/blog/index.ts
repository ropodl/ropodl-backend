import type { Context } from 'hono';
import { db } from '../../../db/db.ts';
import { blogSchema } from '../../../schema/blogs/index.ts';
import { mediaSchema } from '../../../schema/media.ts';
import { count, eq } from 'drizzle-orm';

export const all = () => async (c: Context) => {
  const limit = Math.min(Number(c.req.query('limit')) || 10, 50);
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0);

  // 2. Run queries in parallel to reduce total wait time
  const [posts, countResult] = await Promise.all([
    db
      .select()
      .from(blogSchema)
      .limit(limit)
      .offset(offset),
    db.select({ total: count(blogSchema.id) }).from(blogSchema),
  ]);

  const total = countResult[0]?.total || 0;

  return c.json({
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
  const id = Number(c.req.param("id"));

  const [post] = await db
    .select({
      id: blogSchema.id,
      title: blogSchema.title,
      slug: blogSchema.slug,
      content: blogSchema.content,
      excerpt: blogSchema.excerpt,
      status: blogSchema.status,
      featured: blogSchema.featured,
      featured_image_url: mediaSchema.fileUrl,
    })
    .from(blogSchema)
    .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
    .where(eq(blogSchema.id, id))
    .limit(1);

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
  console.log(body)

  try {
    const [newPost] = await db.insert(blogSchema).values({
      title: body.title?.trim(),
      excerpt: body.excerpt?.trim(),
      slug: body.slug?.trim(),
      content: body.content?.trim(),
      featured: body.featured_image_id, // Assuming the ID is passed
      status: body.status,
    }).returning();

    return c.json({
      success: true,
      data: newPost,
    }, 201);
  } catch (error: any) {
    console.error("Create Blog Error:", error);
    if (error.code === '23505') {
      return c.json({ success: false, message: "A blog with this title or slug already exists." }, 409);
    }
    if (error.code === '23503') {
      return c.json({ success: false, message: "Invalid featured image ID." }, 400);
    }
    return c.json({ success: false, message: error.message || "Internal Server Error" }, 400);
  }
};

export const update = () => async (c: Context) => {
  const id = Number(c.req.param("id"));
  const body = await c.req.json();

  try {
    const [updatedPost] = await db.update(blogSchema)
      .set({
        title: body.title?.trim(),
        content: body.content?.trim(),
        excerpt: body.excerpt?.trim(),
        featured: body.featured_image_id,
        status: body.status,
        slug: body.slug?.trim(),
        updatedAt: new Date(),
      })
      .where(eq(blogSchema.id, id))
      .returning();

    if (!updatedPost) {
      return c.json({ success: false, message: "Blog not found" }, 404);
    }

    return c.json({
      success: true,
      data: updatedPost,
    });
  } catch (error: any) {
    console.error("Update Blog Error:", error);
    if (error.code === '23505') {
      return c.json({ success: false, message: "A blog with this title or slug already exists." }, 409);
    }
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const remove = () => async (c: Context) => {
  const id = Number(c.req.param("id"));

  const [deletedPost] = await db.delete(blogSchema)
    .where(eq(blogSchema.id, id))
    .returning();

  if (!deletedPost) {
    return c.json({ success: false, message: "Blog not found" }, 404);
  }

  return c.json({
    success: true,
    message: "Blog deleted successfully",
  });
};
