import {
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { mediaSchema } from '../media.ts';

export const status = pgEnum('blog_status', [
  'draft',
  'published',
  'archieved',
]);

export const blogSchema = pgTable('blogs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('blog_title', { length: 60 }).notNull().unique(),
  excerpt: varchar('blog_excerpt', { length: 200 }),
  slug: varchar('blog_slug', { length: 120 }).notNull(),
  content: text('blog_content').notNull(),
  featured: integer('featured_image')
    .references(() => mediaSchema.id)
    .notNull(),
  status: status('blog_status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});
