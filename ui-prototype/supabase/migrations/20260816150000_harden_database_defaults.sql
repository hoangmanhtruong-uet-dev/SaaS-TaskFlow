-- Keep future application objects private unless a migration grants access explicitly.
revoke create on schema public from public, anon, authenticated;

alter default privileges for role postgres in schema public revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema public grant all on tables to service_role;

alter default privileges for role postgres in schema public revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema public grant all on sequences to service_role;

alter default privileges for role postgres in schema public revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public grant execute on functions to service_role;

-- These tables are intentionally server-only. Explicit deny policies document and
-- preserve that boundary even if a table grant is added accidentally later.
create policy attachment_uploads_server_only on public.attachment_uploads
  for all to authenticated using (false) with check (false);
create policy task_checklist_items_server_only on public.task_checklist_items
  for all to authenticated using (false) with check (false);
create policy task_reminder_deliveries_server_only on public.task_reminder_deliveries
  for all to authenticated using (false) with check (false);

revoke all on public.attachment_uploads, public.task_checklist_items,
  public.task_reminder_deliveries from anon, authenticated;
grant all privileges on public.attachment_uploads, public.task_checklist_items,
  public.task_reminder_deliveries to service_role;
