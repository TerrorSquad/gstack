import { defineStore } from 'pinia'

import type { Notification } from '~/types'

import { mapNotification } from '~/utils/mappers'

// In-app notification feed. Rows are created by the notify_admins_on_note DB
// trigger; this store only reads them and marks them read. Guarded by the
// notificationsEnabled flag so the whole subsystem is one switch.
export const useNotificationsStore = defineStore('notifications', () => {
  const supabase = useSupabaseClient()
  const enabled = useRuntimeConfig().public.notificationsEnabled

  const notifications = ref<Notification[]>([])
  const loaded = ref(false)

  async function load() {
    if (!enabled) {
      loaded.value = true
      return
    }
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    if (error) throw error
    notifications.value = (data ?? []).map(mapNotification)
    loaded.value = true
  }

  async function ensureLoaded() {
    if (!loaded.value) await load()
  }

  const unreadCount = computed(() => notifications.value.filter((n) => !n.readAt).length)

  async function markAllRead() {
    const unreadIds = notifications.value.filter((n) => !n.readAt).map((n) => n.id)
    if (unreadIds.length === 0) return
    const readAt = new Date().toISOString()
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: readAt })
      .in('id', unreadIds)
    if (error) throw error
    for (const n of notifications.value) {
      if (unreadIds.includes(n.id)) n.readAt = readAt
    }
  }

  return { notifications, loaded, load, ensureLoaded, unreadCount, markAllRead }
})
