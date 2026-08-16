import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { checksumData, createRecoveryBundle, validateRecoveryBundle } from "../../scripts/lib/recovery-bundle.mjs";

const tableOrder = ["workspaces", "memberships"];
const workspaceId = "00000000-0000-4000-8000-000000000001";
const data = {
  workspaces: [{ id: workspaceId, name: "Recovery" }],
  memberships: [{ id: "membership", workspace_id: workspaceId, role: "OWNER" }],
};

test("recovery bundle checksum is deterministic across object key order", () => {
  assert.equal(checksumData({ a: 1, b: 2 }), checksumData({ b: 2, a: 1 }));
  const bundle = createRecoveryBundle({ data, schemaVersion: "20260816150000", capturedAt: "2026-08-16T00:00:00.000Z" });
  assert.equal(validateRecoveryBundle(bundle, { workspaceId, tableOrder }), true);
  assert.deepEqual(bundle.manifest.rowCounts, { workspaces: 1, memberships: 1 });
});

test("recovery bundle validation rejects tampering and cross-tenant rows", () => {
  const bundle = createRecoveryBundle({ data, schemaVersion: "20260816150000" });
  bundle.data.memberships[0].role = "ADMIN";
  assert.throws(() => validateRecoveryBundle(bundle, { workspaceId, tableOrder }), /checksum mismatch/);

  const crossTenant = {
    workspaces: data.workspaces,
    memberships: [{ ...data.memberships[0], workspace_id: "00000000-0000-4000-8000-000000000002" }],
  };
  const crossTenantBundle = createRecoveryBundle({ data: crossTenant, schemaVersion: "20260816150000" });
  assert.throws(() => validateRecoveryBundle(crossTenantBundle, { workspaceId, tableOrder }), /another workspace/);
});

test("staging rehearsal is synthetic, guarded, checksum-verified, and always cleaned up", async () => {
  const [script, workflow, runbook] = await Promise.all([
    readFile(new URL("../../scripts/run-backup-restore-rehearsal.mjs", import.meta.url), "utf8"),
    readFile(new URL("../../../.github/workflows/backup-restore-rehearsal.yml", import.meta.url), "utf8"),
    readFile(new URL("../../docs/operations/disaster-recovery.md", import.meta.url), "utf8"),
  ]);
  assert.match(script, /STAGING_EPHEMERAL_ONLY/);
  assert.match(script, /validateRecoveryBundle/);
  assert.match(script, /Restored workspace checksum does not match/);
  assert.match(script, /finally \{/);
  assert.match(script, /await cleanup\(\)/);
  assert.match(script, /\[\.\.\.TABLE_ORDER\]\.reverse\(\)/);
  assert.match(script, /cleanupStaleRehearsals/);
  assert.match(script, /\^recovery-\[a-f0-9\]\{12\}\$/);
  assert.doesNotMatch(script, /writeFile|upload-artifact/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /environment: staging/);
  assert.doesNotMatch(workflow, /upload-artifact/);
  assert.match(
    runbook.replace(/\s+/g, " "),
    /Free Plan does not include managed backups|Free Plan.*not available/i,
  );
  assert.match(runbook, /Target RPO: 24 hours/);
  assert.match(runbook, /Target RTO: 60 minutes/);
});
