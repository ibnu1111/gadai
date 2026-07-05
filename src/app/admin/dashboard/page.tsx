'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { handleUnauthorized } from '@/lib/adminSession'

interface Summary {
  totalGadai: number
  aktif: number
  pending: number
  jatuhTempo: number
  overdue: number
  lunas: number
  totalNominal: number
}

interface Gadai {
  gadaiID: number
  customer: { nama: string; noHp: string }
  namaBarang: string
  kategoriBarang: string
  nominalPinjam: string
  status: string
  createdAt: string
}

interface CustomerRow {
  id: number
  nama: string
  noHp: string
  totalPengajuan: number
  totalNominal: number
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  MENUNGGU_REKENING: 'Menunggu Rekening',
  MENUNGGU_TRANSFER: 'Menunggu Transfer',
  MENUNGGU_VERIFIKASI_TRANSFER: 'Verifikasi Transfer',
  AKTIF: 'Aktif',
  LUNAS: 'Lunas',
  JATUH_TEMPO: 'Jatuh Tempo',
  OVERDUE: 'Terlambat',
  DITOLAK: 'Ditolak',
  DIPERPANJANG: 'Diperpanjang'
}

const STATUS_STYLES: Record<string, { bg: string; text: string; bar: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', bar: 'bg-yellow-400' },
  MENUNGGU_REKENING: { bg: 'bg-amber-100', text: 'text-amber-800', bar: 'bg-amber-400' },
  MENUNGGU_TRANSFER: { bg: 'bg-amber-100', text: 'text-amber-800', bar: 'bg-amber-400' },
  MENUNGGU_VERIFIKASI_TRANSFER: { bg: 'bg-amber-100', text: 'text-amber-800', bar: 'bg-amber-400' },
  AKTIF: { bg: 'bg-green-100', text: 'text-green-800', bar: 'bg-green-500' },
  LUNAS: { bg: 'bg-blue-100', text: 'text-blue-800', bar: 'bg-blue-500' },
  JATUH_TEMPO: { bg: 'bg-orange-100', text: 'text-orange-800', bar: 'bg-orange-500' },
  OVERDUE: { bg: 'bg-red-100', text: 'text-red-800', bar: 'bg-red-500' },
  DIPERPANJANG: { bg: 'bg-purple-100', text: 'text-purple-800', bar: 'bg-purple-500' }
}

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [recentGadai, setRecentGadai] = useState<Gadai[]>([])
  const [topCustomers, setTopCustomers] = useState<CustomerRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem('adminToken')
        const headers = { Authorization: `Bearer ${token}` }

        const [summaryRes, gadaiRes, customerRes] = await Promise.all([
          fetch('/api/gadai/summary', { headers }),
          fetch('/api/gadai?limit=5', { headers }),
          fetch('/api/customer?limit=5', { headers })
        ])

        if (handleUnauthorized(summaryRes.status, '/admin/dashboard')) return

        const summaryData = await summaryRes.json()
        const gadaiData = await gadaiRes.json()
        const customerData = await customerRes.json()

        if (summaryData.success) setSummary(summaryData.data)
        if (gadaiData.success) setRecentGadai(gadaiData.data)
        if (customerData.success) {
          const sorted = [...customerData.data].sort(
            (a: CustomerRow, b: CustomerRow) => b.totalNominal - a.totalNominal
          )
          setTopCustomers(sorted.slice(0, 5))
        }
      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const statusBreakdown = summary
    ? [
        { key: 'PENDING', count: summary.pending },
        { key: 'AKTIF', count: summary.aktif },
        { key: 'JATUH_TEMPO', count: summary.jatuhTempo },
        { key: 'OVERDUE', count: summary.overdue },
        { key: 'LUNAS', count: summary.lunas }
      ]
    : []
  const maxStatusCount = Math.max(1, ...statusBreakdown.map((s) => s.count))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Dashboard</h1>
        <p className="text-stone-500 text-sm mt-1">Ringkasan performa layanan gadai</p>
      </div>

      {loading || !summary ? (
        <div className="bg-white rounded-xl p-8 border border-stone-100 text-center text-stone-400">
          Memuat data...
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Total Pengajuan</p>
              <p className="text-2xl font-bold text-stone-800">{summary.totalGadai}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Aktif</p>
              <p className="text-2xl font-bold text-green-600">{summary.aktif}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Menunggu</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Jatuh Tempo</p>
              <p className="text-2xl font-bold text-orange-600">{summary.jatuhTempo}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Terlambat</p>
              <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-stone-100">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Total Pinjaman Aktif</p>
              <p className="text-lg font-bold text-amber-600 truncate">{formatRupiah(Number(summary.totalNominal))}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Status breakdown */}
            <div className="bg-white rounded-xl border border-stone-100 p-5 lg:col-span-1">
              <h2 className="font-semibold text-stone-800 mb-4">Sebaran Status</h2>
              <div className="space-y-3">
                {statusBreakdown.map((s) => {
                  const style = STATUS_STYLES[s.key] || STATUS_STYLES.PENDING
                  return (
                    <div key={s.key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-stone-600">{STATUS_LABELS[s.key]}</span>
                        <span className="font-semibold text-stone-800">{s.count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${style.bar}`}
                          style={{ width: `${(s.count / maxStatusCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Recent pengajuan */}
            <div className="bg-white rounded-xl border border-stone-100 p-5 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-semibold text-stone-800">Pengajuan Terbaru</h2>
                <Link href="/admin/gadai" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                  Lihat semua
                </Link>
              </div>
              {recentGadai.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-8">Belum ada data pengajuan</p>
              ) : (
                <div className="divide-y divide-stone-100">
                  {recentGadai.map((g) => {
                    const style = STATUS_STYLES[g.status] || STATUS_STYLES.PENDING
                    return (
                      <Link
                        key={g.gadaiID}
                        href={`/admin/gadai/${g.gadaiID}`}
                        className="flex items-center justify-between py-3 hover:bg-stone-50 -mx-2 px-2 rounded-lg transition"
                      >
                        <div>
                          <p className="text-sm font-medium text-stone-800">{g.namaBarang}</p>
                          <p className="text-xs text-stone-400">{g.customer.nama} &bull; {formatDate(g.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-stone-700">{formatRupiah(Number(g.nominalPinjam))}</p>
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
                            {STATUS_LABELS[g.status] || g.status}
                          </span>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Top customers */}
          <div className="bg-white rounded-xl border border-stone-100 p-5 mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-stone-800">Customer Teraktif</h2>
              <Link href="/admin/customer" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                Lihat semua
              </Link>
            </div>
            {topCustomers.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-8">Belum ada data customer</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {topCustomers.map((c) => (
                  <Link
                    key={c.id}
                    href={`/admin/customer/${c.id}`}
                    className="border border-stone-100 rounded-lg p-3 hover:border-amber-200 hover:bg-amber-50/40 transition"
                  >
                    <p className="text-sm font-medium text-stone-800 truncate">{c.nama}</p>
                    <p className="text-xs text-stone-400">{c.noHp}</p>
                    <p className="text-xs text-stone-500 mt-1">{c.totalPengajuan} pengajuan</p>
                    <p className="text-sm font-semibold text-amber-600">{formatRupiah(c.totalNominal)}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
