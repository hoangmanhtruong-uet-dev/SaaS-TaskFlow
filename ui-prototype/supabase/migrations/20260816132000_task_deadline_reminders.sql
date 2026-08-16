create table public.task_reminder_deliveries (
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

create index task_reminder_deliveries_workspace_idx on public.task_reminder_deliveries(workspace_id, created_at);
alter table public.task_reminder_deliveries enable row level security;
revoke all on public.task_reminder_deliveries from anon, authenticated;
grant all privileges on public.task_reminder_deliveries to service_role;
