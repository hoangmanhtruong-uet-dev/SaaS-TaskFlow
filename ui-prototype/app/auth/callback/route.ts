import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { safeReturnPath } from "@/app/lib/auth-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeReturnPath(url.searchParams.get("next"));
  if (code) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const { data: assurance } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const destination = assurance?.nextLevel === "aal2" && assurance.currentLevel !== "aal2" ? `/auth/mfa?next=${encodeURIComponent(next)}` : next;
      return NextResponse.redirect(new URL(destination, url.origin));
    }
  }
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Liên kết xác thực không hợp lệ hoặc đã hết hạn.")}&next=${encodeURIComponent(next)}`, url.origin));
}
