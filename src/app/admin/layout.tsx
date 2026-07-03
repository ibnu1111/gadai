'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [admin, setAdmin] = useState<{ nama: string; email: string } | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const handleLogout = () => {
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminData')
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  const navLinkClass = (active: boolean) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition ${
      active ? 'bg-stone-100 text-stone-900' : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
    }`

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <Link href="/admin/dashboard" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-amber-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <span className="text-lg font-semibold text-stone-800">Gadai Jogja</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link href="/admin/dashboard" className={navLinkClass(pathname === '/admin/dashboard')}>
                  Dashboard
                </Link>
                <Link href="/admin/gadai" className={navLinkClass(pathname === '/admin/gadai' || pathname.startsWith('/admin/gadai/'))}>
                  Pengajuan
                </Link>
                <Link href="/admin/customer" className={navLinkClass(pathname === '/admin/customer' || pathname.startsWith('/admin/customer/'))}>
                  Customer
                </Link>
              </nav>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              {admin && (
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-stone-800">{admin.nama}</p>
                  <p className="text-xs text-stone-500">{admin.email}</p>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="hidden sm:inline">Keluar</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen((prev) => !prev)}
                aria-label="Buka menu navigasi"
                aria-expanded={mobileMenuOpen}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-stone-600 hover:bg-stone-50 transition"
              >
                {mobileMenuOpen ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <nav className="md:hidden flex flex-col gap-1 pb-4">
              <Link href="/admin/dashboard" className={navLinkClass(pathname === '/admin/dashboard')}>
                Dashboard
              </Link>
              <Link href="/admin/gadai" className={navLinkClass(pathname === '/admin/gadai' || pathname.startsWith('/admin/gadai/'))}>
                Pengajuan
              </Link>
              <Link href="/admin/customer" className={navLinkClass(pathname === '/admin/customer' || pathname.startsWith('/admin/customer/'))}>
                Customer
              </Link>
              {admin && (
                <div className="sm:hidden px-4 pt-2 mt-1 border-t border-stone-100">
                  <p className="text-sm font-medium text-stone-800">{admin.nama}</p>
                  <p className="text-xs text-stone-500">{admin.email}</p>
                </div>
              )}
            </nav>
          )}
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
