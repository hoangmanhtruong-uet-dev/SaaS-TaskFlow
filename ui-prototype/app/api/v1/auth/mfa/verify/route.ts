import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { parseJson, requiredString } from "@/app/lib/validation";
import { consumeAuthRateLimits } from "@/db/auth";
import { ensureMfaRecoveryCodes } from "@/db/mfa-recovery";

export async function POST(request: Request) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const body = await parseJson(request);
  const factorId = requiredString(body, "factorId", 100);
  const code = requiredString(body, "code", 12).replaceAll(" ", "");
  if (!/^\d{6}$/.test(code)) return fail("MFA_CODE_INVALID", "Enter the six-digit authenticator code", 400);
  const rate = await consumeAuthRateLimits("mfa", request, auth.user.id);
  if (!rate.allowed) return fail("RATE_LIMITED", "Too many MFA attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds });
  const supabase = await createSupabaseServerClient();
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) return fail("MFA_CHALLENGE_FAILED", "Could not create MFA challenge", 400);
  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
  if (error) return fail("MFA_CODE_INVALID", "Authenticator code is invalid or expired", 400);
  const recoveryCodes = await ensureMfaRecoveryCodes(auth.user.id);
  return ok({ verified: true, assuranceLevel: "aal2", recoveryCodes });
}
