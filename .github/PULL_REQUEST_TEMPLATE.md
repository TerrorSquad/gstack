## What & why

<!-- What does this change and why? Link any issue. -->

## Checklist

- [ ] Title follows [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`…)
- [ ] `pnpm test` and `pnpm typecheck` pass
- [ ] i18n keys added to **both** locales (if UI strings changed)
- [ ] `pnpm db:types` re-run (if a migration changed the schema)
- [ ] `/changelog` entry added (if user-facing) — `app/utils/changelog.ts`
- [ ] ADR added/updated (if this is an architectural decision)
