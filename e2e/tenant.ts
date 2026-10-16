import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config({ quiet: true })

/** A fresh tenant with its admin, for specs that change account-wide state (2FA, sessions). Returns the login email. */
export async function newTenantAdmin(password: string): Promise<string> {
  const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })
  const email = `e2e-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`
  const { error } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'E2E Admin', company_name: `E2E ${email}` },
  })
  if (error) throw error
  return email
}
