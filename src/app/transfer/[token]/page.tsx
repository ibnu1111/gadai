'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'

function formatRupiah(num: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num)
}

export default function TransferUploadPage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [nominal, setNominal] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/public/transfer/${token}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res.data)
          setNominal(res.data.nominalPinjam?.toString() || '')
        } else {
          setError(res.message || 'Link tidak valid')
        }
      })
      .catch(() => setError('Gagal memuat data'))
      .finally(() => setLoading(false))
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!file) {
      setError('Bukti transfer wajib diunggah')
      return
    }
    if (!nominal) {
      setError('Nominal wajib diisi')
      return
    }

    setUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const uploadRes = await fetch('/api/upload', { method: 'POST', body })
      const uploadData = await uploadRes.json()
      if (!uploadRes.ok || !uploadData.success) {
        throw new Error(uploadData.message || 'Gagal mengunggah bukti transfer')
      }
      setUploading(false)

      setSubmitting(true)
      const res = await fetch(`/api/public/transfer/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nominal, bukti: uploadData.url })
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.message || 'Gagal mengirim bukti transfer')
      }
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setUploading(false)
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Memuat...</div>
  }

  if (error && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border border-gray-100">
          <p className="text-3xl mb-3">✅</p>
          <h1 className="text-lg font-bold text-gray-800 mb-2">Bukti transfer terkirim</h1>
          <p className="text-sm text-gray-500">Menunggu verifikasi admin. Terima kasih.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full border border-gray-100">
        <h1 className="text-lg font-bold text-gray-800 mb-1">Upload Bukti Transfer Pencairan</h1>
        <p className="text-sm text-gray-500 mb-4">Gadai #{data.gadaiID} &bull; {data.customerNama} &bull; {data.namaBarang}</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-1">
          <p className="text-gray-500">Rekening tujuan</p>
          <p className="font-semibold text-gray-800">{data.namaBank || '-'} &mdash; {data.noRekening || '-'}</p>
          <p className="text-gray-500 mt-2">Nominal pinjaman</p>
          <p className="font-semibold text-gray-800">{formatRupiah(Number(data.nominalPinjam))}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nominal Ditransfer (Rp)</label>
            <input
              type="number"
              value={nominal}
              onChange={(e) => setNominal(e.target.value)}
              min="1"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bukti Transfer</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 file:text-sm file:font-medium"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={uploading || submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
          >
            {uploading ? 'Mengunggah...' : submitting ? 'Mengirim...' : 'Kirim Bukti Transfer'}
          </button>
        </form>
      </div>
    </div>
  )
}
