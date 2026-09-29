import { fail, ok } from "@/app/lib/api-response";
import { passwordPolicyError } from "@/app/lib/password-policy";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { parseJson, requiredString } from "@/app/lib/validation";
import { consumeAuthRateLimits } from "@/db/auth";
import { isTrustedMutationRequest } from "@/app/lib/request-security";

export async function POST(request: Request) {
  if (!isTrustedMutationRequest(request)) return fail("CSRF_REJECTED", "Cross-site request rejected", 403);
  const body = await parseJson(request);
  const email = requiredString(body, "email", 320).toLowerCase();
  const password = requiredString(body, "password", 1024);
  const fullName = requiredString(body, "fullName", 100);
  const passwordError = passwordPolicyError(password);
  if (passwordError) return fail("PASSWORD_INVALID", passwordError, 400);
  const rate = await consumeAuthRateLimits("register", request, email);
  if (!rate.allowed) return fail("RATE_LIMITED", "Too many registration attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds });
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/app` },
  });
  if (error) return fail("REGISTRATION_FAILED", "Registration could not be completed", 400);
  return ok({ accepted: true, authenticated: Boolean(data.session) }, data.session ? 200 : 202);
}
