import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const blogTagSchema = pgTable("blog_tags",{
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("tag_name", { length: 60 }).notNull().unique(),
    slug: varchar("tag_slug", { length: 120 }).notNull(),
    excerpt: varchar("tag_excerpt", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true })
        .$onUpdate(() => new Date())
        .defaultNow()
        .notNull(),
})