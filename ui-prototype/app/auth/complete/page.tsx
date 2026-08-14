import { redirect } from "next/navigation";
import { requireAuthenticatedIdentity } from "@/app/lib/auth";
import { safeReturnPath } from "@/app/lib/auth-redirect";
export const dynamic = "force-dynamic";
export default async function Page({ searchParams }: { searchParams: Promise<{ returnTo?: string; next?: string }> }) { const params = await searchParams; const destination = safeReturnPath(params.next ?? params.returnTo); await requireAuthenticatedIdentity(destination); redirect(destination); }
