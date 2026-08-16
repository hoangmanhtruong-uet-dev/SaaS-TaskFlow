import { fail, ok } from "@/app/lib/api-response";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { consumeAuthRateLimits } from "@/db/auth";
import { parseJson, requiredString } from "@/app/lib/validation";

export async function POST(request: Request) {
  const body = await parseJson(request);
  const email = requiredString(body, "email", 320).toLowerCase();
  const rate = await consumeAuthRateLimits("verify", request, email);
  if (!rate.allowed) return fail("RATE_LIMITED", "Too many verification attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds });
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/app` } });
  return ok({ accepted: true }, 202);
}
