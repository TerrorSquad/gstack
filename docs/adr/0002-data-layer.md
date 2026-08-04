# ADR-0002: Data layer — Drizzle vs. Supabase-native

**Status:** Proposed (recommend defer Drizzle) · **Date:** 2026-07-19

## Context

Should the GStack adopt **Drizzle ORM**, or keep the **Supabase-native** data
layer (supabase-js + types generated from the live schema)?

Today: migrations are SQL in `supabase/migrations/`, RLS lives in those
migrations, and `pnpm db:types` generates `database.types.ts` — giving end-to-end
type safety with no ORM. Queries are supabase-js (`.from().select()`), which
respects RLS on both client and server.

## Options

**A. Supabase-native (current).**
- ➕ RLS-first: one place owns schema + policies; the client query path is
  RLS-enforced by construction.
- ➕ Already type-safe end to end (generated types + `Pick`-based mappers).
- ➕ Zero extra dependency or migration tool.
- ➖ Complex server queries (joins, aggregates) are more awkward in PostgREST
  syntax; deep embeds aren't typed by the generated types.

**B. Adopt Drizzle for everything (schema + migrations + queries).**
- ➕ TS-first schema, ergonomic type-safe queries, great for complex server logic.
- ➖ Fights Supabase: RLS is clumsy to express in Drizzle, and Drizzle owning
  migrations means **two migration tools** competing with the Supabase CLI
  (which also manages Auth/Storage schema). High friction, weakens the RLS-first
  principle.

**C. Hybrid — Supabase owns schema/RLS, Drizzle as a typed *read* layer** (schema
introspected via `drizzle-kit pull`, used only for server-side queries).
- ➕ Drizzle's query ergonomics server-side without dual-migration ownership.
- ➖ Two representations of the schema to keep in sync; added dependency for a
  benefit we don't yet need.

## Decision

**Defer Drizzle (stay on Option A).** We already have end-to-end type safety, and
adding an ORM now buys ergonomics we don't need yet while eroding the RLS-first
model. Introduce Drizzle as a **hybrid read layer (Option C)** *only when* a real
feature needs complex, typed server-side queries that PostgREST makes painful —
Supabase keeps owning DDL + RLS either way.

**Trigger to revisit:** the first server route where a PostgREST query is
materially harder to write/maintain than the equivalent Drizzle query.

## Consequences

- No new dependency now; the RLS-first model stays clean.
- If adopted later, it's additive (server queries only), not a rewrite.
