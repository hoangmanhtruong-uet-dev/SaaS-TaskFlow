"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/app/lib/env";
import type { Database } from "@/app/lib/supabase/database.types";

export function createSupabaseBrowserClient() {
  const env = publicEnv();
  return createBrowserClient<Database>(env.supabaseUrl, env.supabasePublishableKey);
}
