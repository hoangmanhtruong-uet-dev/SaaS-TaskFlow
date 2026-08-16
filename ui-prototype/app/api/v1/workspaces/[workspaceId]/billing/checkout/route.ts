import { getApiUser } from "@/app/lib/api-auth";
import { fail, ok } from "@/app/lib/api-response";
import { routeError } from "@/app/lib/route-handler";
import { stripeEnv } from "@/app/lib/env";
import { stripeClient } from "@/app/lib/stripe";
import { parseJson } from "@/app/lib/validation";
import { getBillingSummary } from "@/db/billing";
import { consumeRateLimit } from "@/db/auth";

export async function POST(
  request: Request,
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
      return fail(
        "PERMISSION_DENIED",
        "Chỉ Owner có thể nâng cấp workspace",
        403,
      );
    if (summary.plan === "PRO")
      return fail(
        "SUBSCRIPTION_ALREADY_ACTIVE",
        "Workspace đã có gói Pro. Hãy dùng Billing Portal để thay đổi.",
        409,
      );

    const body = await parseJson(request);
    const minimumSeats = Math.max(
      1,
      summary.activeMembers + summary.pendingInvitations,
    );
    const seats = Number(body.seats ?? minimumSeats);
    if (!Number.isInteger(seats) || seats < minimumSeats || seats > 999) {
      return fail(
        "SEAT_QUANTITY_INVALID",
        `Số seat phải từ ${minimumSeats} đến 999`,
        400,
        { minimumSeats },
      );
    }

    const env = stripeEnv();
    const session = await stripeClient().checkout.sessions.create(
      {
        mode: "subscription",
        customer: summary.customerId ?? undefined,
        customer_email: summary.customerId ? undefined : auth.user.email,
        client_reference_id: workspaceId,
        line_items: [{ price: env.STRIPE_PRICE_PRO_MONTHLY, quantity: seats }],
        metadata: { workspaceId, ownerUserId: auth.user.id },
        subscription_data: {
          metadata: { workspaceId, ownerUserId: auth.user.id },
        },
        allow_promotion_codes: true,
        billing_address_collection: "auto",
        success_url: `${env.NEXT_PUBLIC_SITE_URL}/app/settings?billing=success`,
        cancel_url: `${env.NEXT_PUBLIC_SITE_URL}/app/settings?billing=cancelled`,
      },
      {
        idempotencyKey: `checkout-${workspaceId}-${Math.floor(Date.now() / 300000)}`,
      },
    );

    return session.url
      ? ok({ url: session.url }, 201)
      : fail("CHECKOUT_UNAVAILABLE", "Stripe không trả về Checkout URL", 502);
  } catch (error) {
    return routeError(error);
  }
}
