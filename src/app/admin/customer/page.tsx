'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface CustomerRow {
  id: number
  nama: string
  noHp: string
  fotoKtp: string | null
  createdAt: string
  totalPengajuan: number
  totalNominal: number
  activeCount: number
  lastStatus: string | null
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  MENUNGGU_TRANSFER: 'Menunggu Transfer',
  MENUNGGU_VERIFIKASI_TRANSFER: 'Verifikasi Transfer',
  AKTIF: 'Aktif',
  LUNAS: 'Lunas',
  JATUH_TEMPO: 'Jatuh Tempo',
  OVERDUE: 'Terlambat',
  DITOLAK: 'Ditolak',
  DIPERPANJANG: 'Diperpanjang'
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  MENUNGGU_TRANSFER: { bg: 'bg-amber-100', text: 'text-amber-800' },
  MENUNGGU_VERIFIKASI_TRANSFER: { bg: 'bg-amber-100', text: 'text-amber-800' },
  AKTIF: { bg: 'bg-green-100', text: 'text-green-800' },
  LUNAS: { bg: 'bg-blue-100', text: 'text-blue-800' },
  JATUH_TEMPO: { bg: 'bg-orange-100', text: 'text-orange-800' },
  OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
  DITOLAK: { bg: 'bg-stone-100', text: 'text-stone-600' },
  DIPERPANJANG: { bg: 'bg-purple-100', text: 'text-purple-800' }
}

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num)
}

export default function AdminCustomerPage() {
  const [customers, setCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  useEffect(() => {
    const timeout = setTimeout(() => fetchData(1), 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const fetchData = async (page: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)

      const res = await fetch(`/api/customer?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()

      if (data.success) {
        setCustomers(data.data)
        setPagination({
          page: data.pagination.page,
          totalPages: data.pagination.totalPages,
          total: data.pagination.total
        })
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Customer</h1>
        <p className="text-stone-500 text-sm mt-1">Data customer unik berdasarkan nomor HP ({pagination.total} customer)</p>
      </div>

      <div className="bg-white rounded-xl p-4 border border-stone-100 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama atau nomor HP..."
          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm"
        />
      </div>

      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">No. HP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden sm:table-cell">Foto KTP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Total Pengajuan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Total Pinjaman</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status Terakhir</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-stone-400">Memuat data...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400">Belum ada data customer</td>
                </tr>
              ) : (
                customers.map((c) => {
                  const statusStyle = c.lastStatus ? (STATUS_STYLES[c.lastStatus] || STATUS_STYLES.PENDING) : null
                  return (
                    <tr key={c.id} className="hover:bg-stone-50 transition">
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-stone-800">{c.nama}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-600">{c.noHp}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {c.fotoKtp ? (
                          <a href={c.fotoKtp} target="_blank" rel="noopener noreferrer" className="text-amber-600 hover:text-amber-700 text-sm font-medium">
                            Lihat
                          </a>
                        ) : (
                          <span className="text-stone-300 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-700">
                        {c.totalPengajuan} <span className="text-stone-400">({c.activeCount} aktif)</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm font-semibold text-stone-700">
                        {formatRupiah(c.totalNominal)}
                      </td>
                      <td className="px-4 py-3">
                        {statusStyle && c.lastStatus ? (
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                            {STATUS_LABELS[c.lastStatus] || c.lastStatus}
                          </span>
                        ) : (
                          <span className="text-stone-300 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/customer/${c.id}`}
                          className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition"
                        >
                          Detail
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t border-stone-100">
            <button
              disabled={pagination.page <= 1}
              onClick={() => fetchData(pagination.page - 1)}
              className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-50"
            >
              &larr; Sebelumnya
            </button>
            <span className="text-sm text-stone-500">Halaman {pagination.page} dari {pagination.totalPages}</span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => fetchData(pagination.page + 1)}
              className="px-3 py-1.5 text-sm rounded-lg border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-50"
            >
              Berikutnya &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
