'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

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

function CreateForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: searchParams.get('name') || '',
    phone: searchParams.get('phone') || '',
    kategoriBarang: searchParams.get('category') || '',
    namaBarang: '',
    deskripsi: '',
    atributTinggal: '',
    jangkaWaktu: '',
    nominalPinjam: searchParams.get('amount') || ''
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-stone-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Pengajuan Terkirim!</h2>
          <p className="text-stone-500 mb-6">{result.message}</p>

          <div className="bg-stone-50 rounded-xl p-5 text-left mb-6 border border-stone-100">
            <h3 className="font-semibold text-stone-700 mb-3 text-sm uppercase tracking-wide">Detail Pengajuan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-stone-500">ID Pengajuan:</span>
                <span className="font-semibold text-stone-800">#{result.data.gadaiId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Nominal:</span>
                <span className="font-medium text-stone-700">{formatRupiah(result.data.nominalPengajuan)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Bunga ({result.data.bungaPersentase}%):</span>
                <span className="font-medium text-stone-700">{formatRupiah(result.data.fee)}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between">
                <span className="text-stone-600 font-medium">Total Bayar:</span>
                <span className="font-bold text-amber-600">
                  {formatRupiah(result.data.nominalPengajuan + result.data.fee)}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Link
              href="/track"
              className="block w-full bg-stone-800 text-white py-3 rounded-lg hover:bg-stone-900 font-medium transition"
            >
              Lacak Pengajuan
            </Link>
            <button
              onClick={() => {
                setResult(null)
                setFormData({
                  customerName: '',
                  phone: '',
                  kategoriBarang: '',
                  namaBarang: '',
                  deskripsi: '',
                  atributTinggal: '',
                  jangkaWaktu: '',
                  nominalPinjam: ''
                })
              }}
              className="block w-full bg-stone-100 text-stone-700 py-3 rounded-lg hover:bg-stone-200 font-medium transition"
            >
              Pengajuan Baru
            </button>
          </div>

          {result.waNotificationLink && (
            <a
              href={result.waNotificationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 mt-6 text-green-600 hover:text-green-700 text-sm font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Kirim via WhatsApp
            </a>
          )}
        </div>
      </div>
    )
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
              Kembali
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800">Form Pengajuan Gadai</h1>
          <p className="text-stone-500 text-sm mt-1">Lengkapi data di bawah untuk提交 pengajuan</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 border border-stone-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nomor HP / WhatsApp</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Kategori Barang</label>
              <select
                value={formData.kategoriBarang}
                onChange={(e) => setFormData({ ...formData, kategoriBarang: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                required
              >
                <option value="">Pilih kategori</option>
                {KATEGORI_BARANG.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nama Barang</label>
              <input
                type="text"
                value={formData.namaBarang}
                onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                placeholder="Contoh: iPhone 14 Pro 256GB"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Deskripsi Barang</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                placeholder="Kondisi, spesifikasi, kelengkapan..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nominal Pinjaman (Rp)</label>
              <input
                type="number"
                value={formData.nominalPinjam}
                onChange={(e) => setFormData({ ...formData, nominalPinjam: e.target.value })}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none transition"
                placeholder="Min. Rp 100.000"
                min="100000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-3">Jangka Waktu</label>
              <div className="grid grid-cols-2 gap-3">
                {JANGKA_WAKTU.map((jw) => (
                  <label
                    key={jw.value}
                    className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.jangkaWaktu === jw.value
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-stone-200 hover:border-stone-300 bg-stone-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="jangkaWaktu"
                      value={jw.value}
                      checked={formData.jangkaWaktu === jw.value}
                      onChange={(e) => setFormData({ ...formData, jangkaWaktu: e.target.value })}
                      className="sr-only"
                      required
                    />
                    <span className="font-medium text-stone-700">{jw.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.nominalPinjam && formData.jangkaWaktu && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <h3 className="font-semibold text-amber-800 mb-3 text-sm uppercase tracking-wide">Ringkasan</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-amber-700">Nominal Pinjaman:</span>
                    <span className="font-semibold text-stone-800">{formatRupiah(parseFloat(formData.nominalPinjam))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-700">Bunga:</span>
                    <span className="font-semibold text-stone-800">{formatRupiah(calculateFee())}</span>
                  </div>
                  <div className="pt-2 border-t border-amber-200 flex justify-between">
                    <span className="text-amber-800 font-semibold">Total Bayar:</span>
                    <span className="font-bold text-amber-600 text-lg">
                      {formatRupiah(parseFloat(formData.nominalPinjam) + calculateFee())}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 text-white py-4 rounded-xl hover:bg-amber-700 disabled:opacity-50 font-semibold text-lg transition shadow-lg shadow-amber-200 mt-4"
            >
              {loading ? 'Mengirim...' : 'Ajukan Gadai'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-stone-500">Loading...</div>
      </div>
    }>
      <CreateForm />
    </Suspense>
  )
}
