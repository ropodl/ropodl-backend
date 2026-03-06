import { integer, pgTable, text, timestamp, varchar, jsonb } from 'drizzle-orm/pg-core';
import { userSchema } from './users.ts';

export const auditLogSchema = pgTable('audit_logs', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id').references(() => userSchema.id),
  action: varchar('action', { length: 100 }).notNull(), // e.g., 'CREATE_BLOG', 'DELETE_MEDIA'
  entity: varchar('entity', { length: 50 }).notNull(), // e.g., 'blog', 'portfolio'
  entityId: integer('entity_id'),
  details: jsonb('details'), // Store before/after state if needed
  ipAddress: varchar('ip_address', { length: 45 }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
