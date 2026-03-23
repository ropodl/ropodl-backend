import { Hono } from 'hono';
import { db } from '../../db/db.ts';
import { blogSchema } from '../../schema/blogs/index.ts';
import { count, eq, and, lt, gt, desc, asc, inArray } from 'drizzle-orm';
import { mediaSchema } from '../../schema/media.ts';
import { blogCategorySchema } from '../../schema/blogs/category.ts';
import { blogTagSchema } from '../../schema/blogs/tag.ts';
import { blogToTagsSchema } from '../../schema/blogs/junctions.ts';
import { remember } from '../../utils/cache.ts';

const app = new Hono();
const PUBLIC_BLOG_CACHE_TTL_MS = 30_000;

app.get('/', async (c) => {
  const limit = Math.min(Number(c.req.query('limit')) || 10, 50);
  const offset = Math.max(Number(c.req.query('offset')) || 0, 0);

  const catSlug = c.req.query('category');
  const tagSlug = c.req.query('tag');

  let whereClause = and(
    eq(blogSchema.status, 'published'),
    catSlug ? eq(blogCategorySchema.slug, catSlug) : undefined
  );

  if (tagSlug) {
    const tagBlogs = db
      .select({ blogId: blogToTagsSchema.blogId })
      .from(blogToTagsSchema)
      .innerJoin(blogTagSchema, eq(blogToTagsSchema.tagId, blogTagSchema.id))
      .where(eq(blogTagSchema.slug, tagSlug));

    whereClause = and(whereClause, inArray(blogSchema.id, tagBlogs));
  }

  const payload = await remember(
    `public:blogs:list:${c.req.url}`,
    PUBLIC_BLOG_CACHE_TTL_MS,
    async () => {
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
            category: blogCategorySchema,
          })
          .from(blogSchema)
          .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
          .leftJoin(blogCategorySchema, eq(blogSchema.categoryId, blogCategorySchema.id))
          .where(whereClause)
          .orderBy(desc(blogSchema.updatedAt))
          .limit(limit)
          .offset(offset),
        db
          .select({ total: count(blogSchema.id) })
          .from(blogSchema)
          .leftJoin(blogCategorySchema, eq(blogSchema.categoryId, blogCategorySchema.id))
          .where(whereClause),
      ]);

      return {
        success: true,
        meta: {
          total: countResult[0]?.total || 0,
          count: posts.length,
          limit,
          offset,
        },
        data: posts,
      };
    }
  );

  c.header('Cache-Control', 'public, max-age=30');
  return c.json(payload);
});

app.get('/:slug', async (c) => {
  const payload = await remember(
    `public:blogs:detail:${c.req.url}`,
    PUBLIC_BLOG_CACHE_TTL_MS,
    async () => {
      const slug = c.req.param('slug');

      const [post] = await db
        .select({
          id: blogSchema.id,
          title: blogSchema.title,
          excerpt: blogSchema.excerpt,
          content: blogSchema.content,
          featured_image: mediaSchema,
          created_at: blogSchema.createdAt,
          category: blogCategorySchema,
        })
        .from(blogSchema)
        .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
        .leftJoin(blogCategorySchema, eq(blogSchema.categoryId, blogCategorySchema.id))
        .where(and(eq(blogSchema.slug, slug), eq(blogSchema.status, 'published')))
        .limit(1);

      if (!post) {
        return null;
      }

      const [tags, previous, next] = await Promise.all([
        db
          .select({
            id: blogTagSchema.id,
            title: blogTagSchema.title,
            slug: blogTagSchema.slug,
          })
          .from(blogToTagsSchema)
          .innerJoin(blogTagSchema, eq(blogToTagsSchema.tagId, blogTagSchema.id))
          .where(eq(blogToTagsSchema.blogId, post.id)),
        db
          .select({
            title: blogSchema.title,
            slug: blogSchema.slug,
            featured_image: mediaSchema,
          })
          .from(blogSchema)
          .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
          .where(
            and(
              eq(blogSchema.status, 'published'),
              lt(blogSchema.createdAt, post.created_at)
            )
          )
          .orderBy(desc(blogSchema.createdAt))
          .limit(1)
          .then((res) => res[0] || null),
        db
          .select({
            title: blogSchema.title,
            slug: blogSchema.slug,
            featured_image: mediaSchema,
          })
          .from(blogSchema)
          .leftJoin(mediaSchema, eq(blogSchema.featured, mediaSchema.id))
          .where(
            and(
              eq(blogSchema.status, 'published'),
              gt(blogSchema.createdAt, post.created_at)
            )
          )
          .orderBy(asc(blogSchema.createdAt))
          .limit(1)
          .then((res) => res[0] || null),
      ]);

      return {
        success: true,
        data: {
          ...post,
          tags,
        },
        previous,
        next,
      };
    }
  );

  if (!payload) {
    return c.json({ success: false, message: 'Post not found' }, 404);
  }

  c.header('Cache-Control', 'public, max-age=30');
  return c.json(payload);
});

export default app;
