import { supabase } from "@/lib/supabaseClient";
import { db } from "@/server/drizzle/client";

export async function createContext() {
  return { supabase, db };
}

export type Context = Awaited<ReturnType<typeof createContext>>;