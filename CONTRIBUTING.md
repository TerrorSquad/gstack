# Contributing

Thanks for contributing. This is the G Stack — see [`docs/g-stack.md`](docs/g-stack.md)
for the philosophy and [`docs/roadmap.md`](docs/roadmap.md) for what's planned.

## Prerequisites

- Node + pnpm (versions pinned in `mise.toml` — `mise install` if you use mise).
- Docker (for local Supabase).

## Getting started

```bash
pnpm install
cp .env.example .env      # fill in after `pnpm supabase start`
pnpm supabase start
pnpm db:reset             # migrate + seed
pnpm dev
```

## Before you push

The `forge` pre-commit hook auto-formats (oxfmt), lints (oxlint), flattens
locale JSON, and checks i18n parity — don't run those by hand. The pre-push hook
runs `pnpm test` and `pnpm typecheck`. To run things yourself:

```bash
pnpm test            # vitest unit tests (pure logic only)
pnpm test:e2e        # Playwright e2e + a11y (needs seeded local Supabase)
pnpm lint / pnpm fmt
pnpm lint:i18n       # locale key parity
pnpm typecheck
```

## Project structure

Organized with **Nuxt Layers** (see [ADR-0005](docs/adr/0005-nuxt-layers.md)): the
root is the shared base; features live in `layers/<name>/`. To add a feature,
create `layers/<name>/` with a `nuxt.config.ts` and its `app/`/`server/` subtree,
then add it to `extends` in the root `nuxt.config.ts`. From a layer, use
auto-imports (not `~/…`) for shared code, and `#shared/types` for types.

## Conventions

- **Commits: [Conventional Commits](https://www.conventionalcommits.org/)**
  (`feat:`, `fix:`, `docs:`, `chore:`, …). release-please parses these to cut
  releases and generate `CHANGELOG.md` — never hand-edit that file.
- **i18n:** add every new key to **both** `i18n/locales/{en,sr}.json`; build
  dynamic keys with template literals so the checker resolves them.
- **Types:** after a migration, run `pnpm db:types` or typecheck fails.
- **Decisions:** record significant/architectural choices as an ADR in
  [`docs/adr/`](docs/adr/).
- **User-facing changes:** add a dated entry to `app/utils/changelog.ts`
  (rendered at `/changelog`) — see the `changelog` skill. This is separate from
  the release-please `CHANGELOG.md`.

## Tests

- `**/*.test.ts` (vitest) — pure logic only, no DOM/Supabase.
- `e2e/*.spec.ts` (Playwright) — full flows against seeded local Supabase. A new
  spec runs only once added to a project's `testMatch` in `playwright.config.ts`.
