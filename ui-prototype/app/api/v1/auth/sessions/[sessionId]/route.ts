import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ sessionId: string }> }) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { sessionId } = await params;
  if (sessionId !== `${auth.user.id}:current`) return fail("SESSION_NOT_FOUND", "Session not found", 404);
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut({ scope: "local" });
  return error ? fail("SESSION_REVOKE_FAILED", error.message, 502) : ok({ revoked: true });
}
