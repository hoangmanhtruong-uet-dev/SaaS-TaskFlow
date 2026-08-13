alter table public.profiles add column if not exists provider_user_id text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists email_verified_at timestamptz;
update public.profiles set provider_user_id = id::text where provider_user_id is null;
alter table public.profiles alter column provider_user_id set not null;
create unique index if not exists profiles_provider_uidx on public.profiles(provider_user_id);

create table public.task_assignees (
  workspace_id uuid not null,
  task_id uuid not null,
  membership_id uuid not null,
  primary key (task_id, membership_id),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade,
  foreign key (workspace_id, membership_id) references public.memberships(workspace_id, id) on delete cascade
);

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  color text not null check (char_length(color) between 1 and 32),
  created_at timestamptz not null default now(),
  unique (workspace_id, name),
  unique (workspace_id, id)
);

create table public.task_labels (
  workspace_id uuid not null,
  task_id uuid not null,
  label_id uuid not null,
  primary key (task_id, label_id),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade,
  foreign key (workspace_id, label_id) references public.labels(workspace_id, id) on delete cascade
);

create table public.attachments (
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

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces(id) on delete cascade,
  recipient_user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  title text not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.auth_sessions (
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

create table public.auth_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  purpose text not null check (purpose in ('EMAIL_VERIFY', 'PASSWORD_RESET')),
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.rate_limits (
  key text not null,
  window_started_at timestamptz not null,
  count integer not null default 0 check (count >= 0),
  blocked_until timestamptz,
  updated_at timestamptz not null default now(),
  primary key (key, window_started_at)
);

create table public.workspace_tombstones (
  workspace_id uuid primary key,
  name text not null,
  slug text not null,
  requested_at timestamptz not null,
  deleted_at timestamptz not null,
  owner_user_id uuid,
  metadata jsonb not null default '{}'::jsonb
);

create table public.outbox_events (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  type text not null,
  payload jsonb not null,
  attempts integer not null default 0 check (attempts >= 0),
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.idempotency_records (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  key text not null,
  operation text not null,
  response_hash text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  primary key (workspace_id, key, operation)
);

create index task_assignees_membership_idx on public.task_assignees(workspace_id, membership_id, task_id);
create index task_labels_label_idx on public.task_labels(workspace_id, label_id, task_id);
create index attachments_task_idx on public.attachments(workspace_id, task_id, created_at);
create index notifications_recipient_idx on public.notifications(recipient_user_id, read_at, created_at desc);
create index auth_sessions_user_idx on public.auth_sessions(user_id, revoked_at, expires_at);
create index auth_tokens_user_idx on public.auth_tokens(user_id, purpose, used_at);
create index rate_limits_cleanup_idx on public.rate_limits(updated_at);
create index outbox_pending_idx on public.outbox_events(processed_at, available_at, created_at);
create index idempotency_expiry_idx on public.idempotency_records(expires_at);

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

create policy task_assignees_scoped_select on public.task_assignees for select to authenticated
  using (exists(select 1 from public.tasks t where t.id = task_id and t.workspace_id = workspace_id and (select private.can_read_project(workspace_id, t.project_id))));
create policy labels_member_select on public.labels for select to authenticated
  using ((select private.is_active_workspace_member(workspace_id)));
create policy task_labels_scoped_select on public.task_labels for select to authenticated
  using (exists(select 1 from public.tasks t where t.id = task_id and t.workspace_id = workspace_id and (select private.can_read_project(workspace_id, t.project_id))));
create policy attachments_scoped_select on public.attachments for select to authenticated
  using (exists(select 1 from public.tasks t where t.id = task_id and t.workspace_id = workspace_id and (select private.can_read_project(workspace_id, t.project_id))));
create policy notifications_self_select on public.notifications for select to authenticated
  using (recipient_user_id = (select auth.uid()));
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
