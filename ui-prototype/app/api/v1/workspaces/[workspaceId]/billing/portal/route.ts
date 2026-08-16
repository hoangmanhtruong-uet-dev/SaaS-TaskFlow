import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { stripeEnv } from "@/app/lib/env";
import { stripeClient } from "@/app/lib/stripe";
import { getBillingSummary } from "@/db/billing";
import { consumeRateLimit } from "@/db/auth";

export async function POST(
  _: Request,
  { params }: { params: Promise<{ workspaceId: string }> },
) {
  try {
    const auth = await getApiUser();
    if (!auth) return fail("AUTH_REQUIRED", "Authentication required", 401);
    const rate = await consumeRateLimit(`billing:session:${auth.user.id}`, 10, 10 * 60 * 1000);
    if (!rate.allowed) return fail("RATE_LIMITED", "Too many billing session attempts", 429, { retryAfterSeconds: rate.retryAfterSeconds });
    const { workspaceId } = await params;
    const summary = await getBillingSummary(workspaceId, auth.user.id);
    if (!summary)
      return fail("PERMISSION_DENIED", "Chỉ Owner có thể quản lý billing", 403);
    if (!summary.customerId)
      return fail(
        "BILLING_CUSTOMER_NOT_FOUND",
        "Workspace chưa có Stripe Customer",
        404,
      );
    const session = await stripeClient().billingPortal.sessions.create({
      customer: summary.customerId,
      return_url: `${stripeEnv().NEXT_PUBLIC_SITE_URL}/app/settings`,
    });
    return ok({ url: session.url }, 201);
  } catch (error) {
    return routeError(error);
  }
}
