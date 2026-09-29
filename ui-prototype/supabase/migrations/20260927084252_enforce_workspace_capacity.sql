-- Capacity is enforced in the database because application-side count then
-- insert checks race under concurrent requests.  Lock the workspace row so all
-- quota-changing writes for one tenant serialize without affecting other ones.

create or replace function private.workspace_member_limit(target_workspace uuid)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_plan text;
  paid_quantity integer;
begin
  select plan::text into workspace_plan
  from public.workspaces
  where id = target_workspace
  for update;

  if not found then
    raise exception 'workspace not found';
  end if;

  if workspace_plan = 'PRO' then
    select greatest(1, coalesce(quantity, 1)) into paid_quantity
    from public.subscriptions
    where workspace_id = target_workspace
      and status in ('active', 'trialing')
    limit 1;
    return coalesce(paid_quantity, 1);
  end if;

  return 5;
end;
$$;

create or replace function private.enforce_workspace_member_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  used_seats integer;
  allowed_seats integer;
begin
  if tg_op = 'UPDATE' and old.status = new.status then
    return new;
  end if;
  if new.status <> 'ACTIVE' then
    return new;
  end if;

  allowed_seats := private.workspace_member_limit(new.workspace_id);
  select count(*) into used_seats
  from public.memberships
  where workspace_id = new.workspace_id
    and status = 'ACTIVE';

  if used_seats >= allowed_seats then
    raise exception 'workspace member limit reached';
  end if;
  return new;
end;
$$;

create or replace function private.enforce_workspace_invitation_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  used_seats integer;
  allowed_seats integer;
begin
  if new.status <> 'PENDING' then
    return new;
  end if;

  allowed_seats := private.workspace_member_limit(new.workspace_id);
  select count(*) into used_seats
  from public.memberships
  where workspace_id = new.workspace_id
    and status = 'ACTIVE';
  used_seats := used_seats + (
    select count(*)
    from public.invitations
    where workspace_id = new.workspace_id
      and status = 'PENDING'
      and expires_at > now()
  );

  if used_seats >= allowed_seats then
    raise exception 'workspace invitation limit reached';
  end if;
  return new;
end;
$$;

create or replace function private.enforce_workspace_project_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  workspace_plan text;
  active_projects integer;
begin
  select plan::text into workspace_plan
  from public.workspaces
  where id = new.workspace_id
  for update;

  if not found then
    raise exception 'workspace not found';
  end if;
  if workspace_plan = 'PRO' then
    return new;
  end if;

  select count(*) into active_projects
  from public.projects
  where workspace_id = new.workspace_id
    and archived_at is null;

  if active_projects >= 3 then
    raise exception 'workspace project limit reached';
  end if;
  return new;
end;
$$;

revoke all on function private.workspace_member_limit(uuid) from public, anon, authenticated;
revoke all on function private.enforce_workspace_member_capacity() from public, anon, authenticated;
revoke all on function private.enforce_workspace_invitation_capacity() from public, anon, authenticated;
revoke all on function private.enforce_workspace_project_capacity() from public, anon, authenticated;

create trigger memberships_enforce_workspace_capacity
before insert or update of status on public.memberships
for each row execute function private.enforce_workspace_member_capacity();

create trigger invitations_enforce_workspace_capacity
before insert or update of status on public.invitations
for each row execute function private.enforce_workspace_invitation_capacity();

create trigger projects_enforce_workspace_capacity
before insert on public.projects
for each row execute function private.enforce_workspace_project_capacity();
