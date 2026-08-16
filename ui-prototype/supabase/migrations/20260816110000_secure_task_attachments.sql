alter table public.attachments
  add column if not exists uploaded_by_user_id uuid references public.profiles(id) on delete set null;

create unique index if not exists attachments_storage_key_uidx on public.attachments(storage_key);

create table public.attachment_uploads (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  uploader_user_id uuid not null references public.profiles(id) on delete cascade,
  storage_key text not null unique,
  file_name text not null,
  mime_type text not null,
  size bigint not null check (size > 0),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  foreign key (workspace_id, task_id) references public.tasks(workspace_id, id) on delete cascade
);

create index attachment_uploads_expiry_idx on public.attachment_uploads(expires_at);
create index attachment_uploads_task_idx on public.attachment_uploads(workspace_id, task_id);
alter table public.attachment_uploads enable row level security;
revoke all on public.attachment_uploads from anon, authenticated;
grant all privileges on public.attachment_uploads to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-attachments',
  'task-attachments',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','application/pdf','text/plain','text/csv','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Browser access is only possible through short-lived, path-specific signed tokens.
-- No direct authenticated storage policy is intentionally created.
