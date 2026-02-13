import {
  index,
  integer,
  pgTable,
  primaryKey,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

export const userSchema = pgTable(
  'users',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    username: varchar('username', { length: 30 }).notNull().unique(),
    fullname: varchar('full_name', { length: 120 }).notNull(),
    email: varchar('email_address').notNull().unique(),
    avatar: varchar('avatar_url'),
    password: varchar('password').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .$onUpdate(() => new Date())
      .defaultNow()
      .notNull(),
  }
);
