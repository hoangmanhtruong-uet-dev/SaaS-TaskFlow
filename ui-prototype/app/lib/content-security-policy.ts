function originOf(value: string | undefined) {
  if (!value) return null;
  try { return new URL(value).origin; } catch { return null; }
}

export function buildContentSecurityPolicy(nonce: string, environment = process.env.NODE_ENV) {
  if (!/^[a-f0-9]{32}$/.test(nonce)) throw new Error("CSP nonce must be 128 bits encoded as lowercase hex.");
  const supabaseOrigin = originOf(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const sentryOrigin = originOf(process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN);
  const realtimeOrigin = supabaseOrigin?.replace(/^https:/, "wss:").replace(/^http:/, "ws:") ?? null;
  const connectSources = ["'self'", supabaseOrigin, realtimeOrigin, sentryOrigin].filter(Boolean).join(" ");
  const developmentScriptSource = environment === "development" ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${developmentScriptSource}`,
    // A small number of progress indicators still use React style attributes. Script execution remains nonce-only.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-src 'none'",
    "frame-ancestors 'none'",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}
