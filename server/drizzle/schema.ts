import { pgTable, serial, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  slug: varchar("slug", { length: 200 }).notNull().unique(),
  is_published: boolean("is_published").notNull().default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull()
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
});

export const posts_categories = pgTable("posts_categories", {
  id: serial("id").primaryKey(),
  post_id: integer("post_id").references(() => posts.id),
  category_id: integer("category_id").references(() => categories.id)
});

