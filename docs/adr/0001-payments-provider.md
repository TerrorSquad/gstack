# ADR-0001: Payments provider

**Status:** Proposed (recommend Polar) · **Date:** 2026-07-19

## Context

We need subscription billing for the SaaS. The default industry choice, **Stripe
direct, is not available to Serbian-registered sellers** — Stripe does not
support payouts to Serbia, so a Serbian company cannot onboard as a Stripe
merchant. The stack is built and maintained from Serbia, so the billing provider
must pay out to Serbian sellers.

A **Merchant of Record (MoR)** provider solves two problems at once: it becomes
the seller of record (handling global sales tax / EU VAT), and it can pay out to
countries Stripe-direct can't.

## Options (verified July 2026)

| Provider | Serbia payout | Model | Notes |
|---|---|---|---|
| **Polar** | ✅ Yes (via Stripe Connect Express) | MoR | Developer-first, open-source, low fees; used by comparable Nuxt kits |
| **Paddle** | ✅ Yes (Payoneer / wire) | MoR | Established, strong tax handling; stricter manual seller vetting |
| **Lemon Squeezy** | ~ (PayPal/Wise; being folded into "Stripe Managed Payments") | MoR | Future uncertain post-Stripe acquisition |
| Stripe direct | ❌ No | PSP | Not available to Serbian sellers; also not a MoR |

Sources: [Polar supported countries](https://polar.sh/docs/merchant-of-record/supported-countries)
(Serbia explicitly listed), [Paddle payouts](https://www.paddle.com/help/manage/get-paid/when-and-how-do-i-get-paid)
(wire/Payoneer, non-sanctioned countries), [Lemon Squeezy 2026 update](https://www.lemonsqueezy.com/blog/2026-update).

## Decision

Build billing behind a **provider-agnostic `BillingProvider` adapter** (checkout,
customer portal, webhook parsing, subscription sync) and implement **Polar first**:

- Serbia-supported payouts (confirmed).
- MoR removes all sales-tax/VAT liability.
- Developer-first API and webhooks that fit our existing idempotent-webhook
  pattern (`/api/hooks/*` + service-role sync, as used by notifications).

**Paddle is the documented fallback** if Polar onboarding is rejected — the
adapter boundary makes swapping a contained change.

## Consequences

- Billing is **not blocked** by the Stripe/Serbia limitation.
- No direct card handling or PCI scope (MoR owns it).
- MoR fees are higher than raw Stripe (~4–6% + fees) — acceptable for the tax
  compliance it removes; revisit at scale.
- The adapter interface is extra indirection, justified by the real chance of
  switching providers.

## Open questions

- Confirm Polar seller onboarding for the specific Serbian legal entity.
- Plan model: subscriptions only, or also lifetime/one-time?
