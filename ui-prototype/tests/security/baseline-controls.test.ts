import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("threat model names assets, actors, boundaries, flows, owners, detection, and recovery", async () => {
  const model = await readFile(new URL("../../docs/security/threat-model.md", import.meta.url), "utf8");
  for (const section of ["Scope and assets", "Actors", "Trust boundaries", "Principal data flows", "Threat register"]) assert.match(model, new RegExp(section));
  for (const column of ["Preconditions", "Impact", "Preventive controls", "Detection", "Recovery", "Accountable owner"]) assert.match(model, new RegExp(column));
  for (const threat of ["Cross-tenant", "Credential stuffing", "Malicious attachment", "Forged/replayed", "SSRF", "Mobile client"]) assert.match(model, new RegExp(threat, "i"));
  assert.match(model, /None replace server-side object authorization/);
});

test("mobile controls are an explicit future release gate rather than a false web claim", async () => {
  const mobile = await readFile(new URL("../../docs/security/mobile-baseline.md", import.meta.url), "utf8");
  assert.match(mobile, /not applicable to the current release/i);
  for (const control of ["Keystore", "Keychain", "Certificate pinning", "Play Integrity", "App Attest", "server authorization"]) assert.match(mobile, new RegExp(control));
});

test("CI scans history for secrets and audits production dependencies", async () => {
  const workflow = await readFile(new URL("../../../.github/workflows/ci.yml", import.meta.url), "utf8");
  assert.match(workflow, /fetch-depth: 0/);
  assert.match(workflow, /gitleaks\/gitleaks-action@[a-f0-9]{40}/);
  assert.match(workflow, /npm audit --omit=dev --audit-level=high/);
});

test("production requires malware scanning and MFA recovery codes remain server-only hashes", async () => {
  const [env, scanner, migration, recovery] = await Promise.all([
    readFile(new URL("../../app/lib/env.ts", import.meta.url), "utf8"),
    readFile(new URL("../../app/lib/malware-scanner.ts", import.meta.url), "utf8"),
    readFile(new URL("../../supabase/migrations/20260816171000_mfa_recovery_codes.sql", import.meta.url), "utf8"),
    readFile(new URL("../../db/mfa-recovery.ts", import.meta.url), "utf8"),
  ]);
  assert.match(env, /Production requires a malware scanner/);
  assert.match(scanner, /APP_ENV === "production"/);
  assert.match(migration, /revoke all on public\.mfa_recovery_codes from anon, authenticated/);
  assert.match(recovery, /hashOpaqueToken/);
  assert.doesNotMatch(recovery, /insert\(mfaRecoveryCodes\)[\s\S]*codes\.map\(\(code\)/);
});

test("logs recursively redact credentials and sanitize exception messages before Sentry", async () => {
  const source = await readFile(new URL("../../app/lib/observability.ts", import.meta.url), "utf8");
  assert.match(source, /sanitizeLogValue\(item, depth \+ 1\)/);
  assert.match(source, /credentialValue/);
  assert.match(source, /const safeError = new Error\(safeMessage\)/);
  assert.match(source, /Sentry\.captureException\(safeError/);
});
