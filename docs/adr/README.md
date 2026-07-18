# Architecture Decision Records

Non-obvious, reversible-but-significant decisions. Add a new numbered file when
you change the auth flow, add a data dependency, change the security model, or
pick a third-party provider.

| # | Decision | Status |
|---|---|---|
| [0001](./0001-payments-provider.md) | Payments provider (Polar MoR; Stripe out for Serbia) | Proposed |
| [0002](./0002-data-layer.md) | Data layer — Drizzle vs. Supabase-native | Proposed (defer Drizzle) |
| [0003](./0003-upstash-redis.md) | Upstash Redis for distributed rate limiting + cache | Proposed (adopt) |
| [0004](./0004-distribution-github-template.md) | Distribution as a GitHub template repo | Accepted |
| [0005](./0005-nuxt-layers.md) | Nuxt Layers for feature organization | Accepted |

See also: [`../g-stack.md`](../g-stack.md) (stack definition) · [`../roadmap.md`](../roadmap.md) (build order).
