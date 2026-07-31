'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { handleUnauthorized } from '@/lib/adminSession'

type TipeRekap = 'harian' | 'modal' | 'closing'

const TAB: ReadonlyArray<{ tipe: TipeRekap; label: string; keterangan: string }> = [
  { tipe: 'harian', label: 'Rekap Harian', keterangan: 'Daftar pinjaman berjalan, dikelompokkan per tanggal cair.' },
  { tipe: 'modal', label: 'Rincian Modal', keterangan: 'Sumber dana tiap gadai yang masih berjalan.' },
  { tipe: 'closing', label: 'Closing Bulanan', keterangan: 'Modal terputar, rekap sumber dana, dan keuntungan bulan terpilih.' }
]

function bulanIniWib(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }).slice(0, 7)
}

export default function AdminRekapPage() {
  const [tipe, setTipe] = useState<TipeRekap>('harian')
  const [bulan, setBulan] = useState(bulanIniWib)
  const [teks, setTeks] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tersalin, setTersalin] = useState(false)

  const muat = useCallback(async () => {
    setLoading(true)
    setError('')
    setTersalin(false)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/rekap?tipe=${tipe}&bulan=${bulan}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (handleUnauthorized(res.status, '/admin/buku/rekap')) return
      const data = await res.json()
      if (data.success) {
        setTeks(data.data.teks)
      } else {
        setError(data.message || 'Gagal menyusun rekap')
      }
    } catch {
      setError('Gagal menyusun rekap')
    } finally {
      setLoading(false)
    }
  }, [tipe, bulan])

  useEffect(() => {
    muat()
  }, [muat])

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(teks)
      setTersalin(true)
      setTimeout(() => setTersalin(false), 2000)
    } catch {
      setError('Browser menolak akses clipboard, silakan blok teksnya lalu salin manual.')
    }
  }

  const aktif = TAB.find((t) => t.tipe === tipe)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Rekap WhatsApp</h1>
          <p className="text-sm text-stone-500">Teks siap tempel ke grup, formatnya mengikuti catatan yang sudah berjalan.</p>
        </div>
        <Link href="/admin/buku/tempo" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
          Ke jatuh tempo &rarr;
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {TAB.map((opsi) => (
          <button
            key={opsi.tipe}
            type="button"
            onClick={() => setTipe(opsi.tipe)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              tipe === opsi.tipe ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {opsi.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-stone-100 p-4 space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-xs text-stone-500 max-w-md">{aktif?.keterangan}</p>
          <div className="flex items-end gap-2">
            {tipe === 'closing' && (
              <div>
                <label htmlFor="bulan-rekap" className="block text-xs text-stone-500 mb-1">Bulan</label>
                <input
                  id="bulan-rekap"
                  type="month"
                  value={bulan}
                  onChange={(e) => setBulan(e.target.value)}
                  className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
                />
              </div>
            )}
            <button
              type="button"
              onClick={muat}
              disabled={loading}
              className="px-3 py-1.5 bg-white border border-stone-200 text-stone-600 rounded-lg text-xs font-medium hover:bg-stone-50 transition disabled:opacity-50"
            >
              Muat ulang
            </button>
            <button
              type="button"
              onClick={salin}
              disabled={loading || !teks}
              className="px-4 py-1.5 bg-amber-500 text-white rounded-lg text-xs font-medium hover:bg-amber-600 transition disabled:opacity-50"
            >
              {tersalin ? 'Tersalin' : 'Salin'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        {(() => {
          if (loading) {
            return <div className="p-8 text-center text-stone-400 text-sm">Menyusun rekap...</div>
          }
          if (!teks) {
            return (
              <div className="p-8 text-center text-stone-400 text-sm">
                Belum ada data untuk rekap ini.
              </div>
            )
          }
          return (
            <pre className="bg-stone-50 border border-stone-100 rounded-lg p-4 text-sm text-stone-700 whitespace-pre-wrap break-words max-h-[60vh] overflow-y-auto font-sans">
              {teks}
            </pre>
          )
        })()}
      </div>
    </div>
  )
}
