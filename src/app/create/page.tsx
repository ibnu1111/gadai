'use client'

import { useState } from 'react'
import Link from 'next/link'

const KATEGORI_BARANG = [
  { label: 'Elektronik', value: 'Elektronik' },
  { label: 'Perhiasan', value: 'Perhiasan' },
  { label: 'Kendaraan', value: 'Kendaraan' },
  { label: 'Gadget', value: 'Gadget' },
  { label: 'Peralatan Rumah Tangga', value: 'Peralatan Rumah Tangga' },
  { label: 'Lainnya', value: 'Lainnya' }
]

const JANGKA_WAKTU = [
  { label: '2 Minggu (10%)', value: '2minggu' },
  { label: '1 Bulan (20%)', value: '1bulan' }
]

export default function CreatePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    kategoriBarang: '',
    namaBarang: '',
    deskripsi: '',
    atributTinggal: '',
    jangkaWaktu: '',
    nominalPinjam: ''
  })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const calculateFee = () => {
    const nominal = parseFloat(formData.nominalPinjam) || 0
    const bunga = formData.jangkaWaktu === '2minggu' ? 10 : formData.jangkaWaktu === '1bulan' ? 20 : 0
    return (nominal * bunga) / 100
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/public/gadai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await res.json()

      if (data.success) {
        setResult(data)
      } else {
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch {
      setError('Terjadi kesalahan saat mengirim pengajuan')
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

  if (result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pengajuan Berhasil!</h2>
          <p className="text-gray-600 mb-6">{result.message}</p>

          <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Detail Pengajuan:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">ID Pengajuan:</span>
                <span className="font-medium">#{result.data.gadaiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nominal:</span>
                <span className="font-medium">{formatRupiah(result.data.nominalPengajuan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Bunga ({result.data.bungaPersentase}%):</span>
                <span className="font-medium">{formatRupiah(result.data.fee)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total:</span>
                <span className="font-medium text-purple-600">
                  {formatRupiah(result.data.nominalPengajuan + result.data.fee)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href={`/track`}
              className="block w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-medium"
            >
              Lacak Pengajuan
            </Link>
            <button
              onClick={() => setResult(null)}
              className="block w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 font-medium"
            >
              Pengajuan Baru
            </button>
          </div>

          {result.waNotificationLink && (
            <a
              href={result.waNotificationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-4 text-green-600 hover:text-green-700 text-sm"
            >
              Kirim via WhatsApp
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Pengajuan Gadai</h1>
          <p className="text-purple-100">Ajukan gadai barang Anda dengan mudah</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-2xl p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nomor HP (WhatsApp)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Barang</label>
              <select
                value={formData.kategoriBarang}
                onChange={(e) => setFormData({ ...formData, kategoriBarang: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Pilih kategori</option>
                {KATEGORI_BARANG.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang</label>
              <input
                type="text"
                value={formData.namaBarang}
                onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Contoh: iPhone 14 Pro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Barang</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Deskripsi kondisi barang..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nominal Pinjaman (Rp)</label>
              <input
                type="number"
                value={formData.nominalPinjam}
                onChange={(e) => setFormData({ ...formData, nominalPinjam: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Min. Rp 100.000"
                min="100000"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Minimum Rp 100.000</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jangka Waktu</label>
              <div className="space-y-2">
                {JANGKA_WAKTU.map((jw) => (
                  <label
                    key={jw.value}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${
                      formData.jangkaWaktu === jw.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-300 hover:border-purple-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jangkaWaktu"
                      value={jw.value}
                      checked={formData.jangkaWaktu === jw.value}
                      onChange={(e) => setFormData({ ...formData, jangkaWaktu: e.target.value })}
                      className="mr-3"
                      required
                    />
                    <span className="font-medium">{jw.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.nominalPinjam && formData.jangkaWaktu && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h3 className="font-semibold text-purple-800 mb-2">Ringkasan:</h3>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Nominal:</span>
                    <span className="font-medium">{formatRupiah(parseFloat(formData.nominalPinjam))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bunga:</span>
                    <span className="font-medium">{formatRupiah(calculateFee())}</span>
                  </div>
                  <div className="flex justify-between text-purple-700 font-semibold">
                    <span>Total:</span>
                    <span>{formatRupiah(parseFloat(formData.nominalPinjam) + calculateFee())}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 font-medium text-lg"
            >
              {loading ? 'Mengirim...' : 'Ajukan Gadai'}
            </button>
          </div>
        </form>

        <div className="text-center mt-6">
          <Link href="/track" className="text-white hover:underline">
            Lacak pengajuan gadai
          </Link>
        </div>
      </div>
    </div>
  )
}
