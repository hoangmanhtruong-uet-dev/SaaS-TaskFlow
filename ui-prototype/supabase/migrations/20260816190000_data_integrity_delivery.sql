-- Data baseline 3.1-3.4: invariants, idempotency, outbox delivery and growth indexes.

-- A workspace can never have two active owners, including when a worker or
-- administrator writes around the application API.
create unique index memberships_one_active_owner_uidx
  on public.memberships(workspace_id)
  where role = 'OWNER' and status = 'ACTIVE';

alter table public.idempotency_records
  add column actor_user_id uuid references public.profiles(id) on delete cascade,
  add column request_hash text,
  add column response_status integer,
  add column response_body jsonb,
  add column completed_at timestamptz;

alter table public.idempotency_records
  add constraint idempotency_request_hash_check
    check (request_hash is null or char_length(request_hash) = 64),
  add constraint idempotency_response_status_check
    check (response_status is null or response_status between 100 and 599),
  add constraint idempotency_completion_check
    check ((completed_at is null and response_status is null and response_body is null)
      or (completed_at is not null and response_status is not null and response_body is not null));

create index idempotency_actor_lookup_idx
  on public.idempotency_records(workspace_id, actor_user_id, operation, created_at desc);

alter table public.outbox_events
  add column dedup_key text,
  add column locked_at timestamptz,
  add column last_error text;

create unique index outbox_dedup_uidx
  on public.outbox_events(workspace_id, dedup_key)
  where dedup_key is not null;

create index outbox_claim_idx
  on public.outbox_events(available_at, created_at)
  where processed_at is null;

-- Keyset pagination indexes match the production filter and sort order.
create index tasks_workspace_cursor_idx
  on public.tasks(workspace_id, archived_at, position, id);
create index projects_workspace_cursor_idx
  on public.projects(workspace_id, archived_at, updated_at desc, id desc);
create index invitations_workspace_cursor_idx
  on public.invitations(workspace_id, created_at desc, id desc);

-- Search uses PostgreSQL instead of loading an entire tenant into JavaScript.
create index tasks_title_fts_idx
  on public.tasks using gin (to_tsvector('simple', title));

