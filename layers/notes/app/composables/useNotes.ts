import type { Note } from '#shared/types'


// Notes CRUD, RLS-scoped to the current user by the DB (see the notes_owner_all
// policy). This is the pattern to copy for your own resources: a composable with
// useAsyncData for the list + plain async mutators that refresh() it.
export function useNotes() {
  const supabase = useSupabaseClient()

  const {
    data: notes,
    pending,
    refresh,
  } = useAsyncData<Note[]>('notes', async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('updated_at', { ascending: false })
    if (error) throw error
    return (data ?? []).map(mapNote)
  })

  async function getNote(id: string): Promise<Note | null> {
    const { data, error } = await supabase.from('notes').select('*').eq('id', id).single()
    if (error || !data) return null
    return mapNote(data)
  }

  async function createNote(title: string, body: string) {
    const auth = useAuthStore()
    const profile = await auth.ensureProfile()
    if (!profile) throw new Error('No profile')
    const { error } = await supabase
      .from('notes')
      .insert({ title, body, user_id: profile.id, tenant_id: profile.tenantId })
    if (error) throw error
    await refresh()
  }

  async function updateNote(id: string, title: string, body: string) {
    const { error } = await supabase
      .from('notes')
      .update({ title, body, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    await refresh()
  }

  async function deleteNote(id: string) {
    const { error } = await supabase.from('notes').delete().eq('id', id)
    if (error) throw error
    await refresh()
  }

  return { notes: notes as Ref<Note[]>, pending, refresh, getNote, createNote, updateNote, deleteNote }
}
