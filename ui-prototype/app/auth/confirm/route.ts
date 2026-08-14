import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { safeReturnPath } from "@/app/lib/auth-redirect";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = safeReturnPath(url.searchParams.get("next"), type === "recovery" ? "/reset-password" : "/app");
  if (tokenHash && type) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent("Liên kết xác minh không hợp lệ hoặc đã hết hạn.")}`, url.origin));
}
