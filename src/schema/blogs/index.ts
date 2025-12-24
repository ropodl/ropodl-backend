import { integer, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { mediaSchema } from "../media.ts"

export const blogSchema = pgTable("blogs",{
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("blog_title", { length: 60 }).notNull().unique(),
    slug: varchar("blog_slug", { length: 120 }).notNull(),
    excerpt: varchar("blog_excerpt", { length: 200 }),
    featured: integer('featured_image').references(()=> mediaSchema.id).notNull(),
    content: text("blog_content"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
      updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
})