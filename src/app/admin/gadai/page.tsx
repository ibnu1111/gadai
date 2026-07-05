'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { handleUnauthorized } from '@/lib/adminSession'

interface Gadai {
  gadaiID: number
  customer: { nama: string; noHp: string; fotoKtp: string | null }
  namaBarang: string
  nominalPinjam: string
  status: string
  tanggalPinjam: string
  kategoriBarang: string
  fotoPendukung: string | null
  fotoCustomerBarang: string | null
  noRekening: string | null
  namaBank: string | null
  nomorPolisi: string | null
}

interface Summary {
  totalGadai: number
  aktif: number
  pending: number
  jatuhTempo: number
  overdue: number
  lunas: number
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

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  MENUNGGU_REKENING: { bg: 'bg-amber-100', text: 'text-amber-800' },
  MENUNGGU_TRANSFER: { bg: 'bg-amber-100', text: 'text-amber-800' },
  MENUNGGU_VERIFIKASI_TRANSFER: { bg: 'bg-amber-100', text: 'text-amber-800' },
  AKTIF: { bg: 'bg-green-100', text: 'text-green-800' },
  LUNAS: { bg: 'bg-blue-100', text: 'text-blue-800' },
  JATUH_TEMPO: { bg: 'bg-orange-100', text: 'text-orange-800' },
  OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
  DITOLAK: { bg: 'bg-stone-100', text: 'text-stone-600' },
  DIPERPANJANG: { bg: 'bg-purple-100', text: 'text-purple-800' }
}

type DocKey = 'ktp' | 'stnk' | 'fotoBarang' | 'rekening' | 'bank' | 'polisi'

interface DocItem {
  key: DocKey
  label: string
  complete: boolean
}

function getDocItems(gadai: Gadai): DocItem[] {
  const isKendaraan = gadai.kategoriBarang === 'Motor' || gadai.kategoriBarang === 'Mobil'
  const showAdminCompletion = ['PENDING', 'MENUNGGU_REKENING', 'MENUNGGU_TRANSFER'].includes(gadai.status)

  const items: DocItem[] = [
    { key: 'ktp', label: 'Foto KTP', complete: Boolean(gadai.customer.fotoKtp) }
  ]
  if (isKendaraan) {
    items.push({ key: 'stnk', label: 'Foto STNK', complete: Boolean(gadai.fotoPendukung) })
  }
  if (showAdminCompletion) {
    items.push({ key: 'fotoBarang', label: 'Foto Customer + Barang', complete: Boolean(gadai.fotoCustomerBarang) })
    items.push({ key: 'rekening', label: 'Nomor Rekening', complete: Boolean(gadai.noRekening) })
    items.push({ key: 'bank', label: 'Nama Bank', complete: Boolean(gadai.namaBank) })
    if (isKendaraan) {
      items.push({ key: 'polisi', label: 'Nomor Polisi', complete: Boolean(gadai.nomorPolisi) })
    }
  }
  return items
}

const DOC_ICON_PATHS: Record<DocKey, React.ReactNode> = {
  ktp: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <circle cx="8" cy="12" r="1.75" />
      <path d="M13 10h5M13 14h5" />
    </>
  ),
  stnk: (
    <>
      <path d="M6 3h8l4 4v14H6z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 16h6" />
    </>
  ),
  fotoBarang: (
    <>
      <path d="M4 8h3l2-2h6l2 2h3v11H4z" />
      <circle cx="12" cy="13" r="3" />
    </>
  ),
  rekening: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  bank: (
    <>
      <path d="M4 10l8-6 8 6" />
      <path d="M4 10h16v9H4z" />
      <path d="M9 10v9M15 10v9" />
    </>
  ),
  polisi: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="1" />
      <path d="M7 12h10" />
    </>
  )
}

function CompletenessIcons({ gadai }: { gadai: Gadai }) {
  const items = getDocItems(gadai)
  return (
    <div className="flex items-center gap-1 flex-wrap max-w-[168px]">
      {items.map((item) => (
        <span
          key={item.key}
          title={`${item.label}: ${item.complete ? 'Lengkap' : 'Belum lengkap'}`}
          className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-transform hover:scale-110 cursor-help ${
            item.complete ? 'bg-green-100 text-green-600' : 'bg-stone-100 text-stone-400'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round">
            {DOC_ICON_PATHS[item.key]}
          </svg>
        </span>
      ))}
    </div>
  )
}

export default function AdminGadaiPage() {
  const [gadais, setGadais] = useState<Gadai[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', search: '' })
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })

  useEffect(() => {
    fetchData(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.status, filters.search])

  const fetchData = async (page: number) => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams({ page: String(page), limit: '10' })
      if (filters.status) params.set('status', filters.status)
      if (filters.search) params.set('search', filters.search)

      const [gadaiRes, summaryRes] = await Promise.all([
        fetch(`/api/gadai?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/gadai/summary', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ])

      if (handleUnauthorized(gadaiRes.status, '/admin/gadai')) return

      const gadaiData = await gadaiRes.json()
      const summaryData = await summaryRes.json()

      if (gadaiData.success) {
        setGadais(gadaiData.data)
        setPagination({
          page: gadaiData.pagination.page,
          totalPages: gadaiData.pagination.totalPages,
          total: gadaiData.pagination.total
        })
      }
      if (summaryData.success) setSummary(summaryData.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Pengajuan</h1>
          <p className="text-stone-500 text-sm mt-1">Kelola semua pengajuan gadai ({pagination.total} total)</p>
        </div>
        <Link
          href="/admin/gadai/create"
          className="inline-flex items-center gap-2 bg-stone-800 text-white px-5 py-2.5 rounded-lg hover:bg-stone-900 font-medium transition shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Gadai
        </Link>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Total</p>
            <p className="text-2xl font-bold text-stone-800">{summary.totalGadai}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Aktif</p>
            <p className="text-2xl font-bold text-green-600">{summary.aktif}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Jatuh Tempo</p>
            <p className="text-2xl font-bold text-orange-600">{summary.jatuhTempo}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Total Pinjaman</p>
            <p className="text-lg font-bold text-amber-600 truncate">{formatRupiah(Number(summary.totalNominal))}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-stone-100 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Cari nama barang atau customer..."
              className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition text-sm text-stone-600"
          >
            <option value="">Semua Status</option>
            <option value="PENDING">Menunggu</option>
            <option value="MENUNGGU_REKENING">Menunggu Rekening</option>
            <option value="MENUNGGU_TRANSFER">Menunggu Transfer</option>
            <option value="MENUNGGU_VERIFIKASI_TRANSFER">Verifikasi Transfer</option>
            <option value="AKTIF">Aktif</option>
            <option value="JATUH_TEMPO">Jatuh Tempo</option>
            <option value="OVERDUE">Overdue</option>
            <option value="LUNAS">Lunas</option>
            <option value="DITOLAK">Ditolak</option>
            <option value="DIPERPANJANG">Diperpanjang</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden sm:table-cell">Barang</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden lg:table-cell">Kelengkapan</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-400">
                    <div className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                      Memuat data...
                    </div>
                  </td>
                </tr>
              ) : gadais.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-stone-400">
                    <svg className="w-12 h-12 mx-auto mb-3 text-stone-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p>Belum ada data gadai</p>
                  </td>
                </tr>
              ) : (
                gadais.map((gadai) => {
                  const statusStyle = STATUS_STYLES[gadai.status] || STATUS_STYLES.PENDING
                  return (
                    <tr key={gadai.gadaiID} className="hover:bg-stone-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-stone-600">#{gadai.gadaiID}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-stone-800">{gadai.customer.nama}</p>
                        <p className="text-xs text-stone-400">{gadai.customer.noHp}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <p className="text-sm text-stone-700">{gadai.namaBarang}</p>
                        <p className="text-xs text-stone-400">{gadai.kategoriBarang}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-stone-700">{formatRupiah(Number(gadai.nominalPinjam))}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-stone-500">{formatDate(gadai.tanggalPinjam)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                          {STATUS_LABELS[gadai.status] || gadai.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <CompletenessIcons gadai={gadai} />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          href={`/admin/gadai/${gadai.gadaiID}`}
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
