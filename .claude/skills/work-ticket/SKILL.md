---
name: work-ticket
description: "Use when picking up work autonomously in this repo - taking a ticket from an issue tracker through local development, tests, PR, review and merge without a human in the loop. Also use when asked to 'work the backlog', 'pick up the next ticket', or to continue unattended. Covers the full loop and, more importantly, where to stop."
metadata:
  author: project
  version: "1.0.0"
---

# Working a ticket unattended

The owner is not watching. That changes two things: **the ticket thread is the
only place your reasoning survives**, and **you cannot ask a question** — so you
must be able to tell the difference between a decision you should make and one
you must hand back.

Everything in CLAUDE.md still applies. This is the loop around it.

## 1. Pick the ticket

Highest priority in Backlog or Todo. Skip anything blocked on a human until you
have checked whether the blocker cleared — the comment thread is the record.

Read the **whole** ticket including comments before touching code. Comments often
contradict the description; later knowledge wins.

Move it to **In Progress** before the first edit, not after.

**If the backlog is empty, stop and say so.** Do not invent work.

## 2. Question the ticket before implementing it

A ticket is a proposal written with less information than you now have. The most
valuable thing you do unattended is catch where it is wrong.

If the ticket is wrong, **implement the correct thing and say so in a comment**,
quoting what it asked for and why you diverged. Do not silently comply, and do
not stall waiting for permission on something you can reason about.

Genuinely ambiguous scope, a product judgement, or an architectural change is
different — see § Stop.

## 3. Build

Branch `feat/<slug>` or `fix/<slug>`. Never commit to `main`.

Tests are not optional and not an afterthought:

- **Unit** (`vitest`) for pure logic only — no DOM, no Supabase. The coverage
  gate is **100%** over `app/utils`, `server/utils` and
  `layers/**/server/utils`. If a new file there is platform-bound, exclude it in
  `vitest.config.ts` with a reason; don't fake-mock it to hit the number.
- **e2e** (Playwright) for anything with a runtime surface. A new spec only runs
  once it is added to a project's `testMatch` in `playwright.config.ts` — adding
  the file alone is a test that never runs, which is worse than none.
- Write a test that **fails for the bug you are fixing**.

Repo-specific traps that cost real time:

- **`~` and `@` resolve to the root app, never the current layer.** From a layer,
  rely on auto-imports; use `#shared` for types.
- **Add every i18n key to both `en.json` and `sr.json`**, then `pnpm lint:i18n`.
  Build dynamic keys with template literals so the usage checker resolves them.
- **Generated files are not source.** `supabase/templates/*.html` come from
  `pnpm gen:auth-templates`; `shared/types/database.types.ts` from `pnpm db:types`.
  Editing either by hand fails a test or a typecheck.
- **Never edit a migration already applied to a real database** — add a new one.
  After a schema change, `pnpm db:types` or typecheck fails.

## 4. Verify locally before the PR

On push, CI runs lint, i18n, the coverage gate, typecheck and build. The
Playwright + a11y suite runs on a **schedule** (twice daily), not on your PR — so
a broken flow passes the checks you can see and surfaces up to twelve hours later,
detached from the change that caused it. Run it yourself and say in the PR that
you did:

```bash
pnpm lint && pnpm lint:i18n
pnpm typecheck
pnpm test:coverage
pnpm test:e2e          # needs Docker + a seeded local Supabase
```

**`pnpm db:reset` wipes and reseeds the auth users.** If e2e logins fail with
"Invalid login credentials", reseed before you go debugging a passing test.

Apply migrations locally and **exercise them** — don't just watch them apply. A
migration that applies cleanly can still be permission-denied at runtime, and RLS
policies are exactly the kind of thing that only fails under a real session.

If you touched anything visual, `pnpm screenshots` regenerates `docs/screenshots/`.

## 5. PR, review, address, merge

Open the PR, then **review it** (`/code-review high`) and address the findings.
Reviewers are usually right and occasionally wrong — when a suggestion fails,
test it and record why in the commit message so nobody re-suggests it.

Merge once review is addressed. Delete the branch.

## 6. Close the loop

Move to **Done** and comment. Write for someone reading in three months with no
memory of the session:

- what actually shipped, and the PR number
- **what the ticket got wrong**, if anything, and what you did instead
- decisions you took that nobody authorised, stated plainly
- anything you discovered that contradicts a doc — and fix the doc
- follow-up work as its own ticket, linked

State what changed and why. Not that you were thorough.

## Stop, and leave a comment instead

Unattended does not mean unlimited. Stop and hand back when:

- **A secret is needed.** You cannot generate a value, put it in a hosting
  provider, and redeploy on someone's behalf. Write the exact commands instead.
- **A deploy, account, or billing change is the next step.**
- **Deleting or overwriting something you did not create**, and what you find
  contradicts how it was described. Surface the contradiction, don't proceed.
- **The change is outward-facing and irreversible** — real email to a real
  address, publishing, anything a user would receive.
- **It would bake product identity into the template.** This repo is a starter;
  a feature only belongs here if every user of it would want it.
- **A documented non-goal is in the way.** `docs/gstack.md` says no to a lot on
  purpose. If the ticket needs one, say so instead of building it.

When you stop: comment **exactly what is needed and why**, with the commands or
decision spelled out so it is a two-minute job, not an investigation. Then move
to the next ticket — being blocked on one is not being blocked.

## Report at the end of a run

One message: what merged, what is waiting on the owner, and where that is written
down. Don't restate what the ticket comments already say — point at them.
