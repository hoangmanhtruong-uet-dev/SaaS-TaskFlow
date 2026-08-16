import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("database hardening migration locks future defaults and documents server-only tables", async () => {
  const migration = await readFile(new URL("../../supabase/migrations/20260816150000_harden_database_defaults.sql", import.meta.url), "utf8");
  assert.match(migration, /revoke create on schema public from public, anon, authenticated/);
  assert.match(migration, /alter default privileges for role postgres in schema public revoke all on tables from public, anon, authenticated/);
  assert.match(migration, /revoke execute on functions from public, anon, authenticated/);
  for (const table of ["attachment_uploads", "task_checklist_items", "task_reminder_deliveries"])
    assert.match(migration, new RegExp(`create policy ${table}_server_only`));
});

test("catalog audit fails closed on missing RLS, unsafe grants, policies, and definer search paths", async () => {
  const audit = await readFile(new URL("../../scripts/audit-supabase-security.mjs", import.meta.url), "utf8");
  assert.match(audit, /Every public table must enable RLS/);
  assert.match(audit, /anon must not receive direct table privileges/);
  assert.match(audit, /Every public table must have an explicit access or server-only policy/);
  assert.match(audit, /SECURITY DEFINER functions must pin search_path/);
  assert.match(audit, /Future postgres-owned objects must not default-grant/);
});

test("staging provisioner verifies direct PostgREST tenant isolation and denied writes", async () => {
  const provisioner = await readFile(new URL("../../scripts/run-staging-e2e.mjs", import.meta.url), "utf8");
  assert.match(provisioner, /verifyDirectRls/);
  assert.match(provisioner, /RLS exposed a foreign workspace/);
  assert.match(provisioner, /RLS exposed a server-only checklist table/);
  assert.match(provisioner, /Direct authenticated mutation bypassed/);
});

test("activity audit records reject mutation and preserve lifecycle-only deletion", async () => {
  const migration = await readFile(new URL("../../supabase/migrations/20260816170000_protect_activity_audit.sql", import.meta.url), "utf8");
  assert.match(migration, /before update on public\.activity_events/);
  assert.match(migration, /activity_events are append-only/);
  assert.match(migration, /DELETE is reserved for workspace lifecycle retention/);
});
