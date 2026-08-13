create extension if not exists pgcrypto;

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.workspace_role as enum ('OWNER', 'ADMIN', 'MEMBER', 'GUEST');
create type public.membership_status as enum ('ACTIVE', 'SUSPENDED', 'LEFT');
create type public.project_visibility as enum ('WORKSPACE', 'PRIVATE');
create type public.project_access_level as enum ('VIEW', 'COMMENT', 'EDIT');
create type public.invitation_status as enum ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'USED', 'REVOKED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  email_normalized text generated always as (lower(trim(email))) stored,
  name text not null default '',
  timezone text not null default 'Asia/Ho_Chi_Minh',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (email_normalized)
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  plan text not null default 'FREE' check (plan in ('FREE', 'PRO')),
  archived_at timestamptz,
  deletion_requested_at timestamptz,
  deletion_scheduled_for timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null,
  status public.membership_status not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, user_id),
  unique (workspace_id, id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  visibility public.project_visibility not null default 'WORKSPACE',
  lead_membership_id uuid,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  foreign key (workspace_id, lead_membership_id) references public.memberships(workspace_id, id)
);

create table public.project_members (
  workspace_id uuid not null,
  project_id uuid not null,
  membership_id uuid not null,
  access_level public.project_access_level not null default 'VIEW',
  primary key (project_id, membership_id),
  foreign key (workspace_id, project_id) references public.projects(workspace_id, id) on delete cascade,
  foreign key (workspace_id, membership_id) references public.memberships(workspace_id, id) on delete cascade
);

create table public.boards (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null, project_id uuid not null,
  name text not null check (char_length(name) between 1 and 120), version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (workspace_id, id), foreign key (workspace_id, project_id) references public.projects(workspace_id, id) on delete cascade
);

create table public.board_columns (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null, board_id uuid not null,
  name text not null check (char_length(name) between 1 and 120), position integer not null check (position >= 0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (workspace_id, id), foreign key (workspace_id, board_id) references public.boards(workspace_id, id) on delete cascade
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null, project_id uuid not null, board_id uuid not null, column_id uuid not null,
  creator_membership_id uuid not null, title text not null check (char_length(title) between 1 and 240), description text not null default '',
  priority text not null default 'MEDIUM' check (priority in ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
  position integer not null check (position >= 0), due_at timestamptz, version integer not null default 1 check (version > 0), archived_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique (workspace_id, id),
  foreign key (workspace_id, project_id) references public.projects(workspace_id, id) on delete cascade,
  foreign key (workspace_id, board_id) references public.boards(workspace_id, id) on delete cascade,
  foreign key (workspace_id, column_id) references public.board_columns(workspace_id, id),
  foreign key (workspace_id, creator_membership_id) references public.memberships(workspace_id, id)
);

create table public.comments (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null, task_id uuid not null, author_membership_id uuid not null,
  body text not null check (char_length(body) between 1 and 5000), hidden_by_admin_at timestamptz, deleted_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade,
  foreign key (workspace_id, author_membership_id) references public.memberships(workspace_id, id)
);

create table public.invitations (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  email_normalized text not null check (email_normalized = lower(trim(email_normalized))), role public.workspace_role not null check (role <> 'OWNER'),
  token_hash text not null unique, status public.invitation_status not null default 'PENDING', expires_at timestamptz not null,
  accepted_at timestamptz, created_by_user_id uuid not null references public.profiles(id), created_at timestamptz not null default now()
);
create unique index invitations_pending_email_uidx on public.invitations(workspace_id, email_normalized) where status = 'PENDING';

create table public.activity_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid references public.profiles(id), action text not null, target_type text not null, target_id uuid not null,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null unique references public.workspaces(id) on delete cascade,
  stripe_customer_id text unique, stripe_subscription_id text unique, status text not null,
  current_period_end timestamptz, cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table public.stripe_events (
  id text primary key, type text not null, processed_at timestamptz not null default now()
);

create index memberships_lookup_idx on public.memberships(workspace_id, user_id, status);
create index memberships_user_status_idx on public.memberships(user_id, status, workspace_id);
create index projects_workspace_archive_idx on public.projects(workspace_id, archived_at, updated_at desc);
create index projects_lead_membership_idx on public.projects(workspace_id, lead_membership_id) where lead_membership_id is not null;
create index project_members_membership_idx on public.project_members(workspace_id, membership_id, project_id);
create index boards_project_idx on public.boards(workspace_id, project_id);
create index board_columns_board_idx on public.board_columns(workspace_id, board_id, position);
create index tasks_workspace_list_idx on public.tasks(workspace_id, project_id, column_id, archived_at, position);
create index tasks_board_idx on public.tasks(workspace_id, board_id);
create index tasks_creator_idx on public.tasks(workspace_id, creator_membership_id);
create index comments_task_created_idx on public.comments(workspace_id, task_id, created_at);
create index comments_author_idx on public.comments(workspace_id, author_membership_id);
create index invitations_workspace_idx on public.invitations(workspace_id, created_at desc);
create index activity_workspace_created_idx on public.activity_events(workspace_id, created_at desc);

create or replace function private.is_active_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists(
    select 1
    from public.memberships m
    where m.workspace_id = target_workspace
      and m.user_id = (select auth.uid())
      and m.status = 'ACTIVE'
  )
$$;

create or replace function private.has_workspace_role(target_workspace uuid, allowed public.workspace_role[])
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists(
    select 1
    from public.memberships m
    where m.workspace_id = target_workspace
      and m.user_id = (select auth.uid())
      and m.status = 'ACTIVE'
      and m.role = any(allowed)
  )
$$;

create or replace function private.can_read_project(target_workspace uuid, target_project uuid)
returns boolean language sql stable security definer set search_path = ''
as $$
  select (select auth.uid()) is not null and exists(
    select 1 from public.projects p
    join public.memberships m on m.workspace_id = p.workspace_id and m.user_id = (select auth.uid()) and m.status = 'ACTIVE'
    left join public.project_members pm on pm.workspace_id = p.workspace_id and pm.project_id = p.id and pm.membership_id = m.id
    where p.workspace_id = target_workspace and p.id = target_project
      and (m.role in ('OWNER', 'ADMIN') or (m.role = 'MEMBER' and p.visibility = 'WORKSPACE') or pm.membership_id is not null)
  )
$$;

revoke execute on function private.is_active_workspace_member(uuid) from public, anon, authenticated, service_role;
revoke execute on function private.has_workspace_role(uuid, public.workspace_role[]) from public, anon, authenticated, service_role;
revoke execute on function private.can_read_project(uuid, uuid) from public, anon, authenticated, service_role;

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.memberships enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.boards enable row level security;
alter table public.board_columns enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.invitations enable row level security;
alter table public.activity_events enable row level security;
alter table public.subscriptions enable row level security;
alter table public.stripe_events enable row level security;

create policy profiles_self_select on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy profiles_self_update on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
create policy workspaces_member_select on public.workspaces for select to authenticated using ((select private.is_active_workspace_member(id)));
create policy memberships_member_select on public.memberships for select to authenticated using ((select private.is_active_workspace_member(workspace_id)));
create policy projects_scoped_select on public.projects for select to authenticated using ((select private.can_read_project(workspace_id, id)));
create policy project_members_scoped_select on public.project_members for select to authenticated using ((select private.can_read_project(workspace_id, project_id)));
create policy boards_scoped_select on public.boards for select to authenticated using ((select private.can_read_project(workspace_id, project_id)));
create policy columns_scoped_select on public.board_columns for select to authenticated using (exists(select 1 from public.boards b where b.id = board_id and b.workspace_id = workspace_id and (select private.can_read_project(workspace_id, b.project_id))));
create policy tasks_scoped_select on public.tasks for select to authenticated using ((select private.can_read_project(workspace_id, project_id)));
create policy comments_scoped_select on public.comments for select to authenticated using (exists(select 1 from public.tasks t where t.id = task_id and t.workspace_id = workspace_id and (select private.can_read_project(workspace_id, t.project_id))));
create policy activity_admin_select on public.activity_events for select to authenticated using ((select private.has_workspace_role(workspace_id, array['OWNER', 'ADMIN']::public.workspace_role[])));
create policy subscriptions_owner_select on public.subscriptions for select to authenticated using ((select private.has_workspace_role(workspace_id, array['OWNER']::public.workspace_role[])));

revoke all on all tables in schema public from anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.profiles, public.workspaces, public.memberships, public.projects,
  public.project_members, public.boards, public.board_columns, public.tasks,
  public.comments, public.activity_events, public.subscriptions to authenticated;
grant update (name, timezone, updated_at) on public.profiles to authenticated;

grant all privileges on all tables in schema public to service_role;

revoke all on public.stripe_events from anon, authenticated;
