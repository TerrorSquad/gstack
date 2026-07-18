export type Role = 'member' | 'admin'

export interface Profile {
  id: string
  fullName: string
  email: string
  role: Role
  createdAt: string
}

export interface Note {
  id: string
  userId: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

declare module 'vue-router' {
  interface RouteMeta {
    public?: boolean
    roles?: Role[]
  }
}
