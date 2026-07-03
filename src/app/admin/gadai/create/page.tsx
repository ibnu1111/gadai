'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const KATEGORI_BARANG = ['HP', 'Laptop', 'Motor', 'Mobil', 'Elektronik', 'Perhiasan', 'Lainnya']

function calculateTanggalKembali(tanggalPinjam: string, jangkaWaktu: string): string {
  const date = new Date(tanggalPinjam)
  if (jangkaWaktu === '2minggu') {
    date.setDate(date.getDate() + 14)
  } else {
    date.setMonth(date.getMonth() + 1)
  }
  return date.toISOString().slice(0, 10)
}

export default function AdminGadaiCreatePage() {
  const router = useRouter()
  const today = new Date().toISOString().slice(0, 10)

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    kategoriBarang: '',
    namaBarang: '',
    deskripsi: '',
    atributTinggal: '',
    jangkaWaktu: '2minggu',
    nominalPinjam: '',
    tanggalPinjam: today,
    fotoKtp: '',
    fotoBarang: '',
    fotoPendukung: ''
  })
  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const needsStnk = formData.kategoriBarang === 'Motor' || formData.kategoriBarang === 'Mobil'

  const uploadFile = async (field: 'fotoKtp' | 'fotoBarang' | 'fotoPendukung', file: File) => {
    setUploading((prev) => ({ ...prev, [field]: true }))
    setError('')
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.message || 'Gagal mengunggah file')
      setFormData((prev) => ({ ...prev, [field]: data.url }))
    } catch (err: any) {
      setError(err.message || 'Gagal mengunggah file')
    } finally {
      setUploading((prev) => ({ ...prev, [field]: false }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (needsStnk && !formData.fotoPendukung) {
      setError('Foto STNK wajib diunggah untuk kategori Motor/Mobil')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('adminToken')
      const tanggalKembali = calculateTanggalKembali(formData.tanggalPinjam, formData.jangkaWaktu)
      const bungaPersentase = formData.jangkaWaktu === '2minggu' ? 10 : 20

      const res = await fetch('/api/gadai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          fotoKtp: formData.fotoKtp || undefined,
          kategoriBarang: formData.kategoriBarang,
          namaBarang: formData.namaBarang,
          deskripsi: formData.deskripsi || undefined,
          atributTinggal: formData.atributTinggal || '-',
          fotoBarang: formData.fotoBarang || '-',
          fotoPendukung: formData.fotoPendukung || undefined,
          nominalPinjam: formData.nominalPinjam,
          bungaPersentase,
          tanggalPinjam: formData.tanggalPinjam,
          tanggalKembali
        })
      })

      const data = await res.json()
      if (data.success) {
        router.push(`/admin/gadai/${data.data.gadaiID}`)
      } else {
        setError(data.message || 'Gagal membuat pengajuan')
      }
    } catch {
      setError('Gagal membuat pengajuan')
    } finally {
      setLoading(false)
    }
  }

  const isUploading = Object.values(uploading).some(Boolean)

  return (
    <div>
      <Link href="/admin/gadai" className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-flex items-center gap-1">
        &larr; Kembali ke daftar pengajuan
      </Link>

      <div className="bg-white rounded-xl border border-stone-100 p-6 max-w-2xl">
        <h1 className="text-xl font-bold text-stone-800 mb-6">Tambah Gadai Manual</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nama Customer</label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">No. HP</label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Foto KTP <span className="text-stone-400 font-normal">(opsional)</span></label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={(e) => e.target.files?.[0] && uploadFile('fotoKtp', e.target.files[0])}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-700 file:text-sm"
            />
            {uploading.fotoKtp && <p className="text-xs text-amber-600 mt-1">Mengunggah...</p>}
            {formData.fotoKtp && !uploading.fotoKtp && <p className="text-xs text-green-600 mt-1">✓ Terunggah</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Kategori Barang</label>
              <select
                value={formData.kategoriBarang}
                onChange={(e) => setFormData({ ...formData, kategoriBarang: e.target.value })}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                required
              >
                <option value="">Pilih kategori</option>
                {KATEGORI_BARANG.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nama Barang</label>
              <input
                type="text"
                value={formData.namaBarang}
                onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                required
              />
            </div>
          </div>

          {needsStnk && (
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Foto STNK</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/heic"
                onChange={(e) => e.target.files?.[0] && uploadFile('fotoPendukung', e.target.files[0])}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-700 file:text-sm"
              />
              {uploading.fotoPendukung && <p className="text-xs text-amber-600 mt-1">Mengunggah...</p>}
              {formData.fotoPendukung && !uploading.fotoPendukung && <p className="text-xs text-green-600 mt-1">✓ Terunggah</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Foto Barang <span className="text-stone-400 font-normal">(opsional)</span></label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={(e) => e.target.files?.[0] && uploadFile('fotoBarang', e.target.files[0])}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-amber-100 file:text-amber-700 file:text-sm"
            />
            {uploading.fotoBarang && <p className="text-xs text-amber-600 mt-1">Mengunggah...</p>}
            {formData.fotoBarang && !uploading.fotoBarang && <p className="text-xs text-green-600 mt-1">✓ Terunggah</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Deskripsi</label>
            <textarea
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              rows={2}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">Kelengkapan Barang</label>
            <input
              type="text"
              value={formData.atributTinggal}
              onChange={(e) => setFormData({ ...formData, atributTinggal: e.target.value })}
              placeholder="Contoh: dus, charger, BPKB asli"
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Nominal Pinjaman</label>
              <input
                type="number"
                value={formData.nominalPinjam}
                onChange={(e) => setFormData({ ...formData, nominalPinjam: e.target.value })}
                min="100000"
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Jangka Waktu</label>
              <select
                value={formData.jangkaWaktu}
                onChange={(e) => setFormData({ ...formData, jangkaWaktu: e.target.value })}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              >
                <option value="2minggu">2 Minggu (10%)</option>
                <option value="1bulan">1 Bulan (20%)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">Tanggal Pinjam</label>
              <input
                type="date"
                value={formData.tanggalPinjam}
                onChange={(e) => setFormData({ ...formData, tanggalPinjam: e.target.value })}
                className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || isUploading}
            className="w-full bg-stone-800 text-white py-3 rounded-lg font-medium hover:bg-stone-900 disabled:opacity-50 transition"
          >
            {loading ? 'Menyimpan...' : 'Simpan Pengajuan'}
          </button>
        </form>
      </div>
    </div>
  )
}
