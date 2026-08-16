import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";

export async function GET() {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const supabase = await createSupabaseServerClient();
  const [{ data: factors, error: factorError }, { data: assurance, error: assuranceError }] = await Promise.all([
    supabase.auth.mfa.listFactors(),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
  ]);
  if (factorError || assuranceError) return fail("MFA_STATUS_FAILED", "Could not load MFA status", 502);
  return ok({
    currentLevel: assurance.currentLevel,
    nextLevel: assurance.nextLevel,
    factors: factors.totp.map((factor) => ({ id: factor.id, friendlyName: factor.friendly_name, status: factor.status, createdAt: factor.created_at })),
  });
}

export async function POST() {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const supabase = await createSupabaseServerClient();
  const { data: listed } = await supabase.auth.mfa.listFactors();
  if (listed?.totp.some((factor) => factor.status === "verified")) return fail("MFA_ALREADY_ENROLLED", "A verified authenticator is already enrolled", 409);
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "TaskFlow Authenticator" });
  if (error) return fail("MFA_ENROLL_FAILED", "Could not start MFA enrollment", 502);
  return ok({ factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret });
}
