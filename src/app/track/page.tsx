'use client'

import { useState } from 'react'
import Link from 'next/link'

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  AKTIF: 'bg-green-100 text-green-800',
  LUNAS: 'bg-blue-100 text-blue-800',
  JATUH_TEMPO: 'bg-orange-100 text-orange-800',
  OVERDUE: 'bg-red-100 text-red-800',
  DITOLAK: 'bg-gray-100 text-gray-800',
  DIPERPANJANG: 'bg-purple-100 text-purple-800'
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
      month: 'short',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Lacak Pengajuan</h1>
          <p className="text-purple-100">Cek status pengajuan gadai Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Masukkan nomor HP (08xxxxxxxxxx)"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium"
            >
              {loading ? '...' : 'Cari'}
            </button>
          </div>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </form>

        {result && (
          <div className="bg-white rounded-xl shadow-2xl p-6">
            {result.customer ? (
              <>
                <div className="mb-6 pb-4 border-b">
                  <h2 className="text-xl font-bold text-gray-800">{result.customer.customerName}</h2>
                  <p className="text-gray-500">{result.customer.phone}</p>
                </div>

                {result.pengajuan.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Tidak ada pengajuan gadai</p>
                ) : (
                  <div className="space-y-4">
                    {result.pengajuan.map((item: any) => (
                      <div key={item.gadaiId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-800">{item.namaBarang}</h3>
                            <p className="text-sm text-gray-500">{item.kategoriBarang}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[item.status]}`}>
                            {item.statusLabel}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-gray-500">Nominal Pinjaman</p>
                            <p className="font-medium">{formatRupiah(item.nominalPinjam)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Bunga ({item.bungaPersentase}%)</p>
                            <p className="font-medium">{formatRupiah(item.fee)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Total Bayar</p>
                            <p className="font-bold text-purple-600">{formatRupiah(item.nominalPengambilan)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Jatuh Tempo</p>
                            <p className="font-medium">{formatDate(item.tanggalKembali)}</p>
                          </div>
                        </div>

                        {item.perpanjanganKe > 0 && (
                          <p className="text-sm text-purple-600 mt-2">
                            Diperpanjang {item.perpanjanganKe}x
                          </p>
                        )}

                        {parseFloat(item.totalPembayaran) > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm text-gray-500">Sudah dibayar:</p>
                            <p className="font-medium text-green-600">{formatRupiah(parseFloat(item.totalPembayaran))}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nomor HP tidak ditemukan</p>
                <Link href="/create" className="text-purple-600 hover:underline">
                  Ajukan gadai baru
                </Link>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-6">
          <Link href="/create" className="text-white hover:underline">
            Pengajuan Gadai Baru
          </Link>
        </div>
      </div>
    </div>
  )
}
