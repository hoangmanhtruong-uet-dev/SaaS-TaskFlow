import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Parse .env.local
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

console.log("🔍 Testing connections...\n");

// ═══════════════════════════════════════
// 1. Test Supabase Connection
// ═══════════════════════════════════════
console.log("━━━ 1. SUPABASE ━━━");
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("❌ Missing SUPABASE_URL or PUBLISHABLE_KEY");
} else {
  try {
    // Test with anon key
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log("❌ Supabase anon connection:", error.message);
    } else {
      console.log("✅ Supabase anon key: Connected!");
    }

    // Test with service role key
    if (serviceRoleKey) {
      const adminClient = createClient(supabaseUrl, serviceRoleKey);
      const { data: users, error: adminError } =
        await adminClient.auth.admin.listUsers({ page: 1, perPage: 1 });
      if (adminError) {
        console.log("❌ Supabase service role:", adminError.message);
      } else {
        console.log(
          `✅ Supabase service role: Connected! (${users.users.length} users found)`
        );
      }
    }
  } catch (err) {
    console.log("❌ Supabase error:", err.message);
  }
}

// ═══════════════════════════════════════
// 2. Test Database Connection
// ═══════════════════════════════════════
console.log("\n━━━ 2. DATABASE ━━━");
const dbUrl = env.SUPABASE_DB_URL;
if (!dbUrl) {
  console.log("❌ Missing SUPABASE_DB_URL");
} else {
  try {
    // Simple fetch to Supabase REST API to verify DB is accessible
    const res = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });
    if (res.ok) {
      console.log("✅ Database REST API: Accessible!");
    } else {
      console.log("❌ Database REST API:", res.status, res.statusText);
    }
  } catch (err) {
    console.log("❌ Database error:", err.message);
  }
}

// ═══════════════════════════════════════
// 3. Test Google OAuth Config
// ═══════════════════════════════════════
console.log("\n━━━ 3. GOOGLE OAUTH ━━━");
const googleClientId = env.GOOGLE_OAUTH_CLIENT_ID;
const googleClientSecret = env.GOOGLE_OAUTH_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.log("❌ Missing Google OAuth credentials");
} else {
  console.log(`✅ Google Client ID: ${googleClientId.slice(0, 20)}...`);
  console.log(`✅ Google Client Secret: ${googleClientSecret.slice(0, 10)}...`);

  // Check if Google provider is enabled in Supabase
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: "http://localhost:3000", skipBrowserRedirect: true },
    });
    if (error) {
      console.log("❌ Google OAuth in Supabase:", error.message);
      console.log(
        "   → Hãy vào Supabase Dashboard → Authentication → Providers → Google → Bật và paste Client ID/Secret"
      );
    } else if (data?.url) {
      console.log("✅ Google OAuth in Supabase: Configured! (redirect URL generated)");
    }
  } catch (err) {
    console.log("❌ Google OAuth test error:", err.message);
  }
}

// ═══════════════════════════════════════
// Summary
// ═══════════════════════════════════════
console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
console.log("📋 Remaining services to configure:");
if (!env.RESEND_API_KEY) console.log("   ⬜ Resend (Email)");
if (!env.PAYOS_CLIENT_ID) console.log("   ⬜ PayOS (Payment)");
if (!env.NEXT_PUBLIC_SENTRY_DSN) console.log("   ⬜ Sentry (Monitoring)");
if (!env.CRON_SECRET) console.log("   ⬜ CRON_SECRET");
console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
