# Secret inventory

Never put real values in GitHub, issue text, logs or chat. Store runtime values in each Vercel project and CI-only values in GitHub Environments.

| Variable | Browser-visible | Local | Test | Staging | Production |
|---|---:|---:|---:|---:|---:|
| `NEXT_PUBLIC_SITE_URL` | yes | ✓ | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_API_BASE_URL` | yes | ✓ | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | ✓ | ✓ | ✓ | ✓ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | yes | ✓ | ✓ | ✓ | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | no | ✓ | fake | ✓ | ✓ |
| `SUPABASE_DB_URL` | no | ✓ | ✓ | ✓ | ✓ |
| `SUPABASE_JWT_SECRET` | no | ✓ | fake | ✓ | ✓ |
| `GOOGLE_OAUTH_CLIENT_ID` | configuration | ✓ | fake | ✓ | ✓ |
| `GOOGLE_OAUTH_CLIENT_SECRET` | no | ✓ | fake | ✓ | ✓ |
| `RESEND_API_KEY` | no | optional | fake | ✓ | ✓ |
| `EMAIL_FROM`, `EMAIL_REPLY_TO` | rendered | ✓ | ✓ | ✓ | ✓ |
| `STRIPE_SECRET_KEY` | no | test | fake | test | live |
| `STRIPE_WEBHOOK_SECRET` | no | test | fake | test | live |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | yes | test | fake | test | live |
| `STRIPE_PRICE_PRO_MONTHLY` | identifier | test | fake | test | live |
| `CRON_SECRET` | no | ✓ | fake | ✓ | ✓ |
| `MALWARE_SCANNER_URL` | configuration | optional | blank | optional | ✓ |
| `MALWARE_SCANNER_TOKEN` | no | optional | blank | optional | ✓ |

Rotate immediately after suspected exposure. Service-role, Stripe secret/webhook and Resend keys must never use a `NEXT_PUBLIC_` prefix.

GitHub CI scans complete committed history with Gitleaks and audits production dependencies. Enable GitHub secret scanning and push protection in repository settings as an additional provider control.
