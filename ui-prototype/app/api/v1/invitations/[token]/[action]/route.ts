import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { respondToInvitation } from "@/db/collaboration";

export async function POST(_: Request, { params }: { params: Promise<{ token: string; action: string }> }) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { token, action } = await params;
  if (action !== "accept" && action !== "decline") return fail("NOT_FOUND", "Action not found", 404);
  const result = await respondToInvitation(token, auth.user.id, auth.user.email, action);
  if (result.kind === "ok") return ok(result);
  const status = result.kind === "not_found" ? 404 : 409;
  return fail(`INVITATION_${result.kind.toUpperCase()}`, "Lời mời không còn khả dụng", status);
}
