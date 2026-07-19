import { emailRegistry } from '../../utils/emails'

// Dev-only: the list of previewable templates for the /dev/emails page tabs.
export default defineEventHandler(() => {
  if (!import.meta.dev) throw createError({ statusCode: 404 })
  return emailRegistry.map((e) => ({ id: e.id, label: e.label }))
})
