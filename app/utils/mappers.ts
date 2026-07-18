import type { Note, Notification, Profile, Subscription, Tenant } from '#shared/types'
import type { Tables } from '#shared/types/database.types'

// Each mapper accepts a Pick of exactly the columns it reads, so a query that
// under-selects fails at typecheck instead of silently producing undefined.
type TenantRow = Pick<Tables<'tenants'>, 'id' | 'name'>
type ProfileRow = Pick<
  Tables<'profiles'>,
  'id' | 'tenant_id' | 'full_name' | 'email' | 'role' | 'avatar_url' | 'created_at'
>
type NoteRow = Pick<
  Tables<'notes'>,
  'id' | 'tenant_id' | 'user_id' | 'title' | 'body' | 'created_at' | 'updated_at'
>
type NotificationRow = Pick<
  Tables<'notifications'>,
  'id' | 'recipient_id' | 'actor_id' | 'type' | 'note_id' | 'read_at' | 'created_at'
>

export function mapTenant(row: TenantRow): Tenant {
  return { id: row.id, name: row.name }
}

type SubscriptionRow = Pick<
  Tables<'subscriptions'>,
  'tenant_id' | 'provider' | 'plan' | 'status' | 'current_period_end'
>

export function mapSubscription(row: SubscriptionRow): Subscription {
  return {
    tenantId: row.tenant_id,
    provider: row.provider,
    plan: row.plan,
    status: row.status,
    currentPeriodEnd: row.current_period_end,
  }
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  }
}

export function mapNote(row: NoteRow): Note {
  return {
    id: row.id,
    tenantId: row.tenant_id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function mapNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    recipientId: row.recipient_id,
    actorId: row.actor_id,
    type: row.type,
    noteId: row.note_id,
    readAt: row.read_at,
    createdAt: row.created_at,
  }
}
