export type Role = 'member' | 'admin'

export type NotificationType = 'note_created'

export interface Tenant {
  id: string
  name: string
}

export interface Profile {
  id: string
  tenantId: string
  fullName: string
  email: string
  role: Role
  avatarUrl: string | null
  createdAt: string
}

export interface Note {
  id: string
  tenantId: string
  userId: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export interface Notification {
  id: string
  recipientId: string
  actorId: string | null
  type: NotificationType
  noteId: string | null
  readAt: string | null
  createdAt: string
}

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: Role[]
  }
}
