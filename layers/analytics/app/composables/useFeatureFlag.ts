// Reactive PostHog feature flag. Returns a ref that starts at `fallback` and
// updates when PostHog loads flags. When analytics is disabled the ref just
// stays at `fallback`, so gated UI degrades to its default with no PostHog.
//
//   const newUI = useFeatureFlag('new-dashboard')      // boolean flag
//   const variant = useFeatureFlag('cta-copy', 'control') // multivariate
export function useFeatureFlag<T extends boolean | string>(
  key: string,
  fallback: T = false as T,
): Ref<T> {
  const flag = ref(fallback) as Ref<T>
  const { $posthog } = useNuxtApp()
  if (!$posthog) return flag

  const read = () => {
    const v = $posthog.getFeatureFlag(key)
    if (v !== undefined) flag.value = v as T
  }
  // onFeatureFlags fires once flags are loaded and on any refresh.
  $posthog.onFeatureFlags(read)
  read()

  return flag
}
