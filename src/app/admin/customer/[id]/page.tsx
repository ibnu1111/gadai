'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Gadai {
  gadaiID: number
  namaBarang: string
  kategoriBarang: string
  nominalPinjam: string
  fee: string
  totalPembayaran: string
  status: string
  tanggalPinjam: string
  tanggalKembali: string
}

interface CustomerDetail {
  id: number
  nama: string
  noHp: string
  fotoKtp: string | null
  createdAt: string
  gadais: Gadai[]
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

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export default function AdminCustomerDetailPage() {
  const params = useParams()
  const id = params.id as string
  const [customer, setCustomer] = useState<CustomerDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const res = await fetch(`/api/customer/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success) {
          setCustomer(data.data)
        } else {
          setError(data.message || 'Customer tidak ditemukan')
        }
      } catch {
        setError('Gagal memuat data customer')
      } finally {
        setLoading(false)
      }
    }
    fetchCustomer()
  }, [id])

  if (loading) {
    return <div className="bg-white rounded-xl p-8 border border-stone-100 text-center text-stone-400">Memuat data...</div>
  }

  if (error || !customer) {
    return (
      <div className="bg-white rounded-xl p-8 border border-stone-100 text-center">
        <p className="text-red-500 mb-4">{error || 'Customer tidak ditemukan'}</p>
        <Link href="/admin/customer" className="text-amber-600 hover:text-amber-700 font-medium">&larr; Kembali ke daftar customer</Link>
      </div>
    )
  }

  const totalNominal = customer.gadais.reduce((sum, g) => sum + Number(g.nominalPinjam), 0)
  const totalDibayar = customer.gadais.reduce((sum, g) => sum + Number(g.totalPembayaran), 0)
  const activeCount = customer.gadais.filter((g) => ['AKTIF', 'JATUH_TEMPO', 'OVERDUE'].includes(g.status)).length

  return (
    <div>
      <Link href="/admin/customer" className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-flex items-center gap-1">
        &larr; Kembali ke daftar customer
      </Link>

      <div className="bg-white rounded-xl border border-stone-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-800">{customer.nama}</h1>
            <p className="text-stone-500">{customer.noHp}</p>
            <p className="text-xs text-stone-400 mt-1">Customer sejak {formatDate(customer.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`https://wa.me/${customer.noHp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              WhatsApp
            </a>
            {customer.fotoKtp && (
              <a
                href={customer.fotoKtp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Lihat Foto KTP
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="bg-stone-50 rounded-lg p-3">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Total Pengajuan</p>
            <p className="text-xl font-bold text-stone-800">{customer.gadais.length}</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Sedang Aktif</p>
            <p className="text-xl font-bold text-green-600">{activeCount}</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Total Pinjaman</p>
            <p className="text-lg font-bold text-amber-600 truncate">{formatRupiah(totalNominal)}</p>
          </div>
          <div className="bg-stone-50 rounded-lg p-3">
            <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Total Dibayar</p>
            <p className="text-lg font-bold text-blue-600 truncate">{formatRupiah(totalDibayar)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100">
          <h2 className="font-semibold text-stone-800">Riwayat Pengajuan</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Barang</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {customer.gadais.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-stone-400">Belum ada pengajuan</td>
                </tr>
              ) : (
                customer.gadais.map((g) => {
                  const style = STATUS_STYLES[g.status] || STATUS_STYLES.PENDING
                  return (
                    <tr key={g.gadaiID} className="hover:bg-stone-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-stone-600">#{g.gadaiID}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-stone-700">{g.namaBarang}</p>
                        <p className="text-xs text-stone-400">{g.kategoriBarang}</p>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-stone-700">{formatRupiah(Number(g.nominalPinjam))}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-sm text-stone-500">{formatDate(g.tanggalPinjam)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
                          {STATUS_LABELS[g.status] || g.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/admin/gadai/${g.gadaiID}`} className="text-sm text-amber-600 hover:text-amber-700 font-medium">
                          Detail
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
