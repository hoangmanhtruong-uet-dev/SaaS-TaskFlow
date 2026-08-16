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
