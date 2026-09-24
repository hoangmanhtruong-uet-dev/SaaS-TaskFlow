import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ufdqvggtluwnpzxksein.supabase.co";
const serviceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZHF2Z2d0bHV3bnB6eGtzZWluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MDE3NjA0NiwiZXhwIjoyMTA1NzUyMDQ2fQ.oxijUm4-bK4U-6w9E2nYbGmzgRSI062DAIfdOl3KvgM";

const supabase = createClient(supabaseUrl, serviceKey);

// Use REST API to check tables by trying to query them
const expectedTables = [
  "profiles", "workspaces", "memberships", "invitations",
  "projects", "project_members", "boards", "columns",
  "tasks", "task_assignees", "labels", "task_labels",
  "comments", "attachments", "notifications", "activity_events",
  "outbox_events", "subscriptions", "idempotency_records",
  "checklist_items", "mfa_recovery_codes"
];

console.log("🔍 Checking database tables via Supabase REST API...\n");

let found = 0;
let missing = 0;

for (const table of expectedTables) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/${table}?select=count&limit=0`, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Prefer: "count=exact",
      },
    });
    if (res.ok || res.status === 200) {
      const count = res.headers.get("content-range");
      console.log(`  ✅ ${table} ${count ? "(rows: " + count.split("/")[1] + ")" : ""}`);
      found++;
    } else if (res.status === 404) {
      console.log(`  ❌ ${table} — NOT FOUND`);
      missing++;
    } else {
      const body = await res.text();
      console.log(`  ⚠️  ${table} — ${res.status} ${body.slice(0, 80)}`);
      missing++;
    }
  } catch (e) {
    console.log(`  ❌ ${table} — ${e.message}`);
    missing++;
  }
}

console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
console.log(`📊 Result: ${found} found, ${missing} missing`);
if (missing > 0) {
  console.log(`\n⚠️  Cần chạy migrations để tạo tables!`);
  console.log(`   Lệnh: node scripts/apply-cloud-migrations.mjs`);
} else {
  console.log(`\n✅ Database đầy đủ tables!`);
}
