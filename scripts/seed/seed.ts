import { faker } from '@faker-js/faker'
import { createClient } from '@supabase/supabase-js'

import type { Database } from '../../shared/types/database.types'

import {
  ACME_SECRET_NOTE_TITLE,
  ADMIN,
  ADMIN2,
  MEMBER,
  MEMBER2,
  PASSWORD,
  TENANT2_NAME,
  TENANT_NAME,
} from './fixtures'

// Idempotent local seed. Creates one demo tenant with an admin, a member, and a
// handful of faker-generated extra members, each with a few notes. Every member
// note fires the notify_admins_on_note trigger, so the admin ends up with a
// populated notification feed. Re-run safely: it wipes the @example.com demo
// domain and all tenants first.
//
// Reads SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY from the environment (the
// `seed` package script loads .env). SEED_FAST=1 skips the faker-generated bulk.

const url = process.env.SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example)')
}

const fast = process.env.SEED_FAST === '1'
const admin = createClient<Database>(url, serviceKey, { auth: { persistSession: false } })

/** Create an auth user (handle_new_user makes a tenant + admin profile). */
async function createUser(email: string, fullName: string, companyName: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: fullName, company_name: companyName },
  })
  if (error) throw error
  return data.user.id
}

async function wipe() {
  // Delete every demo auth user (cascades their profile). Paginate defensively.
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
  for (const u of data.users) {
    if (u.email?.endsWith('@example.com')) await admin.auth.admin.deleteUser(u.id)
  }
  // Drop any leftover tenants (cascades profiles/notes/notifications).
  await admin.from('tenants').delete().gt('created_at', '1900-01-01')
}

async function addNotes(userId: string, tenantId: string, count: number) {
  const notes = Array.from({ length: count }, () => ({
    user_id: userId,
    tenant_id: tenantId,
    title: faker.lorem.sentence(4),
    body: faker.lorem.paragraph(),
  }))
  const { error } = await admin.from('notes').insert(notes)
  if (error) throw error
}

/** Move a user's auto-created tenant into `tenantId` as a member, dropping the
 *  now-empty tenant the signup trigger spawned. */
async function joinTenant(userId: string, tenantId: string) {
  const { data: p } = await admin.from('profiles').select('tenant_id').eq('id', userId).single()
  const ownTenant = p?.tenant_id
  await admin.from('profiles').update({ tenant_id: tenantId, role: 'member' }).eq('id', userId)
  if (ownTenant && ownTenant !== tenantId) {
    await admin.from('tenants').delete().eq('id', ownTenant)
  }
}

/** Seed one tenant: admin (creator) + one named member. Extra faker members
 *  and a distinctive `secretTitle` note are optional. Returns the tenant id. */
async function seedTenant(opts: {
  tenantName: string
  admin: { email: string; fullName: string }
  member: { email: string; fullName: string }
  extraMembers: number
  secretTitle?: string
}) {
  const adminId = await createUser(opts.admin.email, opts.admin.fullName, opts.tenantName)
  const { data: adminProfile, error } = await admin
    .from('profiles')
    .select('tenant_id')
    .eq('id', adminId)
    .single()
  if (error || !adminProfile) throw error ?? new Error('admin profile missing')
  const tenantId = adminProfile.tenant_id

  const memberId = await createUser(opts.member.email, opts.member.fullName, 'temp')
  await joinTenant(memberId, tenantId)
  await addNotes(memberId, tenantId, 3)

  if (opts.secretTitle) {
    const { error: e } = await admin
      .from('notes')
      .insert({ user_id: memberId, tenant_id: tenantId, title: opts.secretTitle, body: 'seed' })
    if (e) throw e
  }

  for (let i = 0; i < opts.extraMembers; i++) {
    const name = faker.person.fullName()
    const email = faker.internet.email({ provider: 'example.com' }).toLowerCase()
    const id = await createUser(email, name, 'temp')
    await joinTenant(id, tenantId)
    await addNotes(id, tenantId, faker.number.int({ min: 1, max: 4 }))
  }

  return tenantId
}

async function main() {
  console.info('Wiping demo data…')
  await wipe()

  // Tenant 1: Acme — the primary demo tenant, with a distinctive secret note.
  await seedTenant({
    tenantName: TENANT_NAME,
    admin: ADMIN,
    member: MEMBER,
    extraMembers: fast ? 0 : 4,
    secretTitle: ACME_SECRET_NOTE_TITLE,
  })

  // Tenant 2: Globex — always seeded (even fast) so RLS isolation is testable.
  await seedTenant({ tenantName: TENANT2_NAME, admin: ADMIN2, member: MEMBER2, extraMembers: 0 })

  console.info(`Seeded tenants "${TENANT_NAME}" and "${TENANT2_NAME}".`)
  console.info(`  Acme   admin:  ${ADMIN.email} / ${PASSWORD}`)
  console.info(`  Acme   member: ${MEMBER.email} / ${PASSWORD}`)
  console.info(`  Globex admin:  ${ADMIN2.email} / ${PASSWORD}`)
  console.info(`  Globex member: ${MEMBER2.email} / ${PASSWORD}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
