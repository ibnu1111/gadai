'use client'

import { useCallback, useEffect, useState } from 'react'
import { handleUnauthorized } from '@/lib/adminSession'

interface PengeluaranRow {
  id: number
  tanggal: string
  keterangan: string
  nominal: string
  dibuatOleh: string | null
}

function bulanIniWib(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' }).slice(0, 7)
}

function hariIniWib(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
}

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

export default function AdminPengeluaranPage() {
  const [bulan, setBulan] = useState(bulanIniWib)
  const [rows, setRows] = useState<PengeluaranRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const [tanggal, setTanggal] = useState(hariIniWib)
  const [keterangan, setKeterangan] = useState('')
  const [nominal, setNominal] = useState('')

  const muat = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/pengeluaran?bulan=${bulan}`, { headers: { Authorization: `Bearer ${token}` } })
      if (handleUnauthorized(res.status, '/admin/buku/pengeluaran')) return
      const data = await res.json()
      if (data.success) {
        setRows(data.data)
      } else {
        setError(data.message || 'Gagal memuat pengeluaran')
      }
    } catch {
      setError('Gagal memuat pengeluaran')
    } finally {
      setLoading(false)
    }
  }, [bulan])

  useEffect(() => {
    muat()
  }, [muat])

  const tambah = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/pengeluaran', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ tanggal, keterangan, nominal })
      })
      if (handleUnauthorized(res.status, '/admin/buku/pengeluaran')) return
      const data = await res.json()
      if (data.success) {
        setKeterangan('')
        setNominal('')
        await muat()
      } else {
        setError(data.message || 'Gagal menyimpan pengeluaran')
      }
    } catch {
      setError('Gagal menyimpan pengeluaran')
    } finally {
      setSaving(false)
    }
  }

  const hapus = async (id: number) => {
    if (!confirm('Hapus catatan pengeluaran ini?')) return
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/pengeluaran/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (handleUnauthorized(res.status, '/admin/buku/pengeluaran')) return
      const data = await res.json()
      if (data.success) {
        setRows((prev) => prev.filter((r) => r.id !== id))
      } else {
        setError(data.message || 'Gagal menghapus pengeluaran')
      }
    } catch {
      setError('Gagal menghapus pengeluaran')
    }
  }

  const total = rows.reduce((acc, r) => acc + Number(r.nominal), 0)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">Pengeluaran</h1>
        <p className="text-sm text-stone-500">Biaya operasional bulan berjalan, otomatis mengurangi keuntungan di Closing Bulanan.</p>
      </div>

      <form onSubmit={tambah} className="bg-white rounded-xl border border-stone-100 p-4 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="pengeluaran-tanggal" className="block text-xs text-stone-500 mb-1">Tanggal</label>
          <input
            id="pengeluaran-tanggal"
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            required
            className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <div className="flex-1 min-w-[160px]">
          <label htmlFor="pengeluaran-keterangan" className="block text-xs text-stone-500 mb-1">Keterangan</label>
          <input
            id="pengeluaran-keterangan"
            type="text"
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            placeholder="mis. Bengkel PCX"
            required
            className="w-full px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <div>
          <label htmlFor="pengeluaran-nominal" className="block text-xs text-stone-500 mb-1">Nominal</label>
          <input
            id="pengeluaran-nominal"
            type="number"
            min="1"
            step="1"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            placeholder="125000"
            required
            className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200 w-36"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition disabled:opacity-50"
        >
          {saving ? 'Menyimpan...' : 'Tambah'}
        </button>
      </form>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="bg-white rounded-xl border border-stone-100 p-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <label htmlFor="pengeluaran-bulan" className="block text-xs text-stone-500 mb-1">Bulan</label>
            <input
              id="pengeluaran-bulan"
              type="month"
              value={bulan}
              onChange={(e) => setBulan(e.target.value)}
              className="px-3 py-1.5 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-200"
            />
          </div>
          <p className="text-sm text-stone-600">
            Total bulan ini: <span className="font-semibold text-stone-800">{formatRupiah(total)}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="px-3 py-2 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Tanggal</th>
                <th className="px-3 py-2 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Keterangan</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Nominal</th>
                <th className="px-3 py-2 text-right text-xs font-semibold text-stone-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(() => {
                if (loading) {
                  return <tr><td colSpan={4} className="px-3 py-8 text-center text-stone-400">Memuat data...</td></tr>
                }
                if (rows.length === 0) {
                  return <tr><td colSpan={4} className="px-3 py-8 text-center text-stone-400">Belum ada pengeluaran bulan ini</td></tr>
                }
                return rows.map((r) => (
                  <tr key={r.id}>
                    <td className="px-3 py-2 whitespace-nowrap text-stone-600">
                      {new Date(r.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', timeZone: 'Asia/Jakarta' })}
                    </td>
                    <td className="px-3 py-2 text-stone-800">{r.keterangan}</td>
                    <td className="px-3 py-2 text-right text-stone-800">{formatRupiah(Number(r.nominal))}</td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" onClick={() => hapus(r.id)} className="text-red-600 hover:text-red-700 text-xs font-medium">
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
