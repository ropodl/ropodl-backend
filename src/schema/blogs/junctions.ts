import { integer, pgTable, primaryKey } from 'drizzle-orm/pg-core';
import { blogSchema } from './index.ts';
import { blogTagSchema } from './tag.ts';

export const blogToTagsSchema = pgTable('blog_to_tags', {
  blogId: integer('blog_id')
    .notNull()
    .references(() => blogSchema.id, { onDelete: 'cascade' }),
  tagId: integer('tag_id')
    .notNull()
    .references(() => blogTagSchema.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.blogId, t.tagId] }),
}));
