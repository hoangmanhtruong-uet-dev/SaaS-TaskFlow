# Production-critical E2E

`npm run test:e2e` runs anonymous smoke, health, authentication-boundary, and Stripe-signature tests against a local server.

Authenticated staging tests require dedicated, non-human fixture accounts:

```text
E2E_BASE_URL=https://taskflow-mvp-staging.vercel.app
E2E_REQUIRE_READY=true
E2E_RUN_AUTH=true
E2E_WORKSPACE_ID=<shared-role-workspace>
E2E_FOREIGN_WORKSPACE_ID=<workspace-the-member-cannot-access>
E2E_OWNER_EMAIL=...
E2E_OWNER_PASSWORD=...
E2E_ADMIN_EMAIL=...
E2E_ADMIN_PASSWORD=...
E2E_MEMBER_EMAIL=...
E2E_MEMBER_PASSWORD=...
E2E_GUEST_EMAIL=...
E2E_GUEST_PASSWORD=...
```

Keep these values in GitHub Actions or Vercel secrets. Never commit fixture passwords. The suite does not create, cancel, or charge a Stripe subscription; it verifies the entitlement produced by webhook processing.

For a disposable staging run, use the guarded fixture runner. It creates temporary
Supabase Auth users and tenant rows, runs the authenticated suite, and removes all
fixtures in a `finally` block. Credentials exist only in the runner process.

The runner requires these values from local configuration or the GitHub
`staging` environment. Store `NEXT_PUBLIC_SUPABASE_URL` and
`STRIPE_PRICE_PRO_MONTHLY` as environment variables; store
`SUPABASE_SERVICE_ROLE_KEY` and `SUPABASE_DB_URL` as environment secrets. Vercel masks sensitive values
when pulling them locally, so do not use `vercel env pull` as the credential source.

```powershell
$env:APP_ENV='staging'
$env:E2E_BASE_URL='https://taskflow-mvp-staging.vercel.app'
$env:TASKFLOW_CONFIRM_E2E_PROVISION='STAGING_ONLY'
npm run test:e2e:staging:provision
```

GitHub Actions runs the same guarded command manually or on the daily schedule in
`.github/workflows/staging-e2e.yml`. Configure its secrets in the protected
`staging` environment; do not store them as repository variables.
