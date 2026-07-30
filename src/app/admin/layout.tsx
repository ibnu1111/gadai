import type { Metadata } from 'next'
import AdminLayoutClient from './AdminLayoutClient'

// Admin area is an internal tool, not public content: keep it out of Google entirely
// (defense in depth alongside the `Disallow: /admin/` rule in robots.ts).
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>
}
