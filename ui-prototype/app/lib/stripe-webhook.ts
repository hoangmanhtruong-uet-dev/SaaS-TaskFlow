import type Stripe from "stripe";

export const STRIPE_WEBHOOK_TOLERANCE_SECONDS = 300;

export function verifyStripeEvent(webhooks: Stripe["webhooks"], rawBody: string, signature: string, secret: string, receivedAt?: number) {
  return webhooks.constructEvent(rawBody, signature, secret, STRIPE_WEBHOOK_TOLERANCE_SECONDS, undefined, receivedAt);
}
