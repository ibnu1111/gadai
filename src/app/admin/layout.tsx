'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<{ nama: string; email: string } | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    const adminData = localStorage.getItem('adminData')

    if (!token || !adminData) {
      if (pathname !== '/admin/login') {
        router.push('/admin/login')
      }
    } else {
      setAdmin(JSON.parse(adminData))
    }
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/admin/gadai" className="text-xl font-bold text-purple-600">
                Gadai Service
              </Link>
              <div className="ml-10 flex space-x-4">
                <Link
                  href="/admin/gadai"
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    pathname === '/admin/gadai'
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Daftar Gadai
                </Link>
                <Link
                  href="/track"
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Lacak Gadai
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {admin && (
                <span className="text-sm text-gray-600">
                  {admin.nama}
                </span>
              )}
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 px-4">{children}</main>
    </div>
  )
}
