import { getApiUser, hasAal2 } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function DELETE(_: Request, { params }: { params: Promise<{ factorId: string }> }) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  if (!hasAal2(auth)) return fail("MFA_REQUIRED", "Verify MFA before removing an authenticator", 403);
  const { factorId } = await params;
  const supabase = await createSupabaseServerClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  if (!factors?.totp.some((factor) => factor.id === factorId && factor.status === "verified")) return fail("MFA_FACTOR_NOT_FOUND", "Authenticator not found", 404);
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  return error ? fail("MFA_UNENROLL_FAILED", "Could not remove authenticator", 502) : ok({ removed: true });
}
