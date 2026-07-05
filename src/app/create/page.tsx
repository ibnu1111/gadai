'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const KATEGORI_BARANG = [
  { label: 'HP / Smartphone', value: 'HP' },
  { label: 'Laptop / Komputer', value: 'Laptop' },
  { label: 'Motor', value: 'Motor' },
  { label: 'Mobil', value: 'Mobil' }
]

const JANGKA_WAKTU = [
  { label: '2 Minggu (10%)', value: '2minggu' },
  { label: '1 Bulan (20%)', value: '1bulan' }
]

function formatRupiah(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num)
}

function CreateForm() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    kategoriBarang: '',
    namaBarang: '',
    deskripsi: '',
    atributTinggal: '',
    jangkaWaktu: '',
    nominalPinjam: '',
    fotoKtp: '',
    fotoStnk: ''
  })
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [uploadingKtp, setUploadingKtp] = useState(false)
  const [uploadingStnk, setUploadingStnk] = useState(false)

  const needsStnk = formData.kategoriBarang === 'Motor' || formData.kategoriBarang === 'Mobil'

  const uploadPhoto = async (file: File): Promise<string> => {
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body })
    const data = await res.json()
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Gagal mengunggah foto')
    }
    return data.url as string
  }

  const handleKtpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploadingKtp(true)
    try {
      const url = await uploadPhoto(file)
      setFormData(prev => ({ ...prev, fotoKtp: url }))
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah foto KTP')
    } finally {
      setUploadingKtp(false)
    }
  }

  const handleStnkChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setUploadingStnk(true)
    try {
      const url = await uploadPhoto(file)
      setFormData(prev => ({ ...prev, fotoStnk: url }))
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah foto STNK')
    } finally {
      setUploadingStnk(false)
    }
  }

  useEffect(() => {
    const name = searchParams.get('name') || ''
    const phone = searchParams.get('phone') || ''
    const category = searchParams.get('category') || ''
    const amount = searchParams.get('amount') || ''
    setFormData(prev => ({
      ...prev,
      customerName: name,
      phone: phone,
      kategoriBarang: category,
      nominalPinjam: amount
    }))
  }, [searchParams])

  const calculateFee = (): number => {
    const nominal = parseFloat(formData.nominalPinjam) || 0
    const bunga = formData.jangkaWaktu === '2minggu' ? 10 : formData.jangkaWaktu === '1bulan' ? 20 : 0
    return (nominal * bunga) / 100
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/public/gadai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fotoPendukung: formData.fotoStnk || undefined
        })
      })

      const data = await res.json()

      if (data.success) {
        // Format phone number for tracking link
        const normalizedPhone = formData.phone.replace(/^0/, '62')
        const trackLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/track?phone=${normalizedPhone}`

        // Create WhatsApp message with submission details and tracking link
        const bungaLabel = formData.jangkaWaktu === '2minggu' ? '2 Minggu (10%)' : '1 Bulan (20%)'
        const totalBayar = parseFloat(formData.nominalPinjam) + calculateFee()

        const waMessage = encodeURIComponent(
          `📋 *Pengajuan Gadai Baru*\n\n` +
          `👤 Nama: ${formData.customerName}\n` +
          `📱 No. HP: ${formData.phone}\n` +
          `📦 Barang: ${formData.namaBarang}\n` +
          `📂 Kategori: ${formData.kategoriBarang}\n` +
          `💰 Nominal: Rp ${parseFloat(formData.nominalPinjam).toLocaleString('id-ID')}\n` +
          `📊 Tempo: ${bungaLabel}\n` +
          `💵 Total Bayar: Rp ${totalBayar.toLocaleString('id-ID')}\n` +
          (formData.fotoKtp ? `🪪 Foto KTP: ${formData.fotoKtp}\n` : '') +
          (formData.fotoStnk ? `🛵 Foto STNK: ${formData.fotoStnk}\n` : '') +
          `\n🔗 Lacak pengajuan: ${trackLink}`
        )

        // Redirect to WhatsApp (shop owner's number - notifies about the new pengajuan)
        const waNumber = '6282299748978' // 0822-9974-8978
        window.location.href = `https://wa.me/${waNumber}?text=${waMessage}`
      } else {
        setError(data.message || 'Terjadi kesalahan')
      }
    } catch {
      setError('Terjadi kesalahan saat mengirim pengajuan')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      customerName: '',
      phone: '',
      kategoriBarang: '',
      namaBarang: '',
      deskripsi: '',
      atributTinggal: '',
      jangkaWaktu: '',
      nominalPinjam: '',
      fotoKtp: '',
      fotoStnk: ''
    })
    setResult(null)
  }

  const totalBayar = Number.parseFloat(formData.nominalPinjam || '0') + calculateFee()
  let submitButtonLabel = 'Ajukan Gadai'
  if (loading) {
    submitButtonLabel = 'Mengirim...'
  } else if (uploadingKtp || uploadingStnk) {
    submitButtonLabel = 'Menunggu unggahan foto...'
  }

  if (result) {
    return (
      <div className="min-h-screen bg-white">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex justify-between items-center h-16">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Gadai Jogja</span>
                  <span className="hidden sm:block text-xs text-gray-400">gadaijogja.com</span>
                </div>
              </Link>
              <Link href="/" className="text-gray-500 hover:text-blue-600 text-sm font-medium">Kembali</Link>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pengajuan Terkirim!</h2>
            <p className="text-gray-500 mb-6">{result.message}</p>

            <div className="bg-gray-50 rounded-2xl p-5 text-left mb-6 border border-gray-100">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm uppercase tracking-wide">Detail Pengajuan</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">ID:</span>
                  <span className="font-bold text-gray-900">#{result.data.gadaiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Nominal:</span>
                  <span className="font-medium text-gray-700">{formatRupiah(result.data.nominalPengajuan)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Bunga ({result.data.bungaPersentase}%):</span>
                  <span className="font-medium text-gray-700">{formatRupiah(result.data.fee)}</span>
                </div>
                <div className="pt-2 border-t border-gray-200 flex justify-between">
                  <span className="text-gray-700 font-medium">Total Bayar:</span>
                  <span className="font-bold text-blue-600">{formatRupiah(result.data.nominalPengajuan + result.data.fee)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link href="/track" className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 rounded-xl font-bold transition shadow-lg shadow-blue-200 text-center">
                Lacak Pengajuan
              </Link>
              <button onClick={handleReset} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3.5 rounded-xl font-medium transition">
                Pengajuan Baru
              </button>
              {result.waNotificationLink && (
                <a href={result.waNotificationLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-green-600 hover:text-green-700 text-sm font-medium mt-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  Kirim via WhatsApp
                </a>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Gadai Jogja</span>
                <span className="hidden sm:block text-xs text-gray-400">gadaijogja.com</span>
              </div>
            </Link>
            <Link href="/" className="text-gray-500 hover:text-blue-600 text-sm font-medium">Kembali</Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 py-10 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">Form Pengajuan Gadai</h1>
          <p className="text-blue-100 text-sm md:text-base">Lengkapi data di bawah untuk mengirim pengajuan</p>
        </div>
        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-10 md:h-12">
            <path d="M0,30 C320,70 640,0 960,40 C1280,80 1360,30 1440,50 L1440,80 L0,80 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Form Section */}
      <main className="max-w-xl mx-auto px-4 py-10 -mt-4">
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="08xxxxxxxxxx"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto KTP <span className="text-gray-400 font-normal">(opsional)</span></label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={handleKtpChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 file:text-sm file:font-medium"
              />
              <p className="text-xs text-gray-500 mt-1.5">KTP asli wajib dibawa saat mengantar barang jaminan.</p>
              {uploadingKtp && <p className="text-xs text-blue-500 mt-1.5">Mengunggah foto KTP...</p>}
              {formData.fotoKtp && !uploadingKtp && (
                <p className="text-xs text-green-600 mt-1.5">✓ Foto KTP berhasil diunggah</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Barang</label>
              <select
                value={formData.kategoriBarang}
                onChange={(e) => setFormData({ ...formData, kategoriBarang: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-600"
                required
              >
                <option value="">Pilih kategori</option>
                {KATEGORI_BARANG.map((k) => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
            </div>

            {needsStnk && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto STNK <span className="text-gray-400 font-normal">(opsional)</span></label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  onChange={handleStnkChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 file:text-sm file:font-medium"
                />
                <p className="text-xs text-gray-500 mt-1.5">Jika belum ada, STNK bisa difotokan admin saat mengantar barang jaminan.</p>
                {uploadingStnk && <p className="text-xs text-blue-500 mt-1.5">Mengunggah foto STNK...</p>}
                {formData.fotoStnk && !uploadingStnk && (
                  <p className="text-xs text-green-600 mt-1.5">✓ Foto STNK berhasil diunggah</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Barang</label>
              <input
                type="text"
                value={formData.namaBarang}
                onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Contoh: iPhone 14 Pro 256GB"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Deskripsi</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Kondisi, spesifikasi, kelengkapan..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nominal Pinjaman (Rp)</label>
              <input
                type="number"
                value={formData.nominalPinjam}
                onChange={(e) => setFormData({ ...formData, nominalPinjam: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                placeholder="Min. Rp 100.000"
                min="100000"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Jangka Waktu</label>
              <div className="grid grid-cols-2 gap-3">
                {JANGKA_WAKTU.map((jw) => (
                  <label
                    key={jw.value}
                    className={`flex items-center justify-center p-4 border-2 rounded-xl cursor-pointer transition ${
                      formData.jangkaWaktu === jw.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50'
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
                    <span className="font-medium text-gray-700">{jw.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {formData.nominalPinjam && formData.jangkaWaktu && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <h3 className="font-semibold text-blue-800 mb-3 text-sm uppercase tracking-wide">Ringkasan</h3>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-blue-700">Nominal:</span>
                    <span className="font-semibold text-gray-900">{formatRupiah(parseFloat(formData.nominalPinjam))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-700">Bunga:</span>
                    <span className="font-semibold text-gray-900">{formatRupiah(calculateFee())}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 flex justify-between">
                    <span className="text-blue-800 font-semibold">Total Bayar:</span>
                    <span className="font-bold text-blue-600">{formatRupiah(totalBayar)}</span>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || uploadingKtp || uploadingStnk}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:opacity-50 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-200 mt-2"
            >
              {submitButtonLabel}
            </button>
          </form>
        </div>
      </main>

      {/* Footer CTA */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-xl mx-auto px-4 text-center">
          <p className="text-gray-500 text-sm mb-3">Butuh bantuan langsung?</p>
          <a
            href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20konsultasi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-green-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
            Hubungi via WhatsApp
          </a>
        </div>
      </section>
    </div>
  )
}

export default function CreatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    }>
      <CreateForm />
    </Suspense>
  )
}
