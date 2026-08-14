import { fail, ok } from "@/app/lib/api-response";
import { getApiUser } from "@/app/lib/api-auth";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function POST() {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return ok({ id: `${auth.user.id}:current`, provider: session?.user.app_metadata.provider ?? "email", expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null });
}
