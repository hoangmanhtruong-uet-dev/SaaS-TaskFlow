import { fail, ok } from "@/app/lib/api-response";
import { clientAddress } from "@/app/lib/request-security";
import { hashOpaqueToken } from "@/app/lib/security";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { consumeRateLimit } from "@/db/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as { email?: string };
  const email = body.email?.trim().toLowerCase();
  if (!email) return fail("EMAIL_REQUIRED", "Email is required", 400);
  const emailHash = await hashOpaqueToken(email);
  const rate = await consumeRateLimit(`auth:verify:${clientAddress(request)}:${emailHash}`, 3, 15 * 60 * 1000);
  if (!rate.allowed) return fail("RATE_LIMITED", "Too many verification attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds });
  const supabase = await createSupabaseServerClient();
  await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: `${new URL(request.url).origin}/auth/callback?next=/app` } });
  return ok({ accepted: true }, 202);
}
