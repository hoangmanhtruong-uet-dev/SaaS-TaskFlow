import Stripe from "stripe";
import { parseServerEnv } from "@/app/lib/env";

export function stripeClient() {
  return new Stripe(parseServerEnv().STRIPE_SECRET_KEY);
}
