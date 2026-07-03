'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Payment {
  id: number
  jumlahBayar: string
  tipeBayar: string
  catatan: string | null
  createdAt: string
  createdBy: string | null
}

interface GadaiDetail {
  gadaiID: number
  customerID: number
  customer: { id: number; nama: string; noHp: string; fotoKtp: string | null }
  kategoriBarang: string
  namaBarang: string
  nominalPinjam: string
  bungaPersentase: string
  fee: string
  tanggalPinjam: string
  tanggalKembali: string
  atributTinggal: string
  deskripsi: string | null
  fotoBarang: string | null
  fotoPendukung: string | null
  status: string
  totalPembayaran: string
  perpanjanganKe: number
  parentGadaiID: number | null
  createdAt: string
  createdBy: string | null
  payments: Payment[]
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

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
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

export default function AdminGadaiDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [gadai, setGadai] = useState<GadaiDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNote, setPaymentNote] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  const [actionMessage, setActionMessage] = useState('')

  const fetchGadai = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/gadai/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setGadai(data.data)
        setStatusValue(data.data.status)
      } else {
        setError(data.message || 'Pengajuan tidak ditemukan')
      }
    } catch {
      setError('Gagal memuat data pengajuan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGadai()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleUpdateStatus = async () => {
    if (!gadai || statusValue === gadai.status) return
    setSavingStatus(true)
    setActionMessage('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/gadai/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: statusValue })
      })
      const data = await res.json()
      if (data.success) {
        setActionMessage('Status berhasil diperbarui')
        fetchGadai()
      } else {
        setActionMessage(data.message || 'Gagal memperbarui status')
      }
    } catch {
      setActionMessage('Gagal memperbarui status')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentAmount) return
    setSavingPayment(true)
    setActionMessage('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gadaiID: id, jumlahBayar: paymentAmount, catatan: paymentNote || undefined })
      })
      const data = await res.json()
      if (data.success) {
        setActionMessage('Pembayaran berhasil dicatat')
        setPaymentAmount('')
        setPaymentNote('')
        fetchGadai()
      } else {
        setActionMessage(data.message || 'Gagal mencatat pembayaran')
      }
    } catch {
      setActionMessage('Gagal mencatat pembayaran')
    } finally {
      setSavingPayment(false)
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl p-8 border border-stone-100 text-center text-stone-400">Memuat data...</div>
  }

  if (error || !gadai) {
    return (
      <div className="bg-white rounded-xl p-8 border border-stone-100 text-center">
        <p className="text-red-500 mb-4">{error || 'Pengajuan tidak ditemukan'}</p>
        <Link href="/admin/gadai" className="text-amber-600 hover:text-amber-700 font-medium">&larr; Kembali ke daftar pengajuan</Link>
      </div>
    )
  }

  const nominal = Number(gadai.nominalPinjam)
  const fee = Number(gadai.fee)
  const totalTagihan = nominal + fee
  const totalDibayar = Number(gadai.totalPembayaran)
  const sisaTagihan = Math.max(0, totalTagihan - totalDibayar)
  const style = STATUS_STYLES[gadai.status] || STATUS_STYLES.PENDING
  const isOverdue = gadai.status === 'OVERDUE'

  return (
    <div>
      <Link href="/admin/gadai" className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-flex items-center gap-1">
        &larr; Kembali ke daftar pengajuan
      </Link>

      <div className="bg-white rounded-xl border border-stone-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-stone-800">#{gadai.gadaiID} &mdash; {gadai.namaBarang}</h1>
              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
                {STATUS_LABELS[gadai.status] || gadai.status}
              </span>
            </div>
            <p className="text-stone-500">{gadai.kategoriBarang} &bull; Diajukan {formatDate(gadai.createdAt)}</p>
            {gadai.parentGadaiID !== null && (
              <p className="text-xs text-stone-400 mt-1">
                Perpanjangan dari{' '}
                <Link href={`/admin/gadai/${gadai.parentGadaiID}`} className="text-amber-600 hover:underline">#{gadai.parentGadaiID}</Link>
                {' '}(ke-{gadai.perpanjanganKe})
              </p>
            )}
          </div>
          <Link
            href={`/admin/customer/${gadai.customer.id}`}
            className="inline-flex items-start flex-col gap-0.5 bg-stone-50 hover:bg-stone-100 rounded-lg px-4 py-2.5 transition"
          >
            <span className="text-sm font-medium text-stone-800">{gadai.customer.nama}</span>
            <span className="text-xs text-stone-500">{gadai.customer.noHp}</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Loan info */}
          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Detail Pinjaman</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Nominal</p>
                <p className="text-sm font-semibold text-stone-800">{formatRupiah(nominal)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Jasa</p>
                <p className="text-sm font-semibold text-stone-800">{formatRupiah(fee)} ({Number(gadai.bungaPersentase)}%)</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Total Tagihan</p>
                <p className="text-sm font-semibold text-stone-800">{formatRupiah(totalTagihan)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Sudah Dibayar</p>
                <p className="text-sm font-semibold text-blue-600">{formatRupiah(totalDibayar)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Sisa Tagihan</p>
                <p className={`text-sm font-semibold ${sisaTagihan > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatRupiah(sisaTagihan)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Tanggal Kembali</p>
                <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-stone-800'}`}>{formatDate(gadai.tanggalKembali)}</p>
              </div>
            </div>
            <div className="border-t border-stone-100 pt-4">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Atribut Kelengkapan</p>
              <p className="text-sm text-stone-700">{gadai.atributTinggal}</p>
              {gadai.deskripsi && (
                <>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1 mt-3">Deskripsi</p>
                  <p className="text-sm text-stone-700">{gadai.deskripsi}</p>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {gadai.customer.fotoKtp && (
                <a href={gadai.customer.fotoKtp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                  🪪 Foto KTP
                </a>
              )}
              {gadai.fotoBarang && gadai.fotoBarang !== '-' && (
                <a href={gadai.fotoBarang} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                  📦 Foto Barang
                </a>
              )}
              {gadai.fotoPendukung && (
                <a href={gadai.fotoPendukung} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                  🛵 Foto STNK
                </a>
              )}
            </div>
          </div>

          {/* Payment history */}
          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Riwayat Pembayaran</h2>
            {gadai.payments.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-6">Belum ada pembayaran tercatat</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {gadai.payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{p.tipeBayar}</p>
                      <p className="text-xs text-stone-400">{formatDate(p.createdAt)} {p.createdBy ? `\u2022 oleh ${p.createdBy}` : ''}</p>
                      {p.catatan && <p className="text-xs text-stone-500 mt-0.5">{p.catatan}</p>}
                    </div>
                    <p className="text-sm font-semibold text-green-600">{formatRupiah(Number(p.jumlahBayar))}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddPayment} className="border-t border-stone-100 mt-4 pt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Jumlah bayar (Rp)"
                min="1"
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                required
              />
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Catatan (opsional)"
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={savingPayment}
                className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-900 disabled:opacity-50 transition"
              >
                {savingPayment ? 'Menyimpan...' : 'Catat Bayar'}
              </button>
            </form>
          </div>
        </div>

        {/* Status panel */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Ubah Status</h2>
            <select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm mb-3"
            >
              {Object.keys(STATUS_LABELS).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={savingStatus || statusValue === gadai.status}
              className="w-full px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
            >
              {savingStatus ? 'Menyimpan...' : 'Simpan Status'}
            </button>
            {actionMessage && <p className="text-xs text-stone-500 mt-3">{actionMessage}</p>}
          </div>

          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 mb-3">Kontak Customer</h2>
            <a
              href={`https://wa.me/${gadai.customer.noHp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Chat WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
