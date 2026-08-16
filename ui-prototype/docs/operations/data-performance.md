# Data performance and growth policy

## Critical query inventory

| Query | Owner | Bound | Index / evidence |
| --- | --- | --- | --- |
| Workspace task feed | Product Engineering | Keyset cursor, default 50, maximum 100 | `tasks_workspace_cursor_idx`; assignees and checklist are batch-loaded |
| Workspace project feed | Product Engineering | Keyset cursor, default 50, maximum 100 | `projects_workspace_cursor_idx`; task progress is grouped once per page |
| Task search | Product Engineering | Database filter, maximum 50 | `tasks_title_fts_idx`; never loads the tenant into JavaScript |
| Invitation/outbox worker | Platform Engineering | Claim maximum 100 | `outbox_claim_idx`, `FOR UPDATE SKIP LOCKED` |

Before a release that changes one of these queries, capture `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` on staging with representative tenant sizes. Review estimated versus actual rows, shared reads, sort spill, and execution time. Do not add an index without a measured query owner; remove unused indexes only through expand/contract review.

Alert on p95 database query latency above 250 ms for 15 minutes, lock waits above 2 seconds, scanned/returned ratio above 100 for critical reads, and connection use above 70%. The application pool is capped at five connections per instance. Deployment capacity must satisfy `instances × 5 + 20% admin/migration headroom < database limit`.

Archiving and partitioning require a recorded retention/query case. Sharding is not an accepted near-term solution.
