# Disaster recovery runbook

## Current status

The staging Supabase project is on the Free Plan. Supabase managed backups and point-in-time recovery are not available on this plan. A production launch must not claim managed database recovery until the production project is upgraded and a real restore has been rehearsed.

## Recovery objectives

- Target RPO: 24 hours after daily managed backups are enabled.
- Target RTO: 60 minutes for a workspace restore after access to a verified backup.
- Synthetic rehearsal: weekly on staging, with no real tenant data exported or retained.

## Automated staging rehearsal

The `Staging backup-restore rehearsal` workflow creates a disposable workspace and two disposable Auth users. It snapshots representative workspace data into memory, produces a SHA-256 manifest, deletes only that synthetic workspace, restores it in foreign-key order, compares row counts and checksum, and removes all rehearsal fixtures in a `finally` cleanup.

The workflow never uploads the backup bundle as an artifact and never reads an existing tenant. Its result proves the application-level restore order and integrity checks, not Supabase platform backup availability.

Run locally only with the staging guard and required staging environment values:

```powershell
$env:APP_ENV = "staging"
$env:TASKFLOW_CONFIRM_BACKUP_REHEARSAL = "STAGING_EPHEMERAL_ONLY"
npm run test:recovery:staging
```

## Production prerequisites

1. Upgrade the production Supabase project to a plan with managed daily backups or PITR.
2. Record the backup retention window and responsible owner.
3. Restore the newest backup into a separate project, never over the live project for a rehearsal.
4. Run database migrations, catalog security audit, row counts, foreign-key checks, and authenticated E2E against the restored project.
5. Record actual RPO/RTO, restore identifier, timestamps, and approver without copying credentials into logs.
6. Keep destructive live-project restore behind incident approval and a second operator review.

The production runtime also fails environment validation unless `BACKUP_PROVIDER`, `BACKUP_RETENTION_DAYS`, and `BACKUP_LAST_ISOLATED_RESTORE_AT` identify this verified capability. These values are evidence metadata only; credentials remain in the provider secret manager.
