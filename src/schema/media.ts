import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const mediaSchema = pgTable('media', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  filename: varchar('filename', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileUrl: text('file_url').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
  altText: text('alt_text'),
  uploadedBy: text('uploaded_by'),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .$onUpdate(() => new Date())
    .defaultNow()
    .notNull(),
});
