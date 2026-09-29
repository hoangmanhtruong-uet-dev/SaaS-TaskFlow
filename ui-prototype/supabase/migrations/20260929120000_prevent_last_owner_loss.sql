-- Preserve the workspace ownership invariant under concurrent membership changes.
create or replace function private.prevent_last_owner_loss()
returns trigger
language plpgsql
security definer
set search_path = public, private
as $$
begin
  if old.role = 'OWNER'
    and old.status = 'ACTIVE'
    and not (new.role = 'OWNER' and new.status = 'ACTIVE')
    and not exists (
      select 1
      from public.memberships remaining_owner
      where remaining_owner.workspace_id = old.workspace_id
        and remaining_owner.id <> old.id
        and remaining_owner.role = 'OWNER'
        and remaining_owner.status = 'ACTIVE'
    ) then
    raise exception using
      errcode = 'check_violation',
      message = 'LAST_OWNER';
  end if;

  return new;
end;
$$;

revoke all on function private.prevent_last_owner_loss() from public;

create or replace trigger memberships_prevent_last_owner_loss
before update of role, status on public.memberships
for each row
execute function private.prevent_last_owner_loss();
