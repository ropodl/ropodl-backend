import type { Context } from 'hono';
import { db } from '../../db/db.ts';
import { contactSchema } from '../../schema/contact.ts';
import { count, eq, desc } from 'drizzle-orm';

export const all = () => async (c: Context) => {
  const limit = Math.min(Number(c.req.query('limit')) || 10, 50);
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0);

  const [requests, countResult] = await Promise.all([
    db.select().from(contactSchema).limit(limit).offset(offset).orderBy(desc(contactSchema.createdAt)),
    db.select({ total: count(contactSchema.id) }).from(contactSchema),
  ]);

  const total = countResult[0]?.total || 0;

  return c.json({
    meta: {
      total,
      count: requests.length,
      limit,
      offset,
    },
    data: requests,
  });
};

export const getOne = () => async (c: Context) => {
  const id = Number(c.req.param('id'));

  const [request] = await db
    .select()
    .from(contactSchema)
    .where(eq(contactSchema.id, id))
    .limit(1);

  if (!request) {
    return c.json({ success: false, message: 'Contact request not found' }, 404);
  }

  // Auto-mark as read if unread
  if (request.status === 'unread') {
    await db.update(contactSchema).set({ status: 'read' }).where(eq(contactSchema.id, id));
    request.status = 'read';
  }

  return c.json({
    success: true,
    data: request,
  });
};

export const create = () => async (c: Context) => {
  const body = await c.req.json();
  try {
    const [newData] = await db
      .insert(contactSchema)
      .values({
        name: body.name?.trim(),
        email: body.email?.trim(),
        subject: body.subject?.trim(),
        message: body.message?.trim(),
      })
      .returning();

    return c.json({ success: true, data: newData }, 201);
  } catch (error: any) {
    return c.json({ success: false, message: error.message }, 400);
  }
};

export const updateStatus = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  
  const [updated] = await db
    .update(contactSchema)
    .set({ status: body.status, updatedAt: new Date() })
    .where(eq(contactSchema.id, id))
    .returning();

  if (!updated) {
    return c.json({ success: false, message: 'Contact request not found' }, 404);
  }

  return c.json({ success: true, data: updated });
};

export const remove = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  const [deleted] = await db
    .delete(contactSchema)
    .where(eq(contactSchema.id, id))
    .returning();
  
  if (!deleted) return c.json({ success: false, message: 'Not found' }, 404);
  return c.json({ success: true, message: 'Deleted successfully' });
};
