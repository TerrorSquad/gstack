// Feedback submission, RLS-scoped by the DB (feedback_insert_own). Append-only:
// there's a submit and an admin-facing list, no update/delete. Mirrors useNotes.
import type { Feedback } from '#shared/types'

export function useFeedback() {
  const supabase = useSupabaseClient()

  async function submit(message: string, page: string) {
    const trimmed = message.trim()
    if (!trimmed) throw new Error('Feedback message is empty')

    const auth = useAuthStore()
    const profile = await auth.ensureProfile()
    if (!profile) throw new Error('No profile')

    const { error } = await supabase
      .from('feedback')
      .insert({ message: trimmed, page, user_id: profile.id, tenant_id: profile.tenantId })
    if (error) throw error
  }

  /** Admin/self view of submissions (RLS decides which rows come back). */
  async function list(): Promise<Feedback[]> {
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map((r) => ({
      id: r.id,
      tenantId: r.tenant_id,
      userId: r.user_id,
      message: r.message,
      page: r.page,
      createdAt: r.created_at,
    }))
  }

  return { submit, list }
}
