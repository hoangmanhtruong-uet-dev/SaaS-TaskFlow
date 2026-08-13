import { fail, ok } from "@/app/lib/api-response";
import { clientAddress } from "@/app/lib/request-security";
import { consumeRateLimit } from "@/db/auth";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
export async function POST(request: Request) { const rate = await consumeRateLimit(`auth:forgot:${clientAddress(request)}`, 5, 15 * 60 * 1000); if (!rate.allowed) return fail("RATE_LIMITED", "Too many recovery attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds }); const body = await request.json().catch(() => ({})) as { email?: string }; const email = body.email?.trim().toLowerCase(); if (!email) return fail("EMAIL_REQUIRED", "Email is required", 400); const supabase = await createSupabaseServerClient(); await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${new URL(request.url).origin}/auth/callback?next=/reset-password` }); return ok({ accepted: true }, 202); }
