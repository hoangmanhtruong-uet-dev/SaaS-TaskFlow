import type { ReactNode } from "react";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import { AppShell } from "@/app/components/layout/app-shell";
import { ensureCurrentUser, listUserWorkspaces } from "@/db/users";
import { redirect } from "next/navigation";
import { resolveProviderSession } from "@/db/auth";
export const dynamic = "force-dynamic";

export default async function ProductLayout({ children }: { children: ReactNode }) {
  const identity = await requireChatGPTUser("/app");
  const user = await ensureCurrentUser(identity);
  if (!user) redirect("/login");
  const session = await resolveProviderSession(user.id);
  if (session.kind === "revoked") redirect(chatGPTSignOutPath("/login?reason=session-revoked"));
  const [row] = await listUserWorkspaces(user.id);
  if (!row) redirect("/register");
  const workspace = { ...row, archivedAt: row.archivedAt?.toISOString() ?? null, deletionRequestedAt: row.deletionRequestedAt?.toISOString() ?? null };
  return <AppShell user={identity} workspace={workspace}>{children}</AppShell>;
}
