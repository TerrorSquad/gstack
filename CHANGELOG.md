# Changelog

## [1.0.0](https://github.com/TerrorSquad/gstack/compare/gstack-v0.1.0...gstack-v1.0.0) (2026-08-04)


### ⚠ BREAKING CHANGES

* package renamed nuxt-supabase-starter -> gstack, which also changes the release-please branch name referenced by vercel.json.

### Features

* account self-service + admin member management (Phase 3) ([639dcfd](https://github.com/TerrorSquad/gstack/commit/639dcfd7830ee087f1db784d39e378410573188e))
* add generic utils extracted from sibling projects ([6c21f9e](https://github.com/TerrorSquad/gstack/commit/6c21f9eae8a8694ba962447f913f517c30f3143e))
* add multi-tenancy, notifications, observability, seeding and release tooling ([aa0a03e](https://github.com/TerrorSquad/gstack/commit/aa0a03e70ef8a988c499f3f7d88cae710a4d1f5b))
* add social login (GitHub, Google) with simple-icons ([9f71f75](https://github.com/TerrorSquad/gstack/commit/9f71f75d5b1f925cfaf1249185b18dcdc2fc8d93))
* **analytics:** PostHog product analytics + feature flags layer ([3332da0](https://github.com/TerrorSquad/gstack/commit/3332da0df41d07305742aa2ea236d93455c7f4fd))
* billing via Polar behind a provider adapter (Phase 4, layers/billing) ([94ff7b4](https://github.com/TerrorSquad/gstack/commit/94ff7b4d2f58d35cd531ae750a02a8c3557a8dc1))
* **dashboard:** recent notes list ([81d5c0a](https://github.com/TerrorSquad/gstack/commit/81d5c0a716a8c92ad98e597977c0bf9d261354c0))
* **email:** Vue Email layer with component templates + dev preview ([fd555ce](https://github.com/TerrorSquad/gstack/commit/fd555ce449e5d723eb43e47b29e9b63b66262338))
* **feedback:** admin page + e2e coverage ([353b3e8](https://github.com/TerrorSquad/gstack/commit/353b3e8a78cb7017ce2cc5d2008dd0073460a899))
* **feedback:** self-hosted feedback widget → DB ([7b49f3c](https://github.com/TerrorSquad/gstack/commit/7b49f3cf0b9f21b95cdc67aad06a8a2690e1d62b))
* GStack rename, generated auth emails, redesigned auth, docs site ([#12](https://github.com/TerrorSquad/gstack/issues/12)) ([f58bb07](https://github.com/TerrorSquad/gstack/commit/f58bb0747f50ad8d2b6fedfba7db228e1993be3c))
* **infra:** Phase 5 — Upstash rate limiting + nuxt-security CSP ([8456457](https://github.com/TerrorSquad/gstack/commit/8456457c41d5ee53126ebe2c2858d6a9c80993dc))
* marketing surface — landing, pricing, legal, SEO (Phase 2) ([7c5af04](https://github.com/TerrorSquad/gstack/commit/7c5af043277fdd910119230ce9c641c6a498bba3))
* **notes:** client-side search filter ([d8b23e8](https://github.com/TerrorSquad/gstack/commit/d8b23e83c8e3c700f41b5cb9a1d59d165b28ed90))
* **notes:** confirm before leaving unsaved note edits ([f9f6f33](https://github.com/TerrorSquad/gstack/commit/f9f6f33f1c72c50215bb0ef537dca814625d1e3f))
* **notifications:** notification rows link to their note ([ccff3eb](https://github.com/TerrorSquad/gstack/commit/ccff3eb19e3270d9092173a4226f6f690ce0c894))
* redesign changelog as a timeline + richer auth shell ([733e775](https://github.com/TerrorSquad/gstack/commit/733e77562397e2827d225081741d59aed7f88037))
* roadmap page, OG images, doctor + scaffold CLIs, shared UI layer ([984279b](https://github.com/TerrorSquad/gstack/commit/984279ba3e1edae7f1e7c9cccad87cb3f54ca165))
* **security:** token CSRF (nuxt-csurf) on mutating routes ([b7688d8](https://github.com/TerrorSquad/gstack/commit/b7688d876ede3584ccf8b48403baabfeaaf9b028))
* **setup:** integration manifest ([4c6744e](https://github.com/TerrorSquad/gstack/commit/4c6744e1dddcc05affc4492e2a1d5a9d0e94291d))
* **setup:** pnpm setup wizard CLI ([7d8144a](https://github.com/TerrorSquad/gstack/commit/7d8144ae45d55e161e1894616a5724208e76b5e9))
* **setup:** pure rewriteEnv function ([c91faf3](https://github.com/TerrorSquad/gstack/commit/c91faf38f8ff145801fe90ade9b1c45e70328ff8))
* **tour:** onboarding product tour (driver.js) ([ab8df44](https://github.com/TerrorSquad/gstack/commit/ab8df44568502ae5cb29c76ba308ea1e80a1f18d))
* **ux:** content-shaped skeleton loading states ([05f37c3](https://github.com/TerrorSquad/gstack/commit/05f37c3bc064495bf71904c0b28b30d7dbc2eb8e))


### Bug Fixes

* **ci:** Pages must be enabled out of band, not by the workflow ([b9c4773](https://github.com/TerrorSquad/gstack/commit/b9c47730252e7ab8a49f2785e993ad49bfef02fe))
* **og:** eject NuxtSeo OG template so it typechecks and renders in prod ([80f330e](https://github.com/TerrorSquad/gstack/commit/80f330ef82dbc60d63db29147b1a3a6cbd447464))
* **scripts:** doctor lint + env loading ([aa05356](https://github.com/TerrorSquad/gstack/commit/aa0535628588265fdc15a781dd938f70719bf25a))
* **site:** build the docs site without the root project prepared ([33885bc](https://github.com/TerrorSquad/gstack/commit/33885bcff506f73f2a29f646b7838d864916a7d7))
