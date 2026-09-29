# Release Isolation

Last updated: 2026-09-29
Decision: BLOCKED

## Branch / Commit Identity

- Current branch: `release/go-live`
- Current HEAD: `da7c802` (`test: automate staging tenant isolation E2E`)
- `release/go-live` and `codex/supabase-staging-schema` currently point to the same commit.
- `main`: `a00ef59` (`feat: initialize Supabase staging schema`)
- Divergence: `main...HEAD` reports `0 10`; HEAD is 10 commits ahead of main and main is not ahead of HEAD.
- Merge base: `a00ef59`.
- Phase 1-4 changes are not represented by a single commit. Required security fixes, lint remediation, documents, and the owner trigger migration remain uncommitted in the worktree.

## Relevant Verified History

The committed baseline includes the production migration/auth/observability/billing work through `da7c802`, including:

- `c318e66` runtime migration to Next.js/Supabase Postgres.
- `5692ca3` Supabase authentication.
- `39bbcea` Resend transactional email.
- `03c32d1` Stripe subscription billing.
- `cccbbba` observability and Playwright E2E.
- `da7c802` staging tenant-isolation E2E automation.

Phase 1-4 fixes such as `db/collaboration.ts`, rendered-test updates, lint remediation, go-live reports and `20260929120000_prevent_last_owner_loss.sql` are currently working-tree changes, not historical commits.

## Release-Required Working-Tree Content

These files are verified or directly required by the go-live work:

- `docs/GO_LIVE_STATUS.md`
- `docs/PRODUCTION_MOCK_AUDIT.md`
- `docs/STAGING_READINESS.md`
- `docs/BACKUP_RESTORE_REHEARSAL.md`
- `docs/RELEASE_ISOLATION.md`
- `db/collaboration.ts`
- `db/audit.ts`
- `db/auth.ts`
- `db/billing.ts`
- `db/notifications.ts`
- `db/projects.ts`
- `db/tasks.ts`
- member/invitation API route fixes
- `tests/rendered-html.test.mjs`
- `supabase/migrations/20260929120000_prevent_last_owner_loss.sql`
- lint-remediation files only where the remediation was verified by `npm run lint`

## Excluded / Unrelated or Not Automatically Included

- `rebuild-ui/` and design/prototype artifacts.
- `examples/d1/` deletion, whose intent is not established by this phase.
- Broad settings/UI additions without a verified production backend contract.
- Unverified migrations, scripts, fixtures and test additions outside the required release path.
- Dependency/package changes whose ownership is not established from commit history.

## Unknown Files Requiring Human Review

The current worktree contains broad modified and untracked sets under `app/`, `db/`, `docs/`, `scripts/`, `supabase/migrations/`, `tests/`, package/config files and CI workflows. File names alone do not establish whether these are release work or unrelated user work.

## Isolation Decision

BLOCKED. A clean secondary worktree can be created from committed `da7c802`, but it would omit the uncommitted Phase 1-4 fixes. Applying the entire working-tree diff would include unexplained user changes and generated/temporary content. No destructive cleanup, blind cherry-pick, reset, or deletion was performed.

A deterministic release candidate requires an explicit human-approved file/commit manifest or a follow-up commit that contains only the verified release changes.
