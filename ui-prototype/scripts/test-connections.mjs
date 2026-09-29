import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// ─── Parse .env.local ────────────────────────────────────────────────────────
const envPath = resolve(__dirname, "../.env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
for (const line of envContent.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  env[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
}

const results = { pass: 0, fail: 0, warn: 0 };
const ok  = (msg) => { console.log(`  ✅ ${msg}`); results.pass++; };
const err = (msg) => { console.log(`  ❌ ${msg}`); results.fail++; };
const warn = (msg) => { console.log(`  ⚠️  ${msg}`); results.warn++; };

console.log("\n🔍  TaskFlow — Backend Connection Test Suite");
console.log("=".repeat(52));

// ─────────────────────────────────────────────────────────────────────────────
// 1. SUPABASE (anon + service role)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n━━━ 1. SUPABASE AUTH ━━━");
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey     = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey  = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !anonKey) {
  err("Missing NEXT_PUBLIC_SUPABASE_URL or PUBLISHABLE_KEY");
} else {
  try {
    const anon = createClient(supabaseUrl, anonKey);
    const { error } = await anon.auth.getSession();
    error ? err(`Anon key: ${error.message}`) : ok("Anon key: connected");
  } catch (e) { err(`Anon key error: ${e.message}`); }

  if (serviceKey) {
    try {
      const admin = createClient(supabaseUrl, serviceKey);
      const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (error) err(`Service role: ${error.message}`);
      else ok(`Service role: connected (${data.users.length} user sample returned)`);
    } catch (e) { err(`Service role error: ${e.message}`); }
  } else {
    err("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DATABASE — REST API reachability
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n━━━ 2. DATABASE REST API ━━━");
if (!supabaseUrl || !anonKey) {
  err("Skipped — Supabase credentials missing");
} else {
  try {
    // Root endpoint requires service key — use it if available, else skip
    if (serviceKey) {
      const res = await fetch(`${supabaseUrl}/rest/v1/`, {
        headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` },
      });
      res.ok
        ? ok(`REST API reachable with service key (HTTP ${res.status})`)
        : err(`REST API HTTP ${res.status} ${res.statusText}`);
    } else {
      warn("Skipping REST root probe — no service key");
    }
  } catch (e) { err(`REST API error: ${e.message}`); }

  // Probe a real table to confirm schema is migrated
  if (serviceKey) {
    try {
      const admin = createClient(supabaseUrl, serviceKey);
      const { data, error } = await admin.from("workspaces").select("id").limit(1);
      if (error) err(`Table probe 'workspaces': ${error.message}`);
      else ok(`Table 'workspaces' queryable (${data.length} row sampled)`);
    } catch (e) { err(`Table probe error: ${e.message}`); }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. GOOGLE OAUTH
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n━━━ 3. GOOGLE OAUTH ━━━");
const googleId  = env.GOOGLE_OAUTH_CLIENT_ID;
const googleSec = env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!googleId || !googleSec) {
  err("Missing GOOGLE_OAUTH_CLIENT_ID or GOOGLE_OAUTH_CLIENT_SECRET");
} else {
  ok(`Client ID present: ${googleId.slice(0, 22)}...`);
  ok(`Client Secret present: ${googleSec.slice(0, 8)}...`);
  try {
    const anon = createClient(supabaseUrl, anonKey);
    const { data, error } = await anon.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3000", skipBrowserRedirect: true },
    });
    if (error) err(`Supabase Google provider: ${error.message}`);
    else if (data?.url) ok("Supabase Google provider: configured & URL generated");
  } catch (e) { err(`Google OAuth test: ${e.message}`); }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. RESEND (Email service)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n━━━ 4. RESEND (EMAIL) ━━━");
const resendKey = env.RESEND_API_KEY;
if (!resendKey) {
  err("Missing RESEND_API_KEY");
} else {
  try {
    const res = await fetch("https://api.resend.com/domains", {
      headers: { Authorization: `Bearer ${resendKey}` },
    });
    if (res.ok) {
      const data = await res.json();
      ok(`API key valid — ${data.data?.length ?? 0} domain(s) registered`);
    } else {
      const body = await res.json().catch(() => ({}));
      err(`API key invalid: HTTP ${res.status} — ${body.message ?? res.statusText}`);
    }
  } catch (e) { err(`Resend error: ${e.message}`); }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. PAYOS (Payment gateway)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n━━━ 5. PAYOS (PAYMENT) ━━━");
const payosClientId = env.PAYOS_CLIENT_ID;
const payosApiKey   = env.PAYOS_API_KEY;
const payosChecksum = env.PAYOS_CHECKSUM_KEY;

if (!payosClientId || !payosApiKey || !payosChecksum) {
  err("Missing PAYOS_CLIENT_ID / PAYOS_API_KEY / PAYOS_CHECKSUM_KEY");
} else {
  ok(`Client ID: ${payosClientId.slice(0, 8)}...`);
  ok(`API Key: ${payosApiKey.slice(0, 8)}...`);
  ok(`Checksum Key: ${payosChecksum.slice(0, 8)}...`);
  // PayOS confirm endpoint — HEAD request to verify reachability
  try {
    const res = await fetch("https://api-merchant.payos.vn/v2/payment-requests", {
      method: "HEAD",
      headers: {
        "x-client-id": payosClientId,
        "x-api-key": payosApiKey,
      },
    });
    // 405 = Method Not Allowed (but server is live), 401 = auth required but reachable
    if ([200, 401, 405, 404].includes(res.status)) {
      ok(`PayOS API endpoint reachable (HTTP ${res.status})`);
    } else {
      warn(`PayOS API returned HTTP ${res.status} — verify credentials`);
    }
  } catch (e) { err(`PayOS reach error: ${e.message}`); }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. CLOUDINARY (File upload)
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n━━━ 6. CLOUDINARY ━━━");
const cloudName  = env.CLOUDINARY_CLOUD_NAME;
const cloudKey   = env.CLOUDINARY_API_KEY;
const cloudSec   = env.CLOUDINARY_API_SECRET;

if (!cloudName || !cloudKey || !cloudSec) {
  err("Missing CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET");
} else {
  try {
    const auth = Buffer.from(`${cloudKey}:${cloudSec}`).toString("base64");
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=1`,
      { headers: { Authorization: `Basic ${auth}` } }
    );
    if (res.ok) {
      const data = await res.json();
      ok(`Cloudinary API valid — cloud '${cloudName}' accessible (${data.resources?.length ?? 0} resource sampled)`);
    } else {
      const body = await res.json().catch(() => ({}));
      err(`Cloudinary HTTP ${res.status}: ${body.error?.message ?? res.statusText}`);
    }
  } catch (e) { err(`Cloudinary error: ${e.message}`); }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SENTRY DSN reachability
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n━━━ 7. SENTRY ━━━");
const sentryDsn = env.NEXT_PUBLIC_SENTRY_DSN;
if (!sentryDsn) {
  err("Missing NEXT_PUBLIC_SENTRY_DSN");
} else {
  ok(`DSN present: ${sentryDsn.slice(0, 35)}...`);
  // Sentry ingest host only accepts POST — verify sentry.io platform is reachable
  try {
    const res = await fetch("https://sentry.io/api/0/", { method: "GET" });
    if ([200, 401, 403].includes(res.status)) {
      ok(`Sentry platform reachable: sentry.io (HTTP ${res.status})`);
    } else {
      warn(`Sentry platform returned HTTP ${res.status}`);
    }
  } catch (e) { warn(`Sentry ping: ${e.message}`); }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CRON SECRET & Env vars completeness
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n━━━ 8. ENV COMPLETENESS ━━━");
const requiredVars = [
  "APP_ENV", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_JWT_SECRET",
  "GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_SECRET",
  "RESEND_API_KEY", "EMAIL_FROM",
  "PAYOS_CLIENT_ID", "PAYOS_API_KEY", "PAYOS_CHECKSUM_KEY",
  "NEXT_PUBLIC_SENTRY_DSN", "SENTRY_AUTH_TOKEN",
  "CRON_SECRET",
  "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", "NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET",
];

const missing = requiredVars.filter((v) => !env[v]);
if (missing.length === 0) {
  ok(`All ${requiredVars.length} required env vars present`);
} else {
  missing.forEach((v) => err(`Missing env var: ${v}`));
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log("\n" + "=".repeat(52));
console.log(`📊  SUMMARY:  ✅ ${results.pass} passed  |  ❌ ${results.fail} failed  |  ⚠️  ${results.warn} warnings`);
if (results.fail === 0) {
  console.log("🚀  All connections healthy — ready to go live!");
} else {
  console.log(`⛔  Fix ${results.fail} failed check(s) before go-live.`);
}
console.log("=".repeat(52) + "\n");
