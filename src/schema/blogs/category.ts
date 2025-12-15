import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const blogCategorySchema = pgTable("blog_categories",{
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("category_name", { length: 60 }).notNull().unique(),
    slug: varchar("category_slug", { length: 120 }).notNull(),
    excerpt: varchar("category_excerpt", { length: 200 }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
})