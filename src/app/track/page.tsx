'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

function isAdminLoggedIn(): boolean {
  return Boolean(localStorage.getItem('adminToken') && localStorage.getItem('adminData'))
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

function formatRupiahValue(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num)
}

function PengajuanActionForm({ item, phone, onDone }: { item: any; phone: string; onDone: () => void }) {
  const [open, setOpen] = useState(false)
  const [aksi, setAksi] = useState<'AMBIL' | 'PERPANJANG'>('AMBIL')
  const [nominal, setNominal] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  if (item.pendingAksi) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100 text-xs bg-amber-50 rounded-lg p-3 text-amber-800">
        Permintaan {item.pendingAksi === 'AMBIL' ? 'Ambil Barang' : 'Perpanjang'} sebesar {formatRupiahValue(item.pendingAksiNominal)} sedang menunggu konfirmasi admin.
      </div>
    )
  }

  if (!item.isDue) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage('')
    if (!nominal || !file) {
      setMessage('Nominal dan bukti transfer wajib diisi')
      return
    }
    setSubmitting(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Gagal mengunggah bukti transfer')
      }

      const res = await fetch('/api/public/track/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, gadaiId: item.gadaiId, aksi, nominal, bukti: uploadData.url })
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.message || 'Gagal mengirim permintaan')
      }
      setOpen(false)
      onDone()
    } catch (err: any) {
      setMessage(err.message || 'Terjadi kesalahan')
    } finally {
      setSubmitting(false)
    }
  }

  if (!open) {
    return (
      <div className="mt-3 pt-3 border-t border-gray-100">
        <button
          onClick={() => setOpen(true)}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition"
        >
          Sudah jatuh tempo &mdash; Ambil / Perpanjang
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 pt-3 border-t border-gray-100 space-y-2">
      <select
        value={aksi}
        onChange={(e) => setAksi(e.target.value as 'AMBIL' | 'PERPANJANG')}
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
      >
        <option value="AMBIL">Ambil Barang (lunasi sisa tagihan)</option>
        <option value="PERPANJANG">Perpanjang (bayar bunga)</option>
      </select>
      <input
        type="number"
        value={nominal}
        onChange={(e) => setNominal(e.target.value)}
        placeholder="Nominal ditransfer (Rp)"
        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
      />
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/heic"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="w-full text-xs"
      />
      {message && <p className="text-xs text-red-500">{message}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50"
        >
          {submitting ? 'Mengirim...' : 'Kirim Bukti Transfer'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg"
        >
          Batal
        </button>
      </div>
    </form>
  )
}

export default function TrackPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  // Auto-submit if phone is in URL params
  useEffect(() => {
    const params = new URLSearchParams(globalThis.location.search)
    const phoneParam = params.get('phone')
    if (phoneParam) {
      // Convert 62xx back to 08xx for display
      const formattedPhone = phoneParam.startsWith('62') ? '0' + phoneParam.substring(2) : phoneParam
      setPhone(formattedPhone)
      handleSearch(formattedPhone)
    }
  }, [])

  const handleSearch = async (searchPhone?: string) => {
    const phoneToSearch = searchPhone || phone
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/public/track?phone=${encodeURIComponent(phoneToSearch)}`)
      const data = await res.json()

      if (data.success) {
        // Admin already logged in on this browser -> skip the public view and go
        // straight to the pengajuan detail page in the admin panel (most recent
        // pengajuan for that phone number).
        if (isAdminLoggedIn() && data.pengajuan?.length > 0) {
          router.replace(`/admin/gadai/${data.pengajuan[0].gadaiId}`)
          return
        }
        setResult(data)
      } else {
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch {
      setError('Terjadi kesalahan saat melacak')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
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
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header - Same as Home */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <img src="/logo-gadai.png" alt="Gadai Jogja" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <span className="text-xs text-gray-400">gadaijogja.com</span>
              </div>
            </Link>
            <Link href="/" className="text-gray-500 hover:text-blue-600 text-sm font-medium">
              Beranda
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative max-w-2xl mx-auto px-4 py-8 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2">Lacak Pengajuan</h1>
          <p className="text-blue-100 text-sm">Masukkan nomor HP untuk melihat status pengajuan</p>
        </div>
        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-8">
            <path d="M0,30 C320,70 640,0 960,40 C1280,80 1360,30 1440,50 L1440,80 L0,80 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 -mt-4">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-100 mb-6">
          <div className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
              placeholder="Masukkan nomor HP (08xxxxxxxxxx)"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-medium transition shadow-lg shadow-blue-200"
            >
              {loading ? '...' : 'Cari'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
        </form>

        {result && (
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {result.customer ? (
              <>
                <div className="p-6 border-b border-gray-100 bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-white">
                        {result.customer.customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">{result.customer.customerName}</h2>
                      <p className="text-gray-500 text-sm">{result.customer.phone}</p>
                    </div>
                  </div>
                </div>

                {result.pengajuan.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-gray-500 mb-4">Belum ada pengajuan gadai</p>
                    <Link href="/create" className="text-blue-600 hover:text-blue-700 font-medium">
                      Ajukan gadai baru
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {result.pengajuan.map((item: any) => {
                      const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.PENDING
                      return (
                        <div key={item.gadaiId} className="p-5 hover:bg-gray-50 transition">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-gray-900">{item.namaBarang}</h3>
                              <p className="text-sm text-gray-500">{item.kategoriBarang}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                              {item.statusLabel}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <p className="text-gray-400 text-xs">Nominal</p>
                              <p className="font-medium text-gray-700">{formatRupiah(item.nominalPinjam)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Jasa ({item.bungaPersentase}%)</p>
                              <p className="font-medium text-gray-700">{formatRupiah(item.fee)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Total Bayar</p>
                              <p className="font-bold text-blue-600">{formatRupiah(item.nominalPengambilan)}</p>
                            </div>
                            <div>
                              <p className="text-gray-400 text-xs">Jatuh Tempo</p>
                              <p className="font-medium text-gray-700">{formatDate(item.tanggalKembali)}</p>
                            </div>
                          </div>

                          {item.perpanjanganKe > 0 && (
                            <p className="text-xs text-purple-600 font-medium mb-2">
                              {item.perpanjanganKe}x perpanjangan
                            </p>
                          )}

                          {parseFloat(item.totalPembayaran) > 0 && (
                            <div className="pt-3 border-t border-gray-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">Sudah dibayar:</span>
                                <span className="font-semibold text-green-600">{formatRupiah(parseFloat(item.totalPembayaran))}</span>
                              </div>
                            </div>
                          )}

                          <PengajuanActionForm item={item} phone={phone} onDone={() => handleSearch(phone)} />
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">Nomor HP tidak ditemukan</p>
                <Link href="/create" className="text-blue-600 hover:text-blue-700 font-medium">
                  Ajukan gadai baru
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/create" className="text-blue-600 hover:text-blue-700 font-medium">
            &larr; Kembali ke form pengajuan
          </Link>
        </div>
      </main>
    </div>
  )
}
