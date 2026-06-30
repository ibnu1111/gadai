'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Gadai {
  gadaiID: number
  customer: { nama: string; noHp: string }
  namaBarang: string
  nominalPinjam: string
  status: string
  tanggalPinjam: string
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
  AKTIF: 'Aktif',
  LUNAS: 'Lunas',
  JATUH_TEMPO: 'Jatuh Tempo',
  OVERDUE: 'Terlambat',
  DITOLAK: 'Ditolak',
  DIPERPANJANG: 'Diperpanjang'
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  AKTIF: 'bg-green-100 text-green-800',
  LUNAS: 'bg-blue-100 text-blue-800',
  JATUH_TEMPO: 'bg-orange-100 text-orange-800',
  OVERDUE: 'bg-red-100 text-red-800',
  DITOLAK: 'bg-gray-100 text-gray-800',
  DIPERPANJANG: 'bg-purple-100 text-purple-800'
}

export default function AdminGadaiPage() {
  const [gadais, setGadais] = useState<Gadai[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ status: '', search: '' })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const params = new URLSearchParams()
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

      const gadaiData = await gadaiRes.json()
      const summaryData = await summaryRes.json()

      if (gadaiData.success) setGadais(gadaiData.data)
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Daftar Gadai</h1>
        <Link
          href="/admin/gadai/create"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-medium"
        >
          + Tambah Gadai
        </Link>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-bold text-gray-800">{summary.totalGadai}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Aktif</p>
            <p className="text-2xl font-bold text-green-600">{summary.aktif}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Jatuh Tempo</p>
            <p className="text-2xl font-bold text-orange-600">{summary.jatuhTempo}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Overdue</p>
            <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Lunas</p>
            <p className="text-2xl font-bold text-blue-600">{summary.lunas}</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <p className="text-sm text-gray-500">Total Pinjaman</p>
            <p className="text-lg font-bold text-purple-600">{formatRupiah(Number(summary.totalNominal))}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Semua</option>
              <option value="PENDING">Menunggu</option>
              <option value="AKTIF">Aktif</option>
              <option value="JATUH_TEMPO">Jatuh Tempo</option>
              <option value="OVERDUE">Overdue</option>
              <option value="LUNAS">Lunas</option>
              <option value="DITOLAK">Ditolak</option>
              <option value="DIPERPANJANG">Diperpanjang</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Cari</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Nama barang / customer..."
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barang</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : gadais.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">Tidak ada data</td>
                </tr>
              ) : (
                gadais.map((gadai) => (
                  <tr key={gadai.gadaiID} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">#{gadai.gadaiID}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{gadai.customer.nama}</div>
                      <div className="text-sm text-gray-500">{gadai.customer.noHp}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{gadai.namaBarang}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{formatRupiah(Number(gadai.nominalPinjam))}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(gadai.tanggalPinjam)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[gadai.status]}`}>
                        {STATUS_LABELS[gadai.status] || gadai.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <Link
                        href={`/admin/gadai/${gadai.gadaiID}`}
                        className="text-purple-600 hover:text-purple-900 mr-3"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
