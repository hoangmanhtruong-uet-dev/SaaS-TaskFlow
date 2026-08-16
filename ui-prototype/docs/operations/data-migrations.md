# Migration and restore lifecycle

Schema changes use expand/contract:

1. Add a backward-compatible column/table/index and deploy it.
2. Deploy code that tolerates both schemas; dual-write only when necessary.
3. Backfill in bounded, restartable batches with lock and load monitoring.
4. Switch reads and observe for one release.
5. Remove the old path in a later release with an owner and tested rollback.

`npm run test:migrations` rejects drop, rename, and column type changes unless the SQL contains `-- taskflow:contract-approved owner=<team> rollback=<runbook>`. The marker is review evidence, not permission to combine expand and contract in one deployment.

Backups must be encrypted, access-separated, retained according to the production provider configuration, and restored into an isolated project. The weekly staging rehearsal validates dependency order, row counts and SHA-256 integrity. Production readiness additionally requires a provider backup/PITR plan and a recorded isolated restore with actual RPO/RTO; a backup that has never been restored is not accepted as recoverable.
