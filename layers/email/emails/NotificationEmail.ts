import { Body, Button, Container, Head, Heading, Html, Section, Text } from '@vue-email/components'
import { defineComponent, h } from 'vue'

import { EMAIL_BRAND } from '../server/utils/emailShell'

// Transactional email authored as a render-function component (not an SFC):
// @vue-email/render runs inside Nitro's server bundle, which has no Vue SFC
// compiler, so templates are plain .ts using h() + @vue-email/components.
// Email clients strip <style>/flexbox, so the components emit inline styles +
// tables for us. Rendered to HTML by renderNotificationEmail() in emails.ts.

export interface NotificationEmailProps {
  heading: string
  intro: string
  noteTitle: string
  actionUrl: string
}

export default defineComponent<NotificationEmailProps>({
  name: 'NotificationEmail',
  props: {
    heading: { type: String, required: true },
    intro: { type: String, required: true },
    noteTitle: { type: String, required: true },
    actionUrl: { type: String, required: true },
  } as never,
  setup(props) {
    return () =>
      h(Html, { lang: 'en' }, () => [
        h(Head),
        h(Body, { style: { margin: '0', padding: '0', background: EMAIL_BRAND.page, fontFamily: 'sans-serif', color: EMAIL_BRAND.heading } }, () =>
          h(Container, { style: { maxWidth: '520px', background: EMAIL_BRAND.surface, border: `1px solid ${EMAIL_BRAND.border}`, borderRadius: '16px', padding: '24px 32px' } }, () =>
            h(Section, { style: { textAlign: 'center' } }, () => [
              h(Text, { style: { color: EMAIL_BRAND.accent, fontWeight: '700', fontSize: '18px' } }, () => 'GStack'),
              h(Heading, { style: { fontSize: '20px', color: EMAIL_BRAND.heading } }, () => props.heading),
              h(Text, { style: { color: EMAIL_BRAND.body, fontSize: '14px' } }, () => props.intro),
              h(Text, { style: { padding: '12px 16px', background: EMAIL_BRAND.page, borderRadius: '8px', fontSize: '14px', fontWeight: '600' } }, () => props.noteTitle),
              h(Button, { href: props.actionUrl, style: { background: EMAIL_BRAND.accent, color: EMAIL_BRAND.surface, padding: '12px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' } }, () => 'View'),
            ]))),
      ])
  },
})
