"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicEnv } from "@/app/lib/env";
import type { Database } from "@/app/lib/supabase/database.types";

export function createSupabaseBrowserClient() {
  const env = supabasePublicEnv();
  return createBrowserClient<Database>(env.supabaseUrl, env.supabasePublishableKey);
}
