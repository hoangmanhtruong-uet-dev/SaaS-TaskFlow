import Stripe from "stripe";
import { stripeEnv } from "@/app/lib/env";

let stripe: Stripe | undefined;

export function stripeClient() {
  if (stripe) return stripe;
  stripe = new Stripe(stripeEnv().STRIPE_SECRET_KEY, {
    apiVersion: "2026-07-29.dahlia",
    maxNetworkRetries: 2,
    appInfo: { name: "TaskFlow", version: "0.1.0" },
  });
  return stripe;
}
