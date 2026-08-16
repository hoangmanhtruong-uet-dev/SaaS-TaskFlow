import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function GET() {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required or session revoked", 401);
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return ok([]);
  return ok([
    { id: "current", provider: session.user.app_metadata.provider ?? "email", current: true, expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null, lastSeenAt: new Date().toISOString(), revokedAt: null, createdAt: session.user.created_at },
    { id: "others", provider: "all-other-devices", current: false, expiresAt: null, lastSeenAt: null, revokedAt: null, createdAt: null },
  ]);
}
