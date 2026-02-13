import { db } from '../../../db/db.js';
import { portfolioSchema, workTypeSchema } from '../../../schema/portfolio.js';
import { mediaSchema } from '../../../schema/media.js';
import { eq, desc, count, sql } from 'drizzle-orm';
import type { Context } from 'hono';

export const getAllPortfolios = () => async (c: Context) => {
  const page = Number(c.req.query('page') || 1);
  const perPage = Number(c.req.query('per_page') || 10);
  const offset = (page - 1) * perPage;

  const data = await db
    .select({
      id: portfolioSchema.id,
      title: portfolioSchema.title,
      slug: portfolioSchema.slug,
      status: portfolioSchema.status,
      createdAt: portfolioSchema.createdAt,
      workType: workTypeSchema.title,
    })
    .from(portfolioSchema)
    .leftJoin(workTypeSchema, eq(portfolioSchema.workTypeId, workTypeSchema.id))
    .orderBy(desc(portfolioSchema.createdAt))
    .limit(perPage)
    .offset(offset);

  const [totalCount] = await db.select({ count: count() }).from(portfolioSchema);

  return c.json({
    data,
    pagination: {
      total: totalCount.count,
      current_page: page,
      per_page: perPage,
      last_page: Math.ceil(totalCount.count / perPage),
    },
  });
};

export const getOnePortfolio = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  const [portfolio] = await db
    .select()
    .from(portfolioSchema)
    .where(eq(portfolioSchema.id, id))
    .limit(1);

  if (!portfolio) return c.json({ error: 'Not found' }, 404);
  return c.json(portfolio);
};

export const createPortfolio = () => async (c: Context) => {
  const body = await c.req.json();
  const [newPortfolio] = await db
    .insert(portfolioSchema)
    .values({
      title: body.title,
      slug: body.slug,
      content: body.content,
      featuredImageId: body.featuredImageId,
      workTypeId: body.workTypeId,
      status: body.status,
    })
    .returning();
  return c.json(newPortfolio);
};

export const updatePortfolio = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  const body = await c.req.json();
  const [updatedPortfolio] = await db
    .update(portfolioSchema)
    .set({
      title: body.title,
      slug: body.slug,
      content: body.content,
      featuredImageId: body.featuredImageId,
      workTypeId: body.workTypeId,
      status: body.status,
    })
    .where(eq(portfolioSchema.id, id))
    .returning();
  return c.json(updatedPortfolio);
};

export const deletePortfolio = () => async (c: Context) => {
  const id = Number(c.req.param('id'));
  await db.delete(portfolioSchema).where(eq(portfolioSchema.id, id));
  return c.json({ message: 'Deleted successfully' });
};
