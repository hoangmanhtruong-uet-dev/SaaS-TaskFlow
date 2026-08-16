import assert from "node:assert/strict";
import { createHash } from "node:crypto";

function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
}

export function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

export function checksumData(data) {
  return createHash("sha256").update(canonicalJson(data)).digest("hex");
}

export function createRecoveryBundle({ data, schemaVersion, capturedAt = new Date().toISOString() }) {
  const rowCounts = Object.fromEntries(Object.entries(data).map(([table, rows]) => [table, rows.length]));
  return {
    manifest: {
      format: "taskflow-workspace-backup",
      version: 1,
      schemaVersion,
      capturedAt,
      checksumAlgorithm: "sha256",
      checksum: checksumData(data),
      rowCounts,
    },
    data,
  };
}

export function validateRecoveryBundle(bundle, { workspaceId, tableOrder }) {
  assert.equal(bundle?.manifest?.format, "taskflow-workspace-backup", "Unknown recovery bundle format.");
  assert.equal(bundle.manifest.version, 1, "Unsupported recovery bundle version.");
  assert.match(bundle.manifest.schemaVersion, /^\d{14}$/, "A migration schema version is required.");
  assert.equal(bundle.manifest.checksumAlgorithm, "sha256");
  assert.equal(checksumData(bundle.data), bundle.manifest.checksum, "Recovery bundle checksum mismatch.");
  assert.deepEqual(Object.keys(bundle.data), tableOrder, "Recovery bundle tables or restore order changed.");
  for (const table of tableOrder) {
    assert.ok(Array.isArray(bundle.data[table]), `${table} must be an array.`);
    assert.equal(bundle.data[table].length, bundle.manifest.rowCounts[table], `${table} row count mismatch.`);
    for (const row of bundle.data[table]) {
      const rowWorkspaceId = table === "workspaces" ? row.id : row.workspace_id;
      assert.equal(rowWorkspaceId, workspaceId, `${table} contains a row from another workspace.`);
    }
  }
  assert.equal(bundle.data.workspaces.length, 1, "A workspace backup must contain exactly one workspace.");
  assert.ok(bundle.data.memberships.length >= 1, "A workspace backup must contain a membership.");
  return true;
}
