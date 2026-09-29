import { ok, fail } from "@/app/lib/api-response";
import { getApiUser } from "@/app/lib/api-auth";

export async function POST() {
  // The former implementation issued an unauthenticated OTP, returned its
  // value in the response, and never recorded a verifiable challenge. It is
  // deliberately retired until an authenticated Supabase email-change flow is
  // wired end-to-end.
  if (!(await getApiUser())) return fail("AUTH_REQUIRED", "Authentication required", 401);
  return ok({ supported: false, message: "Email change verification is not available yet." }, 410);
}
