import { describe, expect, it } from 'vitest'

import {
  mapNote,
  mapNotification,
  mapProfile,
  mapSubscription,
  mapTenant,
} from './mappers'

describe('mappers', () => {
  it('mapTenant', () => {
    expect(mapTenant({ id: 't1', name: 'Acme' })).toEqual({ id: 't1', name: 'Acme' })
  })

  it('mapSubscription', () => {
    expect(
      mapSubscription({
        tenant_id: 't1',
        provider: 'polar',
        plan: 'pro',
        status: 'active',
        current_period_end: '2026-01-01',
      }),
    ).toEqual({
      tenantId: 't1',
      provider: 'polar',
      plan: 'pro',
      status: 'active',
      currentPeriodEnd: '2026-01-01',
    })
  })

  it('mapProfile', () => {
    expect(
      mapProfile({
        id: 'u1',
        tenant_id: 't1',
        full_name: 'Ada',
        email: 'a@x.com',
        role: 'admin',
        avatar_url: null,
        created_at: '2026-01-01',
      }),
    ).toEqual({
      id: 'u1',
      tenantId: 't1',
      fullName: 'Ada',
      email: 'a@x.com',
      role: 'admin',
      avatarUrl: null,
      createdAt: '2026-01-01',
    })
  })

  it('mapNote', () => {
    expect(
      mapNote({
        id: 'n1',
        tenant_id: 't1',
        user_id: 'u1',
        title: 'T',
        body: 'B',
        created_at: '2026-01-01',
        updated_at: '2026-01-02',
      }),
    ).toEqual({
      id: 'n1',
      tenantId: 't1',
      userId: 'u1',
      title: 'T',
      body: 'B',
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    })
  })

  it('mapNotification', () => {
    expect(
      mapNotification({
        id: 'x1',
        recipient_id: 'u1',
        actor_id: 'u2',
        type: 'note_created',
        note_id: 'n1',
        read_at: null,
        created_at: '2026-01-01',
      }),
    ).toEqual({
      id: 'x1',
      recipientId: 'u1',
      actorId: 'u2',
      type: 'note_created',
      noteId: 'n1',
      readAt: null,
      createdAt: '2026-01-01',
    })
  })
})
