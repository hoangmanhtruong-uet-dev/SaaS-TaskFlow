create or replace function private.sync_auth_user_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    provider_user_id,
    email,
    name,
    avatar_url,
    email_verified_at,
    updated_at
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
