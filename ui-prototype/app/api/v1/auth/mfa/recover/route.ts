import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { createSupabaseAdminClient } from "@/app/lib/supabase/admin";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { parseJson, requiredString } from "@/app/lib/validation";
import { consumeAuthRateLimits } from "@/db/auth";
import { consumeMfaRecoveryCode, revokeMfaRecoveryCodes } from "@/db/mfa-recovery";

export async function POST(request: Request) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const body = await parseJson(request);
  const code = requiredString(body, "code", 40).toUpperCase();
  const rate = await consumeAuthRateLimits("mfa-recovery", request, auth.user.id);
  if (!rate.allowed) return fail("RATE_LIMITED", "Too many recovery attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds });
  if (!await consumeMfaRecoveryCode(auth.user.id, code)) return fail("MFA_RECOVERY_INVALID", "Recovery code is invalid or already used", 400);
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.auth.admin.mfa.listFactors({ userId: auth.user.id });
  if (error) return fail("MFA_RECOVERY_FAILED", "Could not inspect MFA factors", 502);
  for (const factor of data.factors) {
    const { error: deleteError } = await admin.auth.admin.mfa.deleteFactor({ userId: auth.user.id, id: factor.id });
    if (deleteError) return fail("MFA_RECOVERY_FAILED", "Could not reset MFA factors", 502);
  }
  await revokeMfaRecoveryCodes(auth.user.id);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "others" });
  return ok({ recovered: true, enrollAgain: true });
}
