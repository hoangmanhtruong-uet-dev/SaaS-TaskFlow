"use client";
import { createBrowserClient } from "@supabase/ssr";
import { supabasePublicEnv } from "@/app/lib/env";
import type { Database } from "@/app/lib/supabase/database.types";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const env = supabasePublicEnv();
  browserClient = createBrowserClient<Database>(env.supabaseUrl, env.supabasePublishableKey);
  return browserClient;
}
