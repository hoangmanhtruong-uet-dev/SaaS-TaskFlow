"use client";
import { createBrowserClient } from "@supabase/ssr";
import { publicEnv } from "@/app/lib/env";

export function createSupabaseBrowserClient() {
  const env = publicEnv();
  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
