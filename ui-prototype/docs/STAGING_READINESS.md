# Staging Readiness

Last updated: 2026-09-29
Decision: BLOCKED

This document records infrastructure readiness without printing credentials or claiming functional verification from configuration alone.

## Dependency Matrix

| Dependency | Required | Configured | Functionally Verified | Evidence | Blocker |
|---|---:|---:|---:|---|---|
| Vercel | Yes | UNKNOWN | UNKNOWN | `vercel.json` declares the workspace-deletion cron; no staging deployment verification was run in this phase | Staging URL/deployment ownership and environment bindings are not available locally |
| Supabase Auth/Postgres | Yes | BLOCKED | BLOCKED | `supabase/config.toml` is local (`taskflow-local`); staging workflow expects `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_DB_URL` | Staging project ref, service role, and database URL are missing |
| Supabase migrations | Yes | PASS for static safety only | BLOCKED against staging | `npm run test:migrations` passed 15 migration safety checks | Real staging database is unavailable |
| Supabase Storage | Yes for attachments | BLOCKED | BLOCKED | Application uses the `task-attachments` bucket and signed URLs; staging E2E provisions storage through Supabase | Staging Supabase URL/service role and bucket verification are unavailable |
| Stripe test account | Yes for staging billing | BLOCKED | BLOCKED | Staging workflow declares `STRIPE_PRICE_PRO_MONTHLY`; billing/webhook routes use Stripe SDK | Staging Stripe price/account/webhook binding is missing |
| Resend staging sender | Yes for email flows | BLOCKED | BLOCKED | `RESEND_API_KEY`, `EMAIL_FROM`, and `EMAIL_REPLY_TO` are required by environment schemas | No staging email credentials or verified sender evidence |
| Sentry | Recommended/required for operations | BLOCKED | BLOCKED | Sentry server/edge/client integrations exist; DSN and project settings are empty/missing locally | No staging DSN/org/project/auth configuration |
| Redis/queue | N/A | N/A | N/A | No Redis dependency or Redis connection path was found; scheduled work uses Vercel cron and server job routes | Reassess if queue-backed workloads are added |
| Malware scanner | Required for production attachments; required before trusting staging attachment results | BLOCKED | BLOCKED | `scanAttachment` fails closed in production when scanner settings are absent; env schema requires scanner settings in production | `MALWARE_SCANNER_URL` and `MALWARE_SCANNER_TOKEN` are missing |
| Cron/background jobs | Yes | BLOCKED | BLOCKED | `vercel.json` schedules `/api/internal/jobs/workspace-deletion`; route requires `CRON_SECRET` | Staging cron binding and distinct secret are missing |
| Google OAuth/provider | Required if enabled in staging | BLOCKED | BLOCKED | Supabase config disables local Google OAuth; server schema expects Google client credentials | Staging provider credentials and redirect URI are unavailable |
| Domain/redirect configuration | Yes | BLOCKED | BLOCKED | Docs provisionally name `taskflow-mvp-staging.vercel.app`; local Supabase config only contains localhost redirects | Staging Vercel domain, Supabase auth redirects, cookie domain and CORS are not verified |
| Backup provider | Required before production recovery claim | BLOCKED | BLOCKED | Production env validation requires backup metadata; disaster recovery docs state Free Plan managed backup/PITR is unavailable | No staging backup provider or isolated restore evidence |

## Safe Staging Isolation

Status: **BLOCKED**.

The following values must be supplied from a dedicated staging environment, without using production values:

- `APP_ENV=staging`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_STAGING_PROJECT_REF`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_DB_URL`
- `STRIPE_PRICE_PRO_MONTHLY`
- staging Stripe webhook secret/configuration
- staging Resend key and sender
- staging `CRON_SECRET`
- staging malware scanner URL/token
- staging Sentry DSN/project values
- staging E2E fixture configuration

Required isolation checks, not yet verified:

- Staging Supabase project ref differs from production.
- Staging database URL differs from production.
- Staging service-role credential differs from production.
- Staging Stripe account/state and webhook secret are test/staging-only.
- Staging storage bucket/path is isolated.
- Staging email sender is not a production sender where avoidable.
- Staging cron secret is distinct.
- Auth redirect URLs, cookies, CORS and site URL target staging only.

## Commands and Results

| Command | Status | Result |
|---|---|---|
| `npm run env:check` | PASS | Validated 29 environment variable keys and public/secret boundaries. This does not prove staging configuration. |
| `npm run test:migrations` | PASS | Static migration safety passed for 16 migrations, including the Phase 4 last-owner trigger migration. |
| `npm run test:security:database` | BLOCKED | `SUPABASE_DB_URL` is required for the real database security audit. |
| `npm run test:recovery:staging` | BLOCKED | Refused because `APP_ENV` was not `staging`; no recovery operation was attempted. |
| Staging variable presence audit | BLOCKED | All inspected staging-specific process variables were missing. Values were not printed. |

## Required Next Action

Provision an isolated staging Supabase project and environment-scoped secrets. Re-run database security, migration, backup/restore, concurrency and staging E2E gates only against that isolated environment.
