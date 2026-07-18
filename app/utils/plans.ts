// Pricing plans. Structure + price live here; display text is i18n
// (`pricing.plan.<id>.*`, `pricing.feature.<key>`). In Phase 4 (billing) add the
// provider's price id per plan and bind checkout to it — the `id` is the seam.
export interface Plan {
  id: string
  priceMonthly: number // 0 = free
  highlighted?: boolean
  featureKeys: string[]
  // priceId?: string  // ← add in Phase 4: the billing provider's price id
}

export const PLANS: Plan[] = [
  {
    id: 'free',
    priceMonthly: 0,
    featureKeys: ['oneTenant', 'notesBasic', 'community'],
  },
  {
    id: 'pro',
    priceMonthly: 12,
    highlighted: true,
    featureKeys: ['everythingFree', 'unlimitedNotes', 'notifications', 'prioritySupport'],
  },
  {
    id: 'enterprise',
    priceMonthly: 49,
    featureKeys: ['everythingPro', 'sso', 'audit', 'sla'],
  },
]
