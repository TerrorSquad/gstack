/**
 * The pages that live in `app/pages/` rather than in `content/`.
 *
 * They exist as Vue pages because docus scopes its content collection to
 * `docs/**` (with a `/docs` prefix) as soon as `content/docs/` exists, so
 * top-level markdown doesn't route at all. The cost of that is everything
 * @nuxt/content gives you for free: sitemap entries, search, SEO.
 *
 * This file is the single source that buys it back. It is read by:
 *
 *  - the pages themselves, for their headings (via SectionHead)
 *  - `AppSearch.vue`, so the pages and their sections are searchable
 *  - `nuxt.config.ts`, so they appear in sitemap.xml
 *  - `useDesignedPageSeo()`, for title, description, canonical and OG image
 *
 * Keep the section titles here identical to what renders — they ARE what
 * renders. A heading changed here changes the page, the search index and the
 * sitemap together, which is the whole point.
 *
 * Plain data only: `nuxt.config.ts` imports this at config time, so it must not
 * reach for anything Nuxt-specific.
 */

export interface PageSection {
  /** Two-digit ordinal shown in the mono eyebrow. */
  index: string
  eyebrow: string
  title: string
  description?: string
}

export interface DesignedPage {
  path: string
  /** Browser/SEO title. The visible <h1> is `heading`. */
  title: string
  description: string
  heading: string
  intro: string
  eyebrow: string
  sections: PageSection[]
}

export const designedPages: DesignedPage[] = [
  {
    path: '/screens',
    title: 'What you get — GStack',
    description:
      'The screens the starter ships with: dashboard, notes CRUD, tenant admin, billing, account, pricing and feedback — in both themes and on mobile.',
    eyebrow: 'What you get',
    heading: 'The screens, before you write any.',
    intro:
      'Every one of these is in the template on the first run, rendered against a seeded demo tenant. They are captured by a script, not curated by hand, so they cannot flatter the product.',
    sections: [
      {
        index: '01',
        eyebrow: 'The app',
        title: 'Signed-in surface',
        description:
          'Dashboard, the reference CRUD feature, tenant administration, billing and account — the parts you would otherwise build before writing anything of your own.',
      },
      {
        index: '02',
        eyebrow: 'Public and mobile',
        title: 'The rest of it',
        description:
          'Marketing and pricing pages, the feedback widget, and the same screens on a phone. Both themes are tested for contrast, not just drawn.',
      },
    ],
  },
  {
    path: '/compare',
    title: 'How it compares — GStack',
    description:
      'GStack against create-t3-app and against commercial Nuxt SaaS kits — including the places it loses, which are the useful part.',
    eyebrow: 'How it compares',
    heading: 'Where it wins, and where it loses.',
    intro:
      'A comparison that only lists wins is an advert. These are the real trade-offs, including the ones that should send you elsewhere.',
    sections: [
      {
        index: '01',
        eyebrow: 'vs create-t3-app',
        title: 'Same instincts, different boundary',
        description:
          'Both are type-safe to the edges and allergic to magic. They disagree about where authorization lives, and about which framework you write.',
      },
      {
        index: '02',
        eyebrow: 'vs commercial Nuxt kits',
        title: 'What you pay for, and what you do not',
        description:
          'Paid kits buy breadth and someone else on the hook. This buys depth in the parts that are painful to retrofit.',
      },
      {
        index: '03',
        eyebrow: 'The honest part',
        title: 'Reasons to pick something else',
        description:
          'Written down because a starter you adopt for the wrong reason costs far more than the evening you saved choosing it.',
      },
    ],
  },
  {
    path: '/stack',
    title: 'The stack — GStack',
    description:
      'Every subsystem GStack ships, what turning it on gives you, and which ones need a third-party account. A bare clone runs end-to-end with none of them.',
    eyebrow: 'The stack',
    heading: 'Batteries included. All of them off.',
    intro:
      'Every subsystem here is fully wired and switched off until you say otherwise. Nothing half-works, nothing is a stub, and a clone you have just downloaded runs end-to-end without a single third-party account.',
    sections: [
      {
        index: '01',
        eyebrow: 'The bare clone',
        title: 'What you get before signing up for anything',
        description:
          'This is the whole point of flag-gating. The starter has to be fully usable on a laptop with no accounts, or the batteries are decoration.',
      },
      {
        index: '02',
        eyebrow: 'The inventory',
        title: 'Every subsystem, and what it costs',
        description:
          'Grouped the way the manifest groups them. If a row says no account, it means the feature is genuinely self-hosted — not a trial tier.',
      },
      {
        index: '03',
        eyebrow: 'One manifest, two scripts',
        title: 'Something writes it, something else checks it',
        description:
          "pnpm setup picks the subsystems and writes .env. pnpm doctor verifies what's there. Both read the same manifest, so adding a subsystem to it wires up both — and neither can drift from the other.",
      },
      {
        index: '04',
        eyebrow: 'Where it runs',
        title: 'Vercel is the default, not the requirement',
        description:
          'The build output is Nitro, which targets Node, Deno, Bun, Cloudflare, Netlify and a plain server. Nothing in the app reaches for a platform-specific API.',
      },
    ],
  },
  {
    path: '/architecture',
    title: 'Architecture — GStack',
    description:
      'Ten Nuxt layers over one shell, types generated from the Postgres schema, and a request lifecycle where authorization is a database property.',
    eyebrow: 'Architecture',
    heading: 'Ten layers, one shell.',
    intro:
      'Every feature is a self-contained Nuxt layer over a shared foundation. Adding one is a directory and a line; removing one is deleting the directory. Nothing in between reaches across.',
    sections: [
      {
        index: '01',
        eyebrow: 'The shape',
        title: 'Features are layers, not folders',
        description:
          'The root project is the shell — app.vue, layouts, auth pages, stores, base components and the core server routes. Everything else is a layer it extends.',
      },
      {
        index: '02',
        eyebrow: 'Adding a feature',
        title: 'One command, one line',
        description:
          'pnpm gen:layer scaffolds the directory and its nuxt.config.ts. You add it to extends. That is the whole ceremony.',
      },
      {
        index: '03',
        eyebrow: 'Request lifecycle',
        title: 'Authorization happens in Postgres',
        description:
          'By the time a component sees data, the database has already filtered it. The middleware exists to send people to the right page, not to protect rows.',
      },
      {
        index: '04',
        eyebrow: 'Type pipeline',
        title: 'The schema is the source of types',
        description:
          'No ORM, no hand-written row interfaces. pnpm db:types regenerates from the live local database, and a query that under-selects fails at typecheck instead of in production.',
      },
      {
        index: '05',
        eyebrow: 'Deliberately deferred',
        title: 'What this stack refuses to add yet',
        description:
          'A starter is judged as much by what it leaves out. These are written down with their trade-offs, not silently omitted.',
      },
    ],
  },
  {
    path: '/security',
    title: 'Security — GStack',
    description:
      'Multi-tenant isolation enforced by Postgres Row Level Security, proven by an end-to-end test, with CSP, CSRF and rate limiting layered above it.',
    eyebrow: 'Security',
    heading: 'Isolation is a database property.',
    intro:
      "Not a middleware, not a where clause someone remembered to write. Postgres Row Level Security scopes every row to the caller's tenant, so a bug in a component cannot leak data the component was never given.",
    sections: [
      {
        index: '01',
        eyebrow: 'The model',
        title: 'One database, one tenant_id, one helper',
        description:
          'Single-database, shared-schema multi-tenancy. Every table carries a tenant_id, and one security-definer function answers who is asking.',
      },
      {
        index: '02',
        eyebrow: 'A real policy',
        title: 'Read the rule, not the marketing',
        description:
          'This is the actual notes policy, unedited. Tenant scoping and ownership are one expression the database evaluates on every single read.',
      },
      {
        index: '03',
        eyebrow: 'The proof',
        title: 'A claim that fails loudly',
        description:
          "Every starter says multi-tenant. This one logs in as a second tenant and asserts the first tenant's rows are absent — from the list, from search, and from the SSR payload.",
      },
      {
        index: '04',
        eyebrow: 'Above the database',
        title: 'The ordinary web attack surface, closed',
        description: 'RLS is the boundary that matters. It is not an excuse to ship without the rest.',
      },
      {
        index: '05',
        eyebrow: 'Known ceiling',
        title: 'Where this design stops scaling',
        description: 'Written in the migration itself, not discovered by you at 3am.',
      },
    ],
  },
]

/** Route paths only — used by the sitemap hook in nuxt.config.ts. */
export const designedPagePaths = designedPages.map(page => page.path)

export function getDesignedPage(path: string): DesignedPage {
  const page = designedPages.find(p => p.path === path)
  if (!page) throw new Error(`designedPages: no entry for "${path}"`)
  return page
}
