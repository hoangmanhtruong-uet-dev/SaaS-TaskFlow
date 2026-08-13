create policy invitations_server_only on public.invitations
  for all to authenticated
  using (false)
  with check (false);

create policy stripe_events_server_only on public.stripe_events
  for all to authenticated
  using (false)
  with check (false);

create index project_members_project_fk_idx
  on public.project_members(workspace_id, project_id);

create index tasks_column_fk_idx
  on public.tasks(workspace_id, column_id);

create index invitations_creator_idx
  on public.invitations(created_by_user_id);

create index activity_events_actor_idx
  on public.activity_events(actor_user_id)
  where actor_user_id is not null;
