create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 240),
  completed boolean not null default false,
  position integer not null check (position >= 0),
  created_by_user_id uuid references public.profiles(id) on delete set null,
  completed_by_user_id uuid references public.profiles(id) on delete set null,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade,
  check ((completed and completed_at is not null) or (not completed and completed_at is null))
);

create index task_checklist_items_task_position_idx on public.task_checklist_items(workspace_id, task_id, position);
alter table public.task_checklist_items enable row level security;
revoke all on public.task_checklist_items from anon, authenticated;
grant all privileges on public.task_checklist_items to service_role;
