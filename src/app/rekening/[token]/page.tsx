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

export default function RekeningPage() {
  const params = useParams()
  const token = params.token as string

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [data, setData] = useState<any>(null)
  const [noRekening, setNoRekening] = useState('')
  const [namaBank, setNamaBank] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`/api/public/rekening/${token}`)
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          setData(res.data)
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

    if (!noRekening || !namaBank) {
      setError('Nomor rekening dan nama bank wajib diisi')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/public/rekening/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noRekening, namaBank })
      })
      const result = await res.json()
      if (!result.success) {
        throw new Error(result.message || 'Gagal menyimpan rekening')
      }

      // Notify finance via WhatsApp that the rekening is ready for disbursement
      const waMessage = encodeURIComponent(
        `📋 *Rekening Pencairan Gadai Terisi*\n\n` +
        `Gadai #${data.gadaiID} • ${data.customerNama} • ${data.namaBarang}\n` +
        `💰 Nominal: ${formatRupiah(Number(data.nominalPinjam))}\n` +
        `🏦 Rekening: ${namaBank} - ${noRekening}\n\n` +
        `Mohon diproses pencairan dananya.`
      )
      const financeWaNumber = '62819676216' // 0819-676-216
      window.location.href = `https://wa.me/${financeWaNumber}?text=${waMessage}`
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
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
          <h1 className="text-lg font-bold text-gray-800 mb-2">Rekening berhasil disimpan</h1>
          <p className="text-sm text-gray-500">Dana pinjaman akan segera diproses ke rekening Anda. Terima kasih.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-6 max-w-md w-full border border-gray-100">
        <h1 className="text-lg font-bold text-gray-800 mb-1">Isi Rekening Pencairan Dana</h1>
        <p className="text-sm text-gray-500 mb-4">Gadai #{data.gadaiID} &bull; {data.customerNama} &bull; {data.namaBarang}</p>

        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm space-y-1">
          <p className="text-gray-500">Nominal pinjaman</p>
          <p className="font-semibold text-gray-800">{formatRupiah(Number(data.nominalPinjam))}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rek-nama-bank" className="block text-sm font-medium text-gray-700 mb-1.5">Nama Bank</label>
            <input
              id="rek-nama-bank"
              type="text"
              value={namaBank}
              onChange={(e) => setNamaBank(e.target.value)}
              placeholder="Contoh: BCA, BRI, Mandiri"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label htmlFor="rek-no-rekening" className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Rekening</label>
            <input
              id="rek-no-rekening"
              type="text"
              value={noRekening}
              onChange={(e) => setNoRekening(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition disabled:opacity-50"
          >
            {submitting ? 'Menyimpan...' : 'Simpan Rekening'}
          </button>
        </form>
      </div>
    </div>
  )
}
