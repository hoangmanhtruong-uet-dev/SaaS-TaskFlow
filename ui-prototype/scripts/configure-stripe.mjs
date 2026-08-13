import { spawnSync } from "node:child_process";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2026-07-29.dahlia",
  maxNetworkRetries: 2,
});

if (!process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_") || !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_test_")) {
  throw new Error("Stripe sandbox did not provide test-mode keys");
}

const products = await stripe.products.list({ active: true, limit: 100 });
let product = products.data.find((item) => item.metadata.taskflow_catalog === "pro");
if (!product) {
  product = await stripe.products.create({
    name: "TaskFlow Pro",
    description: "Unlimited projects, advanced permissions, and full activity history.",
    metadata: { taskflow_catalog: "pro" },
  });
}

const prices = await stripe.prices.list({ product: product.id, active: true, type: "recurring", limit: 100 });
let price = prices.data.find((item) => item.currency === "vnd" && item.unit_amount === 79000 && item.recurring?.interval === "month");
if (!price) {
  price = await stripe.prices.create({
    product: product.id,
    currency: "vnd",
    unit_amount: 79000,
    recurring: { interval: "month", usage_type: "licensed" },
    billing_scheme: "per_unit",
    nickname: "TaskFlow Pro monthly per seat",
    metadata: { taskflow_catalog: "pro_monthly" },
  });
}

const configurations = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
let portal = configurations.data.find((item) => item.metadata?.taskflow === "staging");
if (!portal) {
  portal = await stripe.billingPortal.configurations.create({
    business_profile: { headline: "Quản lý gói TaskFlow Pro" },
    features: {
      payment_method_update: { enabled: true },
      invoice_history: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end", proration_behavior: "none" },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["quantity"],
        proration_behavior: "create_prorations",
        products: [{ product: product.id, prices: [price.id] }],
      },
    },
    metadata: { taskflow: "staging" },
  });
}

const endpointUrl = "https://taskflow-mvp-staging.vercel.app/api/v1/webhooks/stripe";
const endpoints = await stripe.webhookEndpoints.list({ limit: 100 });
for (const endpoint of endpoints.data.filter((item) => item.url === endpointUrl)) {
  await stripe.webhookEndpoints.del(endpoint.id);
}
const webhook = await stripe.webhookEndpoints.create({
  url: endpointUrl,
  enabled_events: [
    "checkout.session.completed",
    "customer.subscription.created",
    "customer.subscription.updated",
    "customer.subscription.deleted",
    "invoice.paid",
    "invoice.payment_failed",
  ],
  description: "TaskFlow staging subscription entitlements",
  metadata: { taskflow: "staging" },
});
if (!webhook.secret) throw new Error("Stripe did not return a webhook signing secret");

function setVercelEnv(name, value, sensitive) {
  const args = [
    "vercel", "env", "add", name, "production", "--force", "--yes",
    sensitive ? "--sensitive" : "--no-sensitive",
  ];
  const result = spawnSync("npx", args, { input: value, encoding: "utf8", windowsHide: true, shell: true });
  if (result.status !== 0) throw new Error(`Failed to set ${name}: ${result.error?.message ?? result.stderr ?? "unknown error"}`);
}

setVercelEnv("STRIPE_PRICE_PRO_MONTHLY", price.id, false);
setVercelEnv("STRIPE_WEBHOOK_SECRET", webhook.secret, true);

console.log(JSON.stringify({
  mode: "test",
  productId: product.id,
  priceId: price.id,
  unitAmount: price.unit_amount,
  currency: price.currency,
  interval: price.recurring?.interval,
  portalConfigurationId: portal.id,
  webhookEndpointId: webhook.id,
  webhookUrl: webhook.url,
  enabledEvents: webhook.enabled_events,
}));
