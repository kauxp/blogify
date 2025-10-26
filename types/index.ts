import { z } from "zod";

// Enums
export const PostStatus = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type PostStatusType = typeof PostStatus[keyof typeof PostStatus];

// Schemas
export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().optional(),
  status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED]),
  authorName: z.string().optional(),
  publishedAt: z.date().nullable().optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  categories: z.array(categorySchema).optional(),
  categoryIds: z.array(z.string()).optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(50),
  slug: z.string().min(1, "Slug is required").max(50).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only"),
});

export const updateCategorySchema = createCategorySchema.partial();

export const createPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  slug: z.string().min(1, "Slug is required").max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  content: z.string().min(1, "Content is required"),
  excerpt: z.string().max(500).optional(),
  status: z.enum([PostStatus.DRAFT, PostStatus.PUBLISHED]).default(PostStatus.DRAFT),
  authorName: z.string().max(100).optional(),
  categoryIds: z.array(z.string()).default([]),
});

export const updatePostSchema = createPostSchema.partial();

// Types
export type Category = z.infer<typeof categorySchema>;
export type Post = z.infer<typeof postSchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;
export type CreatePost = z.infer<typeof createPostSchema>;
export type UpdatePost = z.infer<typeof updatePostSchema>;