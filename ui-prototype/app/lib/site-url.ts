export function siteUrl(source: Record<string, string | undefined> = process.env): string {
  const configured = source.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, "");
  const vercelUrl = source.VERCEL_PROJECT_PRODUCTION_URL ?? source.VERCEL_URL;
  return vercelUrl ? `https://${vercelUrl}` : "http://localhost:3000";
}

export function safeReturnTo(value: string | null | undefined): string {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/app";
}
