create table public.mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code_hash text not null unique,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index mfa_recovery_codes_user_idx on public.mfa_recovery_codes(user_id, used_at);
alter table public.mfa_recovery_codes enable row level security;
revoke all on public.mfa_recovery_codes from anon, authenticated;
grant all privileges on public.mfa_recovery_codes to service_role;
create policy mfa_recovery_codes_server_only on public.mfa_recovery_codes for all to service_role using (true) with check (true);
comment on table public.mfa_recovery_codes is 'Server-only, one-time, SHA-256 hashed MFA recovery codes.';
