create policy auth_sessions_server_only on public.auth_sessions for all to authenticated using (false) with check (false);
create policy auth_tokens_server_only on public.auth_tokens for all to authenticated using (false) with check (false);
create policy rate_limits_server_only on public.rate_limits for all to authenticated using (false) with check (false);
create policy workspace_tombstones_server_only on public.workspace_tombstones for all to authenticated using (false) with check (false);
create policy outbox_events_server_only on public.outbox_events for all to authenticated using (false) with check (false);
create policy idempotency_records_server_only on public.idempotency_records for all to authenticated using (false) with check (false);

create index auth_sessions_rotated_from_idx on public.auth_sessions(rotated_from_session_id) where rotated_from_session_id is not null;
create index notifications_workspace_idx on public.notifications(workspace_id) where workspace_id is not null;
create index outbox_workspace_idx on public.outbox_events(workspace_id);
create index task_assignees_task_fk_idx on public.task_assignees(workspace_id, task_id);
create index task_labels_task_fk_idx on public.task_labels(workspace_id, task_id);
