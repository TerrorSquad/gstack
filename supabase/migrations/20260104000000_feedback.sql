-- User feedback. Self-hosted (no third-party widget): the FeedbackWidget POSTs
-- straight into this table, RLS-scoped like every other resource. Append-only —
-- users submit and read their own; admins read the whole tenant's. No update or
-- delete policy (feedback is a record, not editable state).

create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  message text not null,
  -- The route the user was on when they submitted, for context. Optional.
  page text not null default '',
  created_at timestamptz not null default now()
);

create index feedback_tenant_id_idx on public.feedback (tenant_id);
create index feedback_user_id_idx on public.feedback (user_id);

alter table public.feedback enable row level security;

create policy "feedback_select_owner_or_admin" on public.feedback
  for select using (
    tenant_id = public.current_tenant_id()
    and (user_id = auth.uid() or public.current_role() = 'admin')
  );

create policy "feedback_insert_own" on public.feedback
  for insert with check (tenant_id = public.current_tenant_id() and user_id = auth.uid());

-- Table grants (RLS gates rows; grants gate table access). Append-only for
-- users: select + insert, no update/delete. service_role already has all-tables.
grant select, insert on public.feedback to authenticated;
