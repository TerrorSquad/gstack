export type RoadmapStatus = 'planned' | 'in-progress' | 'shipped'

export interface RoadmapItem {
  status: RoadmapStatus
  title: string
  description?: string
}

// Hand-curated public roadmap rendered at /roadmap — the forward-looking sibling
// of the changelog. When an item ships, flip its status to 'shipped' here and add
// a dated entry to app/utils/changelog.ts. No dates, no promises; order within a
// status column is priority. See the `add-layer`/`changelog` skills.
export const ROADMAP_ITEMS: RoadmapItem[] = [
  {
    status: 'planned',
    title: 'Per-seat billing',
    description: 'Seat-based plans on top of the existing Polar integration.',
  },
  {
    status: 'in-progress',
    title: 'Public roadmap',
    description: 'This page — a static, i18n-ready board mirroring the changelog.',
  },
  {
    status: 'shipped',
    title: 'Team invites',
    description: 'Admins invite members into their tenant by email.',
  },
]
