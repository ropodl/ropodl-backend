import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { mediaSchema } from './media.ts';

export const portfolioStatus = pgEnum('portfolio_status', [
  'draft',
  'published',
  'archived',
]);

export const workTypeSchema = pgTable('work_types', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});

export const portfolioSchema = pgTable('portfolios', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  title: varchar('title', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  content: text('content').notNull(),
  featuredImageId: integer('featured_image_id')
    .references(() => mediaSchema.id)
    .notNull(),
  workTypeId: integer('work_type_id')
    .references(() => workTypeSchema.id, { onDelete: 'set null' }),
  status: portfolioStatus('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});
