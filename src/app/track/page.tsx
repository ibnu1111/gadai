'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  AKTIF: { bg: 'bg-green-100', text: 'text-green-800' },
  LUNAS: { bg: 'bg-blue-100', text: 'text-blue-800' },
  JATUH_TEMPO: { bg: 'bg-orange-100', text: 'text-orange-800' },
  OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
  DITOLAK: { bg: 'bg-stone-100', text: 'text-stone-600' },
  DIPERPANJANG: { bg: 'bg-purple-100', text: 'text-purple-800' }
}

export default function TrackPage() {
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<any>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch(`/api/public/track?phone=${phone}`)
      const data = await res.json()

      if (data.success) {
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
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-stone-800">Gadai Jaya</span>
            </Link>
            <Link href="/" className="text-stone-500 hover:text-stone-700 text-sm">
              Beranda
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800">Lacak Pengajuan</h1>
          <p className="text-stone-500 text-sm mt-1">Masukkan nomor HP untuk melihat status pengajuan</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100 mb-6">
          <div className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
              placeholder="Masukkan nomor HP (08xxxxxxxxxx)"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-stone-800 text-white px-6 py-3 rounded-lg hover:bg-stone-900 disabled:opacity-50 font-medium transition"
            >
              {loading ? '...' : 'Cari'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}
        </form>

        {result && (
          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
            {result.customer ? (
              <>
                <div className="p-6 border-b border-stone-100 bg-stone-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-xl font-semibold text-amber-600">
                        {result.customer.customerName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-stone-800">{result.customer.customerName}</h2>
                      <p className="text-stone-500 text-sm">{result.customer.phone}</p>
                    </div>
                  </div>
                </div>

                {result.pengajuan.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-stone-500 mb-4">Belum ada pengajuan gadai</p>
                    <Link href="/create" className="text-amber-600 hover:text-amber-700 font-medium">
                      Ajukan gadai baru
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-stone-100">
                    {result.pengajuan.map((item: any) => {
                      const statusStyle = STATUS_STYLES[item.status] || STATUS_STYLES.PENDING
                      return (
                        <div key={item.gadaiId} className="p-5 hover:bg-stone-50 transition">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold text-stone-800">{item.namaBarang}</h3>
                              <p className="text-sm text-stone-500">{item.kategoriBarang}</p>
                            </div>
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                              {item.statusLabel}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                            <div>
                              <p className="text-stone-400 text-xs">Nominal</p>
                              <p className="font-medium text-stone-700">{formatRupiah(item.nominalPinjam)}</p>
                            </div>
                            <div>
                              <p className="text-stone-400 text-xs">Bunga ({item.bungaPersentase}%)</p>
                              <p className="font-medium text-stone-700">{formatRupiah(item.fee)}</p>
                            </div>
                            <div>
                              <p className="text-stone-400 text-xs">Total Bayar</p>
                              <p className="font-bold text-amber-600">{formatRupiah(item.nominalPengambilan)}</p>
                            </div>
                            <div>
                              <p className="text-stone-400 text-xs">Jatuh Tempo</p>
                              <p className="font-medium text-stone-700">{formatDate(item.tanggalKembali)}</p>
                            </div>
                          </div>

                          {item.perpanjanganKe > 0 && (
                            <p className="text-xs text-purple-600 font-medium mb-2">
                              {item.perpanjanganKe}x perpanjangan
                            </p>
                          )}

                          {parseFloat(item.totalPembayaran) > 0 && (
                            <div className="pt-3 border-t border-stone-100">
                              <div className="flex justify-between items-center">
                                <span className="text-sm text-stone-500">Sudah dibayar:</span>
                                <span className="font-semibold text-green-600">{formatRupiah(parseFloat(item.totalPembayaran))}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-stone-500 mb-4">Nomor HP tidak ditemukan</p>
                <Link href="/create" className="text-amber-600 hover:text-amber-700 font-medium">
                  Ajukan gadai baru
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/create" className="text-stone-600 hover:text-stone-800 font-medium">
            &larr; Kembali ke form pengajuan
          </Link>
        </div>
      </main>
    </div>
  )
}
