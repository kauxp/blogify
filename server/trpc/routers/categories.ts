import { z } from "zod";
import { router, publicProcedure } from "../trpcHelpers";
import { categories } from "@/server/drizzle/schema";
import { eq, asc } from "drizzle-orm";

export const categoriesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select()
      .from(categories)
      .orderBy(asc(categories.name));
    return rows;
  }),
  create: publicProcedure
    .input(
      z.object({
        name: z.string(),
        slug: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const [created] = await ctx.db
        .insert(categories)
        .values({
          name: input.name,
          slug: input.slug,
          description: input.description,
        })
        .returning();
      return created;
    }),
  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(categories).where(eq(categories.id, input.id));
      return { success: true };
    }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const category = await ctx.db
          .select()
          .from(categories)
          .where(eq(categories.id, input.id))
          .limit(1)
          .execute();
        return category[0];
      }),
});
