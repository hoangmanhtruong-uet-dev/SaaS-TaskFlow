import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { getBillingSummary } from "@/db/billing";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  const auth = await getApiUser();
  if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
  const { workspaceId } = await params;
  const summary = await getBillingSummary(workspaceId, auth.user.id);
  return summary
    ? ok(summary)
    : fail("PERMISSION_DENIED", "Chỉ Owner có thể quản lý billing", 403);
}
