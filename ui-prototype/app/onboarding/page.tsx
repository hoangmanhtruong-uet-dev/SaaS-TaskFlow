import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";
import { Brand } from "@/app/components/layout/brand";
import { OnboardingForm } from "@/app/components/onboarding-form";
import { requireAuthenticatedIdentity } from "@/app/lib/auth";
import { ensureCurrentUser, listUserWorkspaces } from "@/db/users";
export const dynamic = "force-dynamic";
export default async function Page() { const { authUser } = await requireAuthenticatedIdentity("/onboarding"); const user = await ensureCurrentUser(authUser); if (!user) redirect("/login"); if ((await listUserWorkspaces(user.id)).length) redirect("/app"); return <main className="auth-stage"><section className="start-card"><Brand /><span className="auth-icon"><Building2 /></span><h1>Bắt đầu với workspace</h1><p>Tạo workspace mới, hoặc mở lại liên kết invitation nếu bạn đang được mời vào một workspace có sẵn.</p><OnboardingForm /></section></main>; }
