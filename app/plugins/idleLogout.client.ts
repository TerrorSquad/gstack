/**
 * Signs out a session idle for 30 minutes unless the user chose "stay signed in" (ui_prefs.staySignedIn) — the
 * threat is a walked-away tab on a shared computer. Any interaction restarts the timer; open tabs keep each other
 * alive. Not session security: the Supabase session itself is unaffected.
 */
const IDLE_MS = 30 * 60_000
const EVENTS = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'mousemove'] as const

export default defineNuxtPlugin(() => {
  const auth = useAuthStore()
  const { prefs } = useUiPrefs()
  const channel =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('idle-logout') : null
  let timer: ReturnType<typeof setTimeout> | undefined
  let lastBroadcast = 0

  const arm = () => {
    clearTimeout(timer)
    timer = setTimeout(expire, IDLE_MS)
  }
  async function expire() {
    if (!auth.isAuthenticated || prefs.value.staySignedIn) return arm()
    await auth.logout()
    window.location.assign('/login?idle=1')
  }
  const onActivity = () => {
    arm()
    const now = Date.now()
    if (channel && now - lastBroadcast > 30_000) {
      lastBroadcast = now
      // oxlint-disable-next-line require-post-message-target-origin
      channel.postMessage('active') // BroadcastChannel has no target origin
    }
  }
  for (const e of EVENTS) window.addEventListener(e, onActivity, { passive: true })
  channel?.addEventListener('message', arm)
  arm()
})
