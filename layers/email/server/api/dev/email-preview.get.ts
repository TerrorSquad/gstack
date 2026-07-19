import { emailRegistry, renderPreview } from '../../utils/emails'

// Dev-only: renders a registry template to raw HTML for the /dev/emails iframe.
// 404s in production so no email internals leak. ?id=<template> selects one;
// falls back to the first registered template.
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) throw createError({ statusCode: 404 })

  const id = (getQuery(event).id as string) || emailRegistry[0]?.id
  const entry = emailRegistry.find((e) => e.id === id)
  if (!entry) throw createError({ statusCode: 404, message: `unknown email: ${id}` })

  const html = await renderPreview(entry.id, entry.sampleProps)
  setResponseHeader(event, 'content-type', 'text/html; charset=utf-8')
  return html
})
