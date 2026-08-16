import { fail, ok } from "@/app/lib/api-response";
import { logEvent, requestIdFrom } from "@/app/lib/observability";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { parseJson, requiredString } from "@/app/lib/validation";
import { consumeAuthRateLimits } from "@/db/auth";

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  const body = await parseJson(request);
  const email = requiredString(body, "email", 320).toLowerCase();
  const password = requiredString(body, "password", 1024);
  const rate = await consumeAuthRateLimits("login", request, email);
  if (!rate.allowed) {
    logEvent("warn", "auth_login_rate_limited", { requestId });
    return fail("RATE_LIMITED", "Too many sign-in attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds });
  }
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    logEvent("warn", "auth_login_failed", { requestId });
    return fail("INVALID_CREDENTIALS", "Email or password is incorrect", 401);
  }
  const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  logEvent("info", "auth_login_succeeded", { requestId, mfaRequired: assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2" });
  return ok({ authenticated: true, mfaRequired: assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2" });
}
