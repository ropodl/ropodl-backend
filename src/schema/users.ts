import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const userSchema = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  username: varchar("username", { length: 30 }).notNull(),
  fullname: varchar("full_name", { length: 120 }).notNull(),
  email: varchar("email_address").notNull(),
  avatar: varchar("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
