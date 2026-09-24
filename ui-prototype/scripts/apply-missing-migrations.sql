-- ============================================================
-- APPLY MISSING MIGRATIONS TO SUPABASE
-- Chạy file này trong Supabase SQL Editor
-- Project: ufdqvggtluwnpzxksein
-- ============================================================

-- ============================================================
-- Migration: 20260813174239 - harden_server_only_tables_and_fk_indexes
-- ============================================================
drop policy if exists invitations_server_only on public.invitations;
create policy invitations_server_only on public.invitations
  for all to authenticated
  using (false)
  with check (false);

drop policy if exists stripe_events_server_only on public.stripe_events;
create policy stripe_events_server_only on public.stripe_events
  for all to authenticated
  using (false)
  with check (false);

create index if not exists project_members_project_fk_idx
  on public.project_members(workspace_id, project_id);

create index if not exists tasks_column_fk_idx
  on public.tasks(workspace_id, column_id);

create index if not exists invitations_creator_idx
  on public.invitations(created_by_user_id);

create index if not exists activity_events_actor_idx
  on public.activity_events(actor_user_id)
  where actor_user_id is not null;

-- ============================================================
-- Migration: 20260813174508 - allow_rls_policy_helpers
-- ============================================================
grant execute on function private.is_active_workspace_member(uuid) to authenticated;
grant execute on function private.has_workspace_role(uuid, public.workspace_role[]) to authenticated;
grant execute on function private.can_read_project(uuid, uuid) to authenticated;

revoke usage on schema private from public, anon, authenticated;

-- ============================================================
-- Migration: 20260813180533 - complete_runtime_schema
-- ============================================================
alter table public.profiles add column if not exists provider_user_id text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists email_verified_at timestamptz;
update public.profiles set provider_user_id = id::text where provider_user_id is null;
alter table public.profiles alter column provider_user_id set not null;
create unique index if not exists profiles_provider_uidx on public.profiles(provider_user_id);

create table if not exists public.task_assignees (
  workspace_id uuid not null,
  task_id uuid not null,
  membership_id uuid not null,
  primary key (task_id, membership_id),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade,
  foreign key (workspace_id, membership_id) references public.memberships(workspace_id, id) on delete cascade
);

create table if not exists public.labels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  color text not null check (char_length(color) between 1 and 32),
  created_at timestamptz not null default now(),
  unique (workspace_id, name),
  unique (workspace_id, id)
);

create table if not exists public.task_labels (
  workspace_id uuid not null,
  task_id uuid not null,
  label_id uuid not null,
  primary key (task_id, label_id),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade,
  foreign key (workspace_id, label_id) references public.labels(workspace_id, id) on delete cascade
);

create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  task_id uuid not null,
  storage_key text not null unique,
  file_name text not null,
  mime_type text not null,
  size bigint not null check (size >= 0),
  created_at timestamptz not null default now(),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text not null default 'supabase',
  token_hash text not null unique,
  expires_at timestamptz not null,
  rotated_from_session_id uuid references public.auth_sessions(id),
  last_seen_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.auth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null check (purpose in ('EMAIL_VERIFY', 'PASSWORD_RESET')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.rate_limits (
  key text not null,
  window_started_at timestamptz not null,
  count integer not null default 0 check (count >= 0),
  blocked_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (key, window_started_at)
);

create table if not exists public.workspace_tombstones (
  workspace_id uuid primary key,
  name text not null,
  slug text not null,
  requested_at timestamptz not null,
  deleted_at timestamptz not null,
  owner_user_id uuid,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null,
  payload jsonb not null,
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.idempotency_records (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  key text not null,
  operation text not null,
  response_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, key, operation)
);

create index if not exists task_assignees_membership_idx on public.task_assignees(workspace_id, membership_id, task_id);
create index if not exists task_labels_label_idx on public.task_labels(workspace_id, label_id, task_id);
create index if not exists attachments_task_idx on public.attachments(workspace_id, task_id, created_at);
create index if not exists notifications_recipient_idx on public.notifications(recipient_user_id, read_at, created_at desc);
create index if not exists auth_sessions_user_idx on public.auth_sessions(user_id, revoked_at, expires_at);
create index if not exists auth_tokens_user_idx on public.auth_tokens(user_id, purpose, used_at);
create index if not exists rate_limits_cleanup_idx on public.rate_limits(updated_at);
create index if not exists outbox_pending_idx on public.outbox_events(processed_at, available_at, created_at);
create index if not exists idempotency_expiry_idx on public.idempotency_records(expires_at);

alter table public.task_assignees enable row level security;
alter table public.labels enable row level security;
alter table public.task_labels enable row level security;
alter table public.attachments enable row level security;
alter table public.notifications enable row level security;
alter table public.auth_sessions enable row level security;
alter table public.auth_tokens enable row level security;
alter table public.rate_limits enable row level security;
alter table public.workspace_tombstones enable row level security;
alter table public.outbox_events enable row level security;
alter table public.idempotency_records enable row level security;

drop policy if exists task_assignees_scoped_select on public.task_assignees;
create policy task_assignees_scoped_select on public.task_assignees for select to authenticated
  using (exists(select 1 from public.tasks t where t.id = task_id and t.workspace_id = workspace_id and (select private.can_read_project(workspace_id, t.project_id))));

drop policy if exists labels_member_select on public.labels;
create policy labels_member_select on public.labels for select to authenticated
  using ((select private.is_active_workspace_member(workspace_id)));

drop policy if exists task_labels_scoped_select on public.task_labels;
create policy task_labels_scoped_select on public.task_labels for select to authenticated
  using (exists(select 1 from public.tasks t where t.id = task_id and t.workspace_id = workspace_id and (select private.can_read_project(workspace_id, t.project_id))));

drop policy if exists attachments_scoped_select on public.attachments;
create policy attachments_scoped_select on public.attachments for select to authenticated
  using (exists(select 1 from public.tasks t where t.id = task_id and t.workspace_id = workspace_id and (select private.can_read_project(workspace_id, t.project_id))));

drop policy if exists notifications_self_select on public.notifications;
create policy notifications_self_select on public.notifications for select to authenticated
  using (recipient_user_id = (select auth.uid()));

drop policy if exists notifications_self_update on public.notifications;
create policy notifications_self_update on public.notifications for update to authenticated
  using (recipient_user_id = (select auth.uid())) with check (recipient_user_id = (select auth.uid()));

revoke all on public.task_assignees, public.labels, public.task_labels, public.attachments,
  public.notifications, public.auth_sessions, public.auth_tokens, public.rate_limits,
  public.workspace_tombstones, public.outbox_events, public.idempotency_records from anon, authenticated;
grant select on public.task_assignees, public.labels, public.task_labels, public.attachments, public.notifications to authenticated;
grant update (read_at) on public.notifications to authenticated;
grant all privileges on public.task_assignees, public.labels, public.task_labels, public.attachments,
  public.notifications, public.auth_sessions, public.auth_tokens, public.rate_limits,
  public.workspace_tombstones, public.outbox_events, public.idempotency_records to service_role;

-- ============================================================
-- Migration: 20260813180603 - address_runtime_advisors
-- ============================================================
drop policy if exists auth_sessions_server_only on public.auth_sessions;
create policy auth_sessions_server_only on public.auth_sessions for all to authenticated using (false) with check (false);

drop policy if exists auth_tokens_server_only on public.auth_tokens;
create policy auth_tokens_server_only on public.auth_tokens for all to authenticated using (false) with check (false);

drop policy if exists rate_limits_server_only on public.rate_limits;
create policy rate_limits_server_only on public.rate_limits for all to authenticated using (false) with check (false);

drop policy if exists workspace_tombstones_server_only on public.workspace_tombstones;
create policy workspace_tombstones_server_only on public.workspace_tombstones for all to authenticated using (false) with check (false);

drop policy if exists outbox_events_server_only on public.outbox_events;
create policy outbox_events_server_only on public.outbox_events for all to authenticated using (false) with check (false);

drop policy if exists idempotency_records_server_only on public.idempotency_records;
create policy idempotency_records_server_only on public.idempotency_records for all to authenticated using (false) with check (false);

create index if not exists auth_sessions_rotated_from_idx on public.auth_sessions(rotated_from_session_id) where rotated_from_session_id is not null;
create index if not exists notifications_workspace_idx on public.notifications(workspace_id) where workspace_id is not null;
create index if not exists outbox_workspace_idx on public.outbox_events(workspace_id);
create index if not exists task_assignees_task_fk_idx on public.task_assignees(workspace_id, task_id);
create index if not exists task_labels_task_fk_idx on public.task_labels(workspace_id, task_id);

-- ============================================================
-- Migration: 20260813181034 - provision_profiles_from_auth
-- ============================================================
create or replace function private.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id, provider_user_id, email, name, avatar_url, email_verified_at, updated_at
  ) values (
    new.id,
    new.id::text,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    new.email_confirmed_at,
    now()
  )
  on conflict (id) do update set
    provider_user_id = excluded.provider_user_id,
    email = excluded.email,
    name = excluded.name,
    avatar_url = excluded.avatar_url,
    email_verified_at = excluded.email_verified_at,
    updated_at = now();
  return new;
end;
$$;

revoke execute on function private.sync_auth_user_profile() from public, anon, authenticated, service_role;

drop trigger if exists sync_auth_user_profile_after_change on auth.users;
create trigger sync_auth_user_profile_after_change
after insert or update of email, email_confirmed_at, raw_user_meta_data on auth.users
for each row execute function private.sync_auth_user_profile();

insert into public.profiles (id, provider_user_id, email, name, avatar_url, email_verified_at, updated_at)
select
  u.id,
  u.id::text,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(coalesce(u.email, ''), '@', 1)),
  u.raw_user_meta_data ->> 'avatar_url',
  u.email_confirmed_at,
  now()
from auth.users u
on conflict (id) do update set
  provider_user_id = excluded.provider_user_id,
  email = excluded.email,
  name = excluded.name,
  avatar_url = excluded.avatar_url,
  email_verified_at = excluded.email_verified_at,
  updated_at = now();

-- ============================================================
-- Migration: 20260813204050 - billing_entitlements
-- ============================================================
alter table public.subscriptions
  add column if not exists stripe_subscription_item_id text,
  add column if not exists stripe_price_id text,
  add column if not exists stripe_product_id text,
  add column if not exists quantity integer not null default 1,
  add column if not exists last_invoice_status text,
  add column if not exists provider_updated_at timestamptz not null default now();

alter table public.subscriptions
  drop constraint if exists subscriptions_quantity_check;
alter table public.subscriptions
  add constraint subscriptions_quantity_check check (quantity >= 1);

create unique index if not exists subscriptions_stripe_item_uidx
  on public.subscriptions(stripe_subscription_item_id)
  where stripe_subscription_item_id is not null;

create index if not exists subscriptions_entitlement_idx
  on public.subscriptions(workspace_id, status, stripe_price_id, provider_updated_at desc);

comment on table public.subscriptions is
  'Server-managed Stripe subscription snapshot. Entitlements must only be derived from verified webhook data.';

revoke all on public.stripe_events from anon, authenticated;
revoke insert, update, delete on public.subscriptions from anon, authenticated;

-- ============================================================
-- Migration: 20260816110000 - secure_task_attachments
-- ============================================================
alter table public.attachments
  add column if not exists uploaded_by_user_id uuid references public.profiles(id) on delete set null;

create unique index if not exists attachments_storage_key_uidx on public.attachments(storage_key);

create table if not exists public.attachment_uploads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  uploader_user_id uuid not null references public.profiles(id) on delete cascade,
  storage_key text not null unique,
  file_name text not null,
  mime_type text not null,
  size bigint not null check (size > 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade
);

create index if not exists attachment_uploads_expiry_idx on public.attachment_uploads(expires_at);
create index if not exists attachment_uploads_task_idx on public.attachment_uploads(workspace_id, task_id);
alter table public.attachment_uploads enable row level security;
revoke all on public.attachment_uploads from anon, authenticated;
grant all privileges on public.attachment_uploads to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-attachments',
  'task-attachments',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','application/pdf','text/plain','text/csv',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- Migration: 20260816130000 - task_checklist
-- ============================================================
create table if not exists public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  completed boolean not null default false,
  position integer not null check (position >= 0),
  created_by_user_id uuid references public.profiles(id) on delete set null,
  completed_by_user_id uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade,
  check ((completed and completed_at is not null) or (not completed and completed_at is null))
);

create index if not exists task_checklist_items_task_position_idx on public.task_checklist_items(workspace_id, task_id, position);
alter table public.task_checklist_items enable row level security;
revoke all on public.task_checklist_items from anon, authenticated;
grant all privileges on public.task_checklist_items to service_role;

-- ============================================================
-- Migration: 20260816132000 - task_deadline_reminders
-- ============================================================
create table if not exists public.task_reminder_deliveries (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (kind in ('DUE_SOON', 'OVERDUE')),
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade,
  unique (task_id, recipient_user_id, kind, due_at)
);

create index if not exists task_reminder_deliveries_workspace_idx on public.task_reminder_deliveries(workspace_id, created_at);
alter table public.task_reminder_deliveries enable row level security;
revoke all on public.task_reminder_deliveries from anon, authenticated;
grant all privileges on public.task_reminder_deliveries to service_role;

-- ============================================================
-- Migration: 20260816150000 - harden_database_defaults
-- ============================================================
revoke create on schema public from public, anon, authenticated;

alter default privileges for role postgres in schema public revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public grant all on tables to service_role;

alter default privileges for role postgres in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema public grant all on sequences to service_role;

alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public grant execute on functions to service_role;

drop policy if exists attachment_uploads_server_only on public.attachment_uploads;
create policy attachment_uploads_server_only on public.attachment_uploads
  for all to authenticated using (false) with check (false);

drop policy if exists task_checklist_items_server_only on public.task_checklist_items;
create policy task_checklist_items_server_only on public.task_checklist_items
  for all to authenticated using (false) with check (false);

drop policy if exists task_reminder_deliveries_server_only on public.task_reminder_deliveries;
create policy task_reminder_deliveries_server_only on public.task_reminder_deliveries
  for all to authenticated using (false) with check (false);

revoke all on public.attachment_uploads, public.task_checklist_items,
  public.task_reminder_deliveries from anon, authenticated;
grant all privileges on public.attachment_uploads, public.task_checklist_items,
  public.task_reminder_deliveries to service_role;

-- ============================================================
-- Migration: 20260816170000 - protect_activity_audit
-- ============================================================
create or replace function private.reject_activity_event_update()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception 'activity_events are append-only';
end;
$$;

drop trigger if exists activity_events_append_only on public.activity_events;
create trigger activity_events_append_only
before update on public.activity_events
for each row execute function private.reject_activity_event_update();

revoke execute on function private.reject_activity_event_update() from public, anon, authenticated;
comment on table public.activity_events is
  'Append-only audit trail. UPDATE is rejected by trigger; DELETE is reserved for workspace lifecycle retention and database operators.';

-- ============================================================
-- Migration: 20260816171000 - mfa_recovery_codes
-- ============================================================
create table if not exists public.mfa_recovery_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  code_hash text not null unique,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists mfa_recovery_codes_user_idx on public.mfa_recovery_codes(user_id, used_at);
alter table public.mfa_recovery_codes enable row level security;
revoke all on public.mfa_recovery_codes from anon, authenticated;
grant all privileges on public.mfa_recovery_codes to service_role;

drop policy if exists mfa_recovery_codes_server_only on public.mfa_recovery_codes;
create policy mfa_recovery_codes_server_only on public.mfa_recovery_codes for all to service_role using (true) with check (true);

comment on table public.mfa_recovery_codes is 'Server-only, one-time, SHA-256 hashed MFA recovery codes.';

-- ============================================================
-- Migration: 20260816190000 - data_integrity_delivery
-- ============================================================
create unique index if not exists memberships_one_active_owner_uidx
  on public.memberships(workspace_id)
  where role = 'OWNER' and status = 'ACTIVE';

alter table public.idempotency_records
  add column if not exists actor_user_id uuid references public.profiles(id) on delete cascade,
  add column if not exists request_hash text,
  add column if not exists response_status integer,
  add column if not exists response_body jsonb,
  add column if not exists completed_at timestamptz;

alter table public.idempotency_records
  drop constraint if exists idempotency_request_hash_check,
  drop constraint if exists idempotency_response_status_check,
  drop constraint if exists idempotency_completion_check;

alter table public.idempotency_records
  add constraint idempotency_request_hash_check
    check (request_hash is null or char_length(request_hash) = 64),
  add constraint idempotency_response_status_check
    check (response_status is null or response_status between 100 and 599),
  add constraint idempotency_completion_check
    check ((completed_at is null and response_status is null and response_body is null)
      or (completed_at is not null and response_status is not null and response_body is not null));

create index if not exists idempotency_actor_lookup_idx
  on public.idempotency_records(workspace_id, actor_user_id, operation, created_at desc);

alter table public.outbox_events
  add column if not exists dedup_key text,
  add column if not exists locked_at timestamptz,
  add column if not exists last_error text;

create unique index if not exists outbox_dedup_uidx
  on public.outbox_events(workspace_id, dedup_key)
  where dedup_key is not null;

create index if not exists outbox_claim_idx
  on public.outbox_events(available_at, created_at)
  where processed_at is null;

create index if not exists tasks_workspace_cursor_idx
  on public.tasks(workspace_id, archived_at, position, id);

create index if not exists projects_workspace_cursor_idx
  on public.projects(workspace_id, archived_at, updated_at desc, id desc);

create index if not exists invitations_workspace_cursor_idx
  on public.invitations(workspace_id, created_at desc, id desc);

create index if not exists tasks_title_fts_idx
  on public.tasks using gin (to_tsvector('simple', title));

-- ============================================================
-- DONE! Tat ca migrations da duoc apply thanh cong.
-- ============================================================
