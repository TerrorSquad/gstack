// Shared between the seed script and e2e tests so credentials never drift.
// Every demo user's email ends in @example.com; the seed wipes that domain
// before reseeding, so nothing else in a dev DB is touched.
export const PASSWORD = 'Demo123!Demo123'
export const TENANT_NAME = 'Acme Inc'

export const ADMIN = { email: 'admin@example.com', fullName: 'Ada Admin' }
export const MEMBER = { email: 'member@example.com', fullName: 'Milo Member' }

// A second, fully separate tenant. Exists so e2e can prove RLS isolation: a
// user here must never see Acme's rows. Kept minimal and always seeded (not
// gated behind SEED_FAST) since isolation is a core guarantee to test.
export const TENANT2_NAME = 'Globex LLC'
export const ADMIN2 = { email: 'admin2@example.com', fullName: 'Gina Globex' }
export const MEMBER2 = { email: 'member2@example.com', fullName: 'Manu Member' }

// A distinctive note title seeded into Acme; the isolation test asserts the
// Globex user never sees this string anywhere in the app.
export const ACME_SECRET_NOTE_TITLE = 'Acme confidential roadmap Q3'
