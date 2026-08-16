import { fail, ok } from "@/app/lib/api-response";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { parseJson, enumValue, optionalString } from "@/app/lib/validation";
import { safeReturnPath } from "@/app/lib/auth-redirect";
export async function GET() { return ok({ mode: "PASSWORD_AND_OAUTH", providers: ["email", "google"], passwordRecovery: true, emailVerification: true }); }
export async function POST(request: Request) { const body = await parseJson(request); const provider = enumValue(body, "provider", ["google"] as const); const next = safeReturnPath(optionalString(body, "next", 1000)); const supabase = await createSupabaseServerClient(); const { data, error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${new URL(request.url).origin}/auth/callback?next=${encodeURIComponent(next)}` } }); return error || !data.url ? fail("OAUTH_START_FAILED", "Could not start OAuth", 502) : ok({ url: data.url }); }
