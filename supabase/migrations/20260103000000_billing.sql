-- Phase 4: billing. One subscription row per tenant; a tenant with no row is on
-- the free plan. Rows are written only by the billing webhook (service role);
-- tenant members may read their own tenant's subscription.

create type public.subscription_status as enum (
  'trialing', 'active', 'past_due', 'canceled', 'incomplete'
);

create table public.subscriptions (
  tenant_id uuid primary key references public.tenants (id) on delete cascade,
  provider text not null default 'polar',
  external_id text, -- provider's subscription id
  external_customer_id text, -- provider's customer id (for the billing portal)
  plan text not null default 'free', -- matches app/utils/plans.ts ids
  status public.subscription_status not null default 'active',
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "subscriptions_select_tenant" on public.subscriptions
  for select using (tenant_id = public.current_tenant_id());

-- No insert/update/delete policy: only the service role (billing webhook) writes.
grant select on public.subscriptions to authenticated;
grant select, insert, update, delete on public.subscriptions to service_role;
