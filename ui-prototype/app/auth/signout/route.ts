import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/app/lib/supabase/server";
import { safeReturnPath } from "@/app/lib/auth-redirect";

export async function POST(request: Request) {
  const url = new URL(request.url);
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL(safeReturnPath(url.searchParams.get("next"), "/"), url.origin));
}
