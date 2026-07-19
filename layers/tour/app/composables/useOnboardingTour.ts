import { driver, type DriveStep } from 'driver.js'

// Onboarding product tour (driver.js). Highlights real nav elements the first
// time a signed-in user lands, once per browser. Off unless NUXT_PUBLIC_TOUR_
// ENABLED. start() is idempotent-safe; hasSeen()/markSeen() gate the auto-start.
//
// Steps target nav links by href — robust to restyling, no markup hooks needed.
const SEEN_KEY = 'tour:onboarding:seen'

const steps: DriveStep[] = [
  {
    element: 'a[href="/dashboard"]',
    popover: { title: 'Your dashboard', description: 'The home base for everything in your workspace.' },
  },
  {
    element: 'a[href="/notes"]',
    popover: { title: 'Notes', description: 'Create and manage notes — the reference CRUD in this starter.' },
  },
  {
    element: 'a[href="/account"]',
    popover: { title: 'Account', description: 'Update your profile and preferences here.' },
  },
]

export function useOnboardingTour() {
  function hasSeen(): boolean {
    return import.meta.client && localStorage.getItem(SEEN_KEY) === '1'
  }
  function markSeen() {
    if (import.meta.client) localStorage.setItem(SEEN_KEY, '1')
  }

  function start() {
    if (!import.meta.client) return
    // Only include steps whose target actually exists (nav differs by role).
    const present = steps.filter((s) => document.querySelector(s.element as string))
    if (!present.length) return
    const d = driver({
      showProgress: true,
      steps: present,
      onDestroyed: markSeen, // mark seen whether finished or dismissed
    })
    d.drive()
  }

  return { start, hasSeen, markSeen }
}
