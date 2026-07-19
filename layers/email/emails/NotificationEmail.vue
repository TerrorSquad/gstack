<script setup lang="ts">
// Transactional email authored as a Vue component with @vue-email/components.
// Rendered to inlined-table HTML server-side by renderEmail() — never mounted in
// the app. Email clients strip <style>/flexbox, so the components emit inline
// styles + tables for us.
import { Body, Button, Container, Head, Heading, Html, Section, Text } from '@vue-email/components'

defineProps<{
  heading: string
  intro: string
  noteTitle: string
  actionUrl: string
}>()
</script>

<template>
  <Html lang="en">
    <Head />
    <Body :style="{ margin: '0', padding: '0', background: '#f3f4f6', fontFamily: 'sans-serif', color: '#111827' }">
      <Container :style="{ maxWidth: '520px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px 32px' }">
        <Section :style="{ textAlign: 'center' }">
          <Text :style="{ color: '#059669', fontWeight: '700', fontSize: '18px' }">Starter</Text>
          <Heading :style="{ fontSize: '20px', color: '#111827' }">{{ heading }}</Heading>
          <Text :style="{ color: '#374151', fontSize: '14px' }">{{ intro }}</Text>
          <Text :style="{ padding: '12px 16px', background: '#f3f4f6', borderRadius: '8px', fontSize: '14px', fontWeight: '600' }">{{ noteTitle }}</Text>
          <Button :href="actionUrl" :style="{ background: '#059669', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', textDecoration: 'none' }">View</Button>
        </Section>
      </Container>
    </Body>
  </Html>
</template>
