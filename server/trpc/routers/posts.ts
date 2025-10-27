import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { router, publicProcedure } from "../trpcHelpers";
import { posts, posts_categories } from "@/server/drizzle/schema";
import { get } from "http";

export type PostWithCategories = {
  id: number;
  title: string;
  content: string;
  authorName?: string;
  publishedAt?: string;
  categories: { id: number; name: string }[];
};

export const postsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(posts)
      .orderBy(desc(posts.created_at));
    return rows;
  }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [row] = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.slug, input.slug))
        .limit(1);
      return row ?? null;
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        slug: z.string(),
        categoryIds: z.array(z.number()).optional(),
        status: z.enum(["DRAFT", "PUBLISHED"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      console.log("Creating post with input:", input);
      const [created] = await ctx.db
        .insert(posts)
        .values({
          title: input.title,
          content: input.content,
          slug: input.slug,
          is_published: !!input.status && input.status === "PUBLISHED",
        })
        .returning();

      if (input.categoryIds && input.categoryIds.length) {
        const items = input.categoryIds.map((cid) => ({
          post_id: created.id,
          category_id: cid,
        }));
        await ctx.db.insert(posts_categories).values(items);
      }

      return created;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string(),
        content: z.string(),
        slug: z.string(),
        categoryIds: z.array(z.number()).optional(),
        is_published: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(posts)
        .set({
          title: input.title,
          content: input.content,
          slug: input.slug,
          is_published: input.is_published ?? false, // safer default
          updated_at: new Date(),
        })
        .where(eq(posts.id, input.id));

      if (input.categoryIds && input.categoryIds.length > 0) {
        await ctx.db
          .delete(posts_categories)
          .where(eq(posts_categories.post_id, input.id));

        const items = input.categoryIds.map((cid) => ({
          post_id: input.id,
          category_id: cid,
        }));

        await ctx.db.insert(posts_categories).values(items);
      }

      const [updatedPost] = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1);

      return updatedPost;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(posts_categories)
        .where(eq(posts_categories.post_id, input.id));
      await ctx.db.delete(posts).where(eq(posts.id, input.id));
      return { success: true };
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const post = await ctx.db
        .select()
        .from(posts)
        .where(eq(posts.id, input.id))
        .limit(1)
        .execute();
      return post[0];
    }),
});
