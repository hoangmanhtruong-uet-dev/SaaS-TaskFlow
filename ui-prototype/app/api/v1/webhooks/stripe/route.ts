import type Stripe from "stripe";
import { stripeEnv } from "@/app/lib/env";
import { stripeClient } from "@/app/lib/stripe";
import { hasProcessedStripeEvent, syncStripeSubscription } from "@/db/billing";
import { logEvent, reportError, requestIdFrom } from "@/app/lib/observability";

function subscriptionIdFromInvoice(invoice: Stripe.Invoice) {
  const subscription = invoice.parent?.subscription_details?.subscription;
  return typeof subscription === "string"
    ? subscription
    : (subscription?.id ?? null);
}

export async function POST(request: Request) {
  const requestId = requestIdFrom(request);
  const startedAt = Date.now();
  const signature = request.headers.get("stripe-signature");
  if (!signature)
    return Response.json(
      { error: "Missing Stripe signature" },
      { status: 400 },
    );

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(
      await request.text(),
      signature,
      stripeEnv().STRIPE_WEBHOOK_SECRET,
    );
  } catch {
    return Response.json(
      { error: "Invalid Stripe signature" },
      { status: 400 },
    );
  }

  if (await hasProcessedStripeEvent(event.id)) {
    logEvent("info", "stripe_webhook_duplicate", { requestId, stripeEventId: event.id, stripeEventType: event.type, durationMs: Date.now() - startedAt });
    return Response.json({ received: true, duplicate: true });
  }

  try {
    let subscription: Stripe.Subscription | null = null;
    let lastInvoiceStatus: "paid" | "payment_failed" | undefined;

    if (
      event.type === "customer.subscription.created" ||
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      subscription = event.data.object;
    } else if (event.type === "checkout.session.completed") {
      const reference = event.data.object.subscription;
      const subscriptionId =
        typeof reference === "string" ? reference : reference?.id;
      if (subscriptionId)
        subscription =
          await stripeClient().subscriptions.retrieve(subscriptionId);
    } else if (
      event.type === "invoice.paid" ||
      event.type === "invoice.payment_failed"
    ) {
      const subscriptionId = subscriptionIdFromInvoice(event.data.object);
      if (subscriptionId)
        subscription =
          await stripeClient().subscriptions.retrieve(subscriptionId);
      lastInvoiceStatus =
        event.type === "invoice.paid" ? "paid" : "payment_failed";
    } else {
      return Response.json({ received: true, ignored: true });
    }

    if (!subscription)
      return Response.json(
        { error: "Subscription reference missing" },
        { status: 422 },
      );
    await syncStripeSubscription({
      eventId: event.id,
      eventType: event.type,
      eventCreated: event.created,
      subscription,
      lastInvoiceStatus,
    });
    logEvent("info", "stripe_webhook_processed", { requestId, stripeEventId: event.id, stripeEventType: event.type, durationMs: Date.now() - startedAt });
    return Response.json({ received: true });
  } catch (error) {
    reportError(error, "stripe_webhook_failed", { requestId, route: "/api/v1/webhooks/stripe", stripeEventId: event.id, stripeEventType: event.type, durationMs: Date.now() - startedAt });
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
