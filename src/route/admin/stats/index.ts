import { Hono } from 'hono';
import { db } from '../../../db/db.js';
import { blogSchema } from '../../../schema/blogs/index.js';
import { mediaSchema } from '../../../schema/media.js';
import { userSchema } from '../../../schema/users.js';
import { count, desc } from 'drizzle-orm';

const app = new Hono();

app.get('/', async (c) => {
  try {
    const [blogsCount] = await db.select({ count: count() }).from(blogSchema);
    const [mediaCount] = await db.select({ count: count() }).from(mediaSchema);
    const [usersCount] = await db.select({ count: count() }).from(userSchema);

    const recentBlogs = await db
      .select({
        id: blogSchema.id,
        title: blogSchema.title,
        status: blogSchema.status,
        createdAt: blogSchema.createdAt,
      })
      .from(blogSchema)
      .orderBy(desc(blogSchema.createdAt))
      .limit(5);

    return c.json({
      counts: {
        blogs: blogsCount.count,
        media: mediaCount.count,
        users: usersCount.count,
      },
      recentBlogs,
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

export default app;
