# ADR-0004: Distribution as a GitHub template repository

**Status:** Accepted · **Date:** 2026-07-19

## Context

GStack is distributed by others cloning it to start a project. Options were
a **GitHub template repository**, a **`create-gstack` CLI** (scaffolder), or a
**fork-based** workflow.

## Decision

Distribute as a **GitHub template repository** ("Use this template").

- Zero build/publish pipeline — the repo *is* the product.
- A generated repo starts with clean history (not a fork's), owned by the user.
- A CLI can come later and consume the same template; the template is the
  primitive, so this doesn't foreclose it.

## Consequences / requirements

Being a template (not just a repo) imposes rules:

- **No secrets, ever.** `.env` is gitignored; only `.env.example` ships. Sentry
  DSN and all provider keys are blank/placeholder.
- **Zero-config local path must work.** `pnpm i && supabase start && pnpm db:reset
  && pnpm dev` with no third-party accounts — every integration (Sentry, Resend,
  billing, Upstash, OAuth) is env-gated and no-ops when unset.
- **One-shot rebrand.** A `SETUP.md` + rename script covers app name (`GStack`),
  favicon, brand palette (`main.css`), and `siteUrl`, so a clone is personalized
  fast.
- **Sane starting version.** `package.json` at `0.1.0`, release-please manifest
  matching, and the user changelog reduced to a single "Initial release" entry —
  the generated repo's history starts clean.
- **MIT `LICENSE` + `CONTRIBUTING.md` + issue/PR templates** in `.github/`.
- **CI must pass from a cold clone** — no reliance on machine-specific state.

## Notes

- The GitHub "template repository" flag is a repo *setting*, not a file; enable it
  in repo settings once Phase 1 lands.
- Keep `README.md` skimmable and setup-first — it's the first thing a user sees.
