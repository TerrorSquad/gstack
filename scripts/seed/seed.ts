import { faker } from '@faker-js/faker'
import { createClient } from '@supabase/supabase-js'

import type { Database } from '../../app/types/database.types'

import { ADMIN, MEMBER, PASSWORD, TENANT_NAME } from './fixtures'

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

async function main() {
  console.info('Wiping demo data…')
  await wipe()

  // Admin creates the tenant.
  const adminId = await createUser(ADMIN.email, ADMIN.fullName, TENANT_NAME)
  const { data: adminProfile, error } = await admin
    .from('profiles')
    .select('tenant_id')
    .eq('id', adminId)
    .single()
  if (error || !adminProfile) throw error ?? new Error('admin profile missing')
  const tenantId = adminProfile.tenant_id

  // A member joins the tenant. Each createUser spawns its own tenant via the
  // trigger, so move the profile into the admin's tenant and demote to member,
  // then delete the now-empty tenant it created.
  async function joinTenant(userId: string) {
    const { data: p } = await admin.from('profiles').select('tenant_id').eq('id', userId).single()
    const ownTenant = p?.tenant_id
    await admin.from('profiles').update({ tenant_id: tenantId, role: 'member' }).eq('id', userId)
    if (ownTenant && ownTenant !== tenantId) {
      await admin.from('tenants').delete().eq('id', ownTenant)
    }
  }

  const memberId = await createUser(MEMBER.email, MEMBER.fullName, 'temp')
  await joinTenant(memberId)
  await addNotes(memberId, tenantId, 3)

  if (!fast) {
    for (let i = 0; i < 4; i++) {
      const name = faker.person.fullName()
      const email = faker.internet.email({ provider: 'example.com' }).toLowerCase()
      const id = await createUser(email, name, 'temp')
      await joinTenant(id)
      await addNotes(id, tenantId, faker.number.int({ min: 1, max: 4 }))
    }
  }

  console.info(`Seeded tenant "${TENANT_NAME}".`)
  console.info(`  Admin:  ${ADMIN.email} / ${PASSWORD}`)
  console.info(`  Member: ${MEMBER.email} / ${PASSWORD}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
