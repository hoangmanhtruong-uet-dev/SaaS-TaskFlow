import { fail, ok } from "@/app/lib/api-response";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { passwordPolicyError } from "@/app/lib/password-policy";
import { parseJson, requiredString } from "@/app/lib/validation";
export async function POST(request: Request) { const body = await parseJson(request); const password = requiredString(body, "password", 1024); const policyError = passwordPolicyError(password); if (policyError) return fail("PASSWORD_INVALID", policyError, 400); const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return fail("AUTH_REQUIRED", "Authentication required", 401); const { error } = await supabase.auth.updateUser({ password }); if (error) return fail("PASSWORD_RESET_FAILED", "Password could not be updated", 400); await supabase.auth.signOut({ scope: "others" }); return ok({ updated: true, otherSessionsRevoked: true }); }
