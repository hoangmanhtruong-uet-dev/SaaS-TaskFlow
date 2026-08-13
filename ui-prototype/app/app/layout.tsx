import type { ReactNode } from "react";
import { requireAuthenticatedIdentity } from "@/app/lib/auth";
import { AppShell } from "@/app/components/layout/app-shell";
import { ensureCurrentUser, listUserWorkspaces } from "@/db/users";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function ProductLayout({ children }: { children: ReactNode }) {
  const { identity, authUser } = await requireAuthenticatedIdentity("/app");
  const user = await ensureCurrentUser(authUser);
  if (!user) redirect("/login");
  const [row] = await listUserWorkspaces(user.id);
  if (!row) redirect("/onboarding");
  const workspace = { ...row, archivedAt: row.archivedAt?.toISOString() ?? null, deletionRequestedAt: row.deletionRequestedAt?.toISOString() ?? null };
  return <AppShell user={identity} workspace={workspace}>{children}</AppShell>;
}
