# Setup

You just created a repo from the G Stack template. Here's how to make it yours.

## 1. Rebrand

```bash
node scripts/rename.mjs "My App" --package my-app --site https://myapp.com
```

This replaces the `Starter` display name across the app + email templates, sets
the `package.json` name, updates the release/Vercel identifier, and (with
`--site`) the auth-panel link. Then finish by hand:

- **Brand color** — `app/assets/css/main.css`, the `--color-brand-*` scale.
- **Favicon** — `public/favicon.svg`.
- **License** — the copyright holder in `LICENSE`.
- **README** — replace the top-level description with your product's.

Delete `scripts/rename.mjs` once you've run it (or keep it, it's harmless).

## 2. Environment + local backend

```bash
pnpm install
cp .env.example .env
pnpm supabase start          # prints SUPABASE_URL + keys — copy them into .env
pnpm db:reset                # apply migrations + seed a demo tenant
pnpm db:types                # regenerate the typed client from the live schema
pnpm dev                     # http://localhost:3000
```

Demo logins after `db:reset`: `admin@example.com` / `member@example.com`,
password `Demo123!Demo123`.

## 3. Turn on the extras you want

Everything below is off until configured (see `.env.example` and the README):

- **Social login** — enable providers in `supabase/config.toml`, add credentials.
- **Notifications email** — `NUXT_PUBLIC_NOTIFICATIONS_ENABLED` + Resend + webhook.
- **Sentry / BetterStack / Vercel Analytics** — set the respective env vars.

## 4. Make it a template (maintainers only)

In GitHub repo **Settings → General → Template repository**, tick the box so
others can "Use this template".

---

Next steps and open decisions live in [`docs/roadmap.md`](docs/roadmap.md) and
[`docs/adr/`](docs/adr/).
