import { createClient } from "@supabase/supabase-js";
import { supabaseAdminEnv } from "@/app/lib/env";

export const ATTACHMENTS_BUCKET = "task-attachments";

export function createSupabaseAdminClient() {
  const env = supabaseAdminEnv();
  return createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
