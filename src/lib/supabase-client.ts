import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client-side Supabase client using the anon key.
 * Safe to use in browser/client components.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  });
}
