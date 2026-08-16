import { fail, ok } from "@/app/lib/api-response";
import { consumeAuthRateLimits } from "@/db/auth";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { parseJson, requiredString } from "@/app/lib/validation";
export async function POST(request: Request) { const body = await parseJson(request); const email = requiredString(body, "email", 320).toLowerCase(); const rate = await consumeAuthRateLimits("forgot", request, email); if (!rate.allowed) return fail("RATE_LIMITED", "Too many recovery attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds }); const supabase = await createSupabaseServerClient(); await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${new URL(request.url).origin}/auth/callback?next=/reset-password` }); return ok({ accepted: true }, 202); }
