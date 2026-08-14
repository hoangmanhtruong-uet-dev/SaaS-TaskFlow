import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

function parse(content) {
  return Object.fromEntries(content.split(/\r?\n/).map((line) => line.trim()).filter((line) => line && !line.startsWith("#")).map((line) => {
    const separator = line.indexOf("="); return [line.slice(0, separator), line.slice(separator + 1)];
  }));
}

const example = parse(await readFile(new URL("../.env.example", import.meta.url), "utf8"));
const test = parse(await readFile(new URL("../.env.test", import.meta.url), "utf8"));
assert.deepEqual(Object.keys(test).sort(), Object.keys(example).sort(), ".env.test and .env.example keys must stay aligned");

const publicKeys = new Set(["NEXT_PUBLIC_APP_ENV", "NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SENTRY_DSN"]);
for (const key of Object.keys(example)) {
  if (key.startsWith("NEXT_PUBLIC_")) assert.ok(publicKeys.has(key), `Unexpected browser-visible key: ${key}`);
  if (/SECRET|SERVICE_ROLE|DB_URL|API_KEY/.test(key)) assert.ok(!key.startsWith("NEXT_PUBLIC_"), `Secret must be server-only: ${key}`);
}
for (const key of ["SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_DB_URL", "GOOGLE_OAUTH_CLIENT_SECRET", "RESEND_API_KEY", "STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "CRON_SECRET"]) assert.ok(example[key], key);
assert.equal(new URL(test.NEXT_PUBLIC_SITE_URL).hostname, "localhost");
assert.equal(test.NEXT_PUBLIC_API_BASE_URL, "/api/v1");
console.log(`Validated ${Object.keys(example).length} environment variables and public/secret boundaries.`);
