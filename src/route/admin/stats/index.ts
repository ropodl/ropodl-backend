import { Hono } from 'hono';
import { db } from '../../../db/db.js';
import { blogSchema } from '../../../schema/blogs/index.js';
import { mediaSchema } from '../../../schema/media.js';
import { userSchema } from '../../../schema/users.js';
import { count, desc } from 'drizzle-orm';
import { remember } from '../../../utils/cache.js';
import { authenticate, authorize } from '../../../middleware/admin.js';

const app = new Hono();
const ADMIN_STATS_CACHE_TTL_MS = 15_000;

app.get('/', authenticate, authorize('stats.view'), async (c) => {
  try {
    const payload = await remember('admin:stats:dashboard', ADMIN_STATS_CACHE_TTL_MS, async () => {
      const [[blogsCount], [mediaCount], [usersCount], recentBlogs] = await Promise.all([
        db.select({ count: count() }).from(blogSchema),
        db.select({ count: count() }).from(mediaSchema),
        db.select({ count: count() }).from(userSchema),
        db
          .select({
            id: blogSchema.id,
            title: blogSchema.title,
            status: blogSchema.status,
            createdAt: blogSchema.createdAt,
          })
          .from(blogSchema)
          .orderBy(desc(blogSchema.createdAt))
          .limit(5),
      ]);

      return {
        counts: {
          blogs: blogsCount.count,
          media: mediaCount.count,
          users: usersCount.count,
        },
        recentBlogs,
      };
    });

    return c.json(payload);
  } catch (error) {
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

export default app;
