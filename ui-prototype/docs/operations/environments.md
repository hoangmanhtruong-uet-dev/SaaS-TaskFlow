# Environment matrix

| Environment | App URL | API | Supabase | Stripe | Email |
|---|---|---|---|---|---|
| Local | `http://localhost:3000` | `/api/v1` | Supabase CLI | test keys | log/Resend test |
| Test | in-process | `/api/v1` | ephemeral local DB | deterministic fakes | deterministic fake |
| Staging | `https://taskflow-mvp-staging.vercel.app`* | same origin | free project 1 | test mode | Resend staging |
| Production | `https://taskflow-mvp.vercel.app`* | same origin | free project 2 initially | live mode | verified sender domain required |

\* Provisional until project creation confirms availability.

## Branch mapping

- Pull requests: Vercel preview + isolated test database in CI.
- `staging`: staging project, staging Supabase, Stripe test, Resend staging.
- `main`: production project. Automatic production promotion stays disabled until go-live checklist is approved.

## Free-tier caveats

- Vercel Hobby uses separate projects because custom environments require paid plans.
- Supabase grants two active free projects and may pause inactive projects. Upgrade production before paid customer SLA.
- `vercel.app` provides hosting URL but not an email sender domain.
