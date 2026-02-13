import { db } from '../../../db/db.js';
import { workTypeSchema } from '../../../schema/portfolio.js';
import { eq } from 'drizzle-orm';
import type { Context } from 'hono';

export const getAllTypes = () => async (c: Context) => {
  const types = await db.select().from(workTypeSchema);
  return c.json(types);
};

export const createType = () => async (c: Context) => {
  const body = await c.req.json();
  const [newType] = await db
    .insert(workTypeSchema)
    .values({
      title: body.title,
      slug: body.slug,
      description: body.description,
    })
    .returning();
  return c.json(newType);
};

export const updateType = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const [updatedType] = await db
    .update(workTypeSchema)
    .set({
      title: body.title,
      slug: body.slug,
      description: body.description,
    })
    .where(eq(workTypeSchema.id, id))
    .returning();
  return c.json(updatedType);
};

export const deleteType = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  await db.delete(workTypeSchema).where(eq(workTypeSchema.id, id));
  return c.json({ message: 'Deleted successfully' });
};
