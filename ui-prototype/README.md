# TaskFlow

Production-oriented workspace and task management SaaS built with Next.js 16,
Supabase Auth/Postgres, Drizzle ORM, Resend, and Stripe.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
npm install
npm run dev
npm run build
```

Copy `.env.example` to `.env.local`, configure the local Supabase credentials,
then run the commands above. Versioned production migrations live in
`supabase/migrations`; the legacy SQLite files remain only as migration-history
and security-test fixtures.

## Supabase Authentication

TaskFlow uses Supabase Auth with email/password and Google OAuth. `proxy.ts`
refreshes SSR cookies with `getClaims()`, while protected server routes call
`getUser()` for a fresh identity check. OAuth and email confirmation use the
PKCE callback routes under `/auth`; all return paths are restricted to safe
same-origin relative URLs. Workspace membership and project permissions remain
separate authorization checks in the database and API layer.

## Useful Commands

- `npm run dev`: start local development
- `npm run build`: verify the Next.js production build
- `npm test`: build the starter and verify its rendered loading skeleton
- `npm run db:generate`: generate Drizzle migrations after schema changes

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase SSR Auth](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Drizzle PostgreSQL Guide](https://orm.drizzle.team/docs/get-started-postgresql)
