import type { Subscription } from '#shared/types'

// Reads the current tenant's subscription (RLS-scoped) and exposes the effective
// plan + an entitlement gate. A tenant with no row, or a non-active status, is
// treated as free. mapSubscription is auto-imported from the root app/utils.
const PLAN_RANK: Record<string, number> = { free: 0, pro: 1, enterprise: 2 }

export function useSubscription() {
  const supabase = useSupabaseClient()

  const { data, refresh, pending } = useAsyncData<Subscription | null>('subscription', async () => {
    const { data: row } = await supabase
      .from('subscriptions')
      .select('tenant_id, provider, plan, status, current_period_end')
      .maybeSingle()
    return row ? mapSubscription(row) : null
  })

  const plan = computed(() => {
    const s = data.value
    return s && (s.status === 'active' || s.status === 'trialing') ? s.plan : 'free'
  })
  const isActive = computed(() => plan.value !== 'free')
  /** Entitlement gate: is the effective plan at least `tier`? */
  function isAtLeast(tier: string) {
    return (PLAN_RANK[plan.value] ?? 0) >= (PLAN_RANK[tier] ?? 0)
  }

  return { subscription: data, plan, isActive, isAtLeast, refresh, pending }
}
