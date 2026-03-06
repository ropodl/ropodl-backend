import type { Context } from 'hono';
import { db } from '../../../db/db.ts';
import { blogSchema } from '../../../schema/blogs/index.ts';
import { mediaSchema } from '../../../schema/media.ts';
import { blogCategorySchema } from '../../../schema/blogs/category.ts';
import { blogTagSchema } from '../../../schema/blogs/tag.ts';
import { blogToTagsSchema } from '../../../schema/blogs/junctions.ts';
import { count, eq, inArray } from 'drizzle-orm';
import { logAction } from '../../../utils/audit.ts';

export const all = () => async (c: Context) => {
  const limit = Math.min(Number(c.req.query('limit')) || 10, 50);
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0);

  // 2. Run queries in parallel to reduce total wait time
  const [posts, countResult] = await Promise.all([
    db.select().from(blogSchema).limit(limit).offset(offset),
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
  const id = Number(c.req.param('id'));

  const [post] = await db
    .select({
      id: blogSchema.id,
      title: blogSchema.title,
      slug: blogSchema.slug,
      content: blogSchema.content,
      excerpt: blogSchema.excerpt,
      status: blogSchema.status,
      featured: blogSchema.featured,
      categoryId: blogSchema.categoryId,
      featured_image_url: mediaSchema.fileUrl,
      category_name: blogCategorySchema.title,
    })
    .from(blogSchema)
    .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
    .leftJoin(blogCategorySchema, eq(blogSchema.categoryId, blogCategorySchema.id))
    .where(eq(blogSchema.id, id))
    .limit(1);

  if (!post) {
    return c.json({ success: false, message: 'Blog not found' }, 404);
  }

  // Fetch tags
  const tags = await db
    .select({
      id: blogTagSchema.id,
      title: blogTagSchema.title,
    })
    .from(blogToTagsSchema)
    .innerJoin(blogTagSchema, eq(blogToTagsSchema.tagId, blogTagSchema.id))
    .where(eq(blogToTagsSchema.blogId, id));

  return c.json({
    success: true,
    data: {
      ...post,
      tags,
    },
  });
};

export const create = () => async (c: Context) => {
  const body = await c.req.json();
  const { tagIds, ...data } = body;

  try {
    return await db.transaction(async (tx) => {
      const [newPost] = await tx
        .insert(blogSchema)
        .values({
          title: data.title?.trim(),
          excerpt: data.excerpt?.trim(),
          slug: data.slug?.trim(),
          content: data.content?.trim(),
          featured: data.featured_image_id,
          categoryId: data.categoryId,
          status: data.status,
        })
        .returning();

      if (tagIds && tagIds.length > 0) {
        await tx.insert(blogToTagsSchema).values(
          tagIds.map((tagId: number) => ({
            blogId: newPost.id,
            tagId,
          }))
        );
      }

      await logAction({
        userId: (c.get('user') as any)?.id,
        action: 'CREATE_BLOG',
        entity: 'blog',
        entityId: newPost.id,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
      });

      return c.json({ success: true, data: newPost }, 201);
    });
  } catch (error: any) {
    console.error('Create Blog Error:', error);
    if (error.code === '23505') {
      return c.json({ success: false, message: 'Existing title or slug' }, 409);
    }
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const update = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const { tagIds, ...data } = body;

  try {
    return await db.transaction(async (tx) => {
      const [updatedPost] = await tx
        .update(blogSchema)
        .set({
          title: data.title?.trim(),
          content: data.content?.trim(),
          excerpt: data.excerpt?.trim(),
          featured: data.featured_image_id,
          categoryId: data.categoryId,
          status: data.status,
          slug: data.slug?.trim(),
          updatedAt: new Date(),
        })
        .where(eq(blogSchema.id, id))
        .returning();

      if (!updatedPost) {
        return c.json({ success: false, message: 'Blog not found' }, 404);
      }

      // Update tags: delete old ones and insert new ones
      await tx.delete(blogToTagsSchema).where(eq(blogToTagsSchema.blogId, id));
      if (tagIds && tagIds.length > 0) {
        await tx.insert(blogToTagsSchema).values(
          tagIds.map((tagId: number) => ({
            blogId: id,
            tagId,
          }))
        );
      }

      await logAction({
        userId: (c.get('user') as any)?.id,
        action: 'UPDATE_BLOG',
        entity: 'blog',
        entityId: id,
        ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
      });

      return c.json({ success: true, data: updatedPost });
    });
  } catch (error: any) {
    console.error('Update Blog Error:', error);
    if (error.code === '23505') {
      return c.json({ success: false, message: 'Existing title or slug' }, 409);
    }
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const remove = () => async (c: Context) => {
  const id = Number(c.req.param('id'));

  const [deletedPost] = await db
    .delete(blogSchema)
    .where(eq(blogSchema.id, id))
    .returning();

  if (!deletedPost) {
    return c.json({ success: false, message: 'Blog not found' }, 404);
  }

  await logAction({
    userId: (c.get('user') as any)?.id,
    action: 'DELETE_BLOG',
    entity: 'blog',
    entityId: id,
    ipAddress: c.req.header('x-forwarded-for') || c.req.header('remote-addr'),
  });

  return c.json({
    success: true,
    message: 'Blog deleted successfully',
  });
};
