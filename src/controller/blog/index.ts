import type { Context } from "hono";
import { db } from "../../db/db.ts";
import { blogSchema } from "../../schema/blogs/index.ts";

export const all = () => async(c:Context) => {
    const posts = await db.select().from(blogSchema);
    return c.json({
        count: 0,
        ...posts
    });
}