import { redirect } from "next/navigation";
import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { establishProviderSession } from "@/db/auth";
import { ensureCurrentUser } from "@/db/users";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ returnTo?: string }> }) { const identity = await requireChatGPTUser("/auth/complete"); const user = await ensureCurrentUser(identity); if (!user) redirect("/login"); await establishProviderSession(user.id); const { returnTo } = await searchParams; redirect(returnTo?.startsWith("/invite/") ? returnTo : "/app"); }
