import { redirect } from "next/navigation";
import { MfaForm } from "@/app/components/mfa-form";
import { getAuthenticatedIdentity } from "@/app/lib/auth";
import { safeReturnPath } from "@/app/lib/auth-redirect";

export const dynamic = "force-dynamic";

export default async function MfaPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (!await getAuthenticatedIdentity()) redirect("/login");
  const next = safeReturnPath((await searchParams).next);
  return <main className="auth-page"><section className="auth-card"><h1>Xác minh bảo mật</h1><p>Dùng ứng dụng authenticator để bảo vệ tài khoản và các thao tác quản trị.</p><MfaForm next={next} /></section></main>;
}
