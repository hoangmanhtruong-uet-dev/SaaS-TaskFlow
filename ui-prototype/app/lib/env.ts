import { z } from "zod";

const serverSchema = z.object({
  APP_ENV: z.enum(["local", "test", "staging", "production"]),
  NEXT_PUBLIC_SITE_URL: z.string().url(),
  NEXT_PUBLIC_API_BASE_URL: z.string().startsWith("/"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  SUPABASE_DB_URL: z.string().startsWith("postgresql://"),
  SUPABASE_JWT_SECRET: z.string().min(32),
  GOOGLE_OAUTH_CLIENT_ID: z.string().min(1),
  GOOGLE_OAUTH_CLIENT_SECRET: z.string().min(1),
  RESEND_API_KEY: z.string().startsWith("re_"),
  EMAIL_FROM: z.string().min(3),
  EMAIL_REPLY_TO: z.string().email(),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_"),
  STRIPE_PRICE_PRO_MONTHLY: z.string().startsWith("price_"),
  CRON_SECRET: z.string().min(32),
});

export type ServerEnv = z.infer<typeof serverSchema>;

export function parseServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  return serverSchema.parse(source);
}

export function publicEnv(source: Record<string, string | undefined> = process.env) {
  return {
    siteUrl: z.string().url().parse(source.NEXT_PUBLIC_SITE_URL),
    apiBaseUrl: z.string().startsWith("/").parse(source.NEXT_PUBLIC_API_BASE_URL),
    supabaseUrl: z.string().url().parse(source.NEXT_PUBLIC_SUPABASE_URL),
    supabasePublishableKey: z.string().min(1).parse(source.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY),
    stripePublishableKey: z.string().startsWith("pk_").parse(source.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY),
  };
}
