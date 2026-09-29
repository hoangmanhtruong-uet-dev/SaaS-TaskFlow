# Backup / Restore Rehearsal

Last updated: 2026-09-29
Status: BLOCKED

## Scope

This phase did not run a destructive operation, production backup, production restore, or any operation against an unknown database. No backup or restore result is claimed.

## Required Procedure

1. Use an isolated staging Supabase project only.
2. Create or obtain a supported staging backup without using the sole production backup.
3. Record backup timestamp and provider reference without recording credentials.
4. Restore into a separate recovery project/database.
5. Verify schema/migration compatibility and representative row counts.
6. Verify foreign-key relationships, workspace ownership and RLS/security catalog.
7. Run representative application reads and cross-tenant isolation checks.
8. Record observed backup duration, restore duration, and observed RPO/RTO evidence.
9. Clean up only synthetic/recovery fixtures after evidence is captured.

## Current Evidence

| Gate | Status | Evidence |
|---|---|---|
| Backup provider configured | BLOCKED | `BACKUP_PROVIDER` and backup environment metadata are missing. |
| Staging source database | BLOCKED | `SUPABASE_DB_URL` is unavailable. |
| Isolated recovery database/project | BLOCKED | No recovery target was provisioned or supplied. |
| Backup creation | BLOCKED | Not run because staging source/provider is unavailable. |
| Restore execution | BLOCKED | Not run; no backup or isolated recovery target is available. |
| Schema verification after restore | BLOCKED | Cannot verify without a restored database. |
| RLS/security verification after restore | BLOCKED | Cannot verify without a restored database and credentials. |
| Application read verification after restore | BLOCKED | Cannot connect to a restored database. |
| Observed RPO/RTO | UNKNOWN | No timing evidence exists; no estimates are made. |

## Important Limitation

The existing script `npm run test:recovery:staging` is a guarded synthetic application-level rehearsal. It snapshots synthetic rows in memory, deletes only the synthetic workspace, restores those rows and verifies a checksum. It does not prove provider-managed backup availability or a real project/database restore.

The script refused to run in this environment with:

`Refusing recovery rehearsal outside APP_ENV=staging.`

The disaster recovery runbook also states that the current Supabase Free Plan does not provide managed backups/PITR. A production recovery claim requires an upgraded provider plan and a real isolated restore rehearsal.

## Decision

BLOCKED. Do not mark backup, restore, RPO, RTO or production recovery readiness as PASS until the isolated staging procedure produces observed evidence.
