// Shared between the seed script and e2e tests so credentials never drift.
// Every demo user's email ends in @example.com; the seed wipes that domain
// before reseeding, so nothing else in a dev DB is touched.
export const PASSWORD = 'Demo123!Demo123'
export const TENANT_NAME = 'Acme Inc'

export const ADMIN = { email: 'admin@example.com', fullName: 'Ada Admin' }
export const MEMBER = { email: 'member@example.com', fullName: 'Milo Member' }
