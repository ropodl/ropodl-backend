import type { Context } from 'hono';
import { db } from '../../../db/db.ts';
import { blogCategorySchema } from '../../../schema/blogs/category.ts';
import { eq, count } from 'drizzle-orm';

export const all = () => async (c: Context) => {
  const data = await db.select().from(blogCategorySchema);
  return c.json(data);
};

export const create = () => async (c: Context) => {
  const body = await c.req.json();
  const title = body.title?.trim();
  const slug = body.slug?.trim();

  if (!title || title.length > 60) {
    return c.json({ success: false, message: 'Title must be between 1 and 60 characters' }, 400);
  }
  if (!slug || slug.length > 120) {
    return c.json({ success: false, message: 'Invalid slug' }, 400);
  }

  try {
    const [newData] = await db
      .insert(blogCategorySchema)
      .values({
        title,
        slug,
        excerpt: body.excerpt?.trim(),
      })
      .returning();

    return c.json({ success: true, data: newData }, 201);
  } catch (error: any) {
    if (error.code === '23505') {
      return c.json({ success: false, message: 'Category already exists' }, 409);
    }
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const update = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  try {
    const [updatedData] = await db
      .update(blogCategorySchema)
      .set({
        title: body.title?.trim(),
        slug: body.slug?.trim(),
        excerpt: body.excerpt?.trim(),
        updatedAt: new Date(),
      })
      .where(eq(blogCategorySchema.id, id))
      .returning();

    if (!updatedData) return c.json({ success: false, message: 'Not found' }, 404);
    return c.json({ success: true, data: updatedData });
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const remove = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  const [deleted] = await db
    .delete(blogCategorySchema)
    .where(eq(blogCategorySchema.id, id))
    .returning();
  
  if (!deleted) return c.json({ success: false, message: 'Not found' }, 404);
  return c.json({ success: true, message: 'Deleted successfully' });
};
