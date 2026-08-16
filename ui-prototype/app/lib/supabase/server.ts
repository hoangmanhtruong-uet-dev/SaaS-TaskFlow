import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabasePublicEnv } from "@/app/lib/env";
import type { Database } from "@/app/lib/supabase/database.types";
import { hardenedAuthCookieOptions } from "@/app/lib/supabase/cookie-options";

export async function createSupabaseServerClient() {
  const env = supabasePublicEnv(); const cookieStore = await cookies();
  return createServerClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (values) => { try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, { ...options, ...hardenedAuthCookieOptions() })); } catch { /* Server Components cannot always mutate cookies. */ } },
    },
  });
}
