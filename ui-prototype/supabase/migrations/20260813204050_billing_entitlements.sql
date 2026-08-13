alter table public.subscriptions
  add column if not exists stripe_subscription_item_id text,
  add column if not exists stripe_price_id text,
  add column if not exists stripe_product_id text,
  add column if not exists quantity integer not null default 1,
  add column if not exists last_invoice_status text,
  add column if not exists provider_updated_at timestamptz not null default now();

alter table public.subscriptions
  add constraint subscriptions_quantity_check check (quantity >= 1);

create unique index if not exists subscriptions_stripe_item_uidx
  on public.subscriptions(stripe_subscription_item_id)
  where stripe_subscription_item_id is not null;

create index if not exists subscriptions_entitlement_idx
  on public.subscriptions(workspace_id, status, stripe_price_id, provider_updated_at desc);

comment on table public.subscriptions is
  'Server-managed Stripe subscription snapshot. Entitlements must only be derived from verified webhook data.';

revoke all on public.stripe_events from anon, authenticated;
revoke insert, update, delete on public.subscriptions from anon, authenticated;
