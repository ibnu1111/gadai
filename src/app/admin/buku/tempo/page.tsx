'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { handleUnauthorized } from '@/lib/adminSession'
import AksiPinjamanDialog, { AksiTarget, JenisAksi } from '@/components/admin/AksiPinjamanDialog'

interface SiklusTempo {
  id: number
  siklusKe: number
  tanggalMulai: string
  tanggalJatuhTempo: string
  nominalBunga: string
  pinjaman: {
    id: number
    jenis: string
    namaBarang: string | null
    pokok: string
    gadaiID: number | null
    customer: { id: number; nama: string; noHp: string }
  }
}

function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(nilai)
}

function formatTanggal(iso: string): string {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta'
  })
}

function tanggalWib(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
}

function selisihHari(dari: string, sampai: string): number {
  return Math.round((Date.parse(`${sampai}T00:00:00Z`) - Date.parse(`${dari}T00:00:00Z`)) / 86400000)
}

function LabelTempo({ jatuhTempo, hariIni }: Readonly<{ jatuhTempo: string; hariIni: string }>) {
  const selisih = selisihHari(jatuhTempo, hariIni)
  if (selisih > 0) {
    return <span className="text-xs font-semibold text-red-600">Telat {selisih} hari</span>
  }
  if (selisih === 0) {
    return <span className="text-xs font-semibold text-amber-600">Jatuh tempo hari ini</span>
  }
  return <span className="text-xs text-stone-500">{-selisih} hari lagi</span>
}

function KartuTempo({
  item,
  hariIni,
  onAksi
}: Readonly<{ item: SiklusTempo; hariIni: string; onAksi: (aksi: JenisAksi) => void }>) {
  const { pinjaman } = item
  const pokok = Number(pinjaman.pokok)
  const bunga = Number(item.nominalBunga)
  const telat = selisihHari(tanggalWib(item.tanggalJatuhTempo), hariIni) > 0

  return (
    <div className={`bg-white rounded-xl border p-4 ${telat ? 'border-red-200' : 'border-stone-100'}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-stone-800 truncate">{pinjaman.customer.nama}</p>
          <p className="text-xs text-stone-500 truncate">
            {pinjaman.namaBarang || 'Tanpa jaminan'} · siklus ke-{item.siklusKe}
            {pinjaman.gadaiID ? ` · #${pinjaman.gadaiID}` : ''}
          </p>
        </div>
        <div className="text-right shrink-0">
          <LabelTempo jatuhTempo={tanggalWib(item.tanggalJatuhTempo)} hariIni={hariIni} />
          <p className="text-xs text-stone-400">{formatTanggal(item.tanggalJatuhTempo)}</p>
        </div>
      </div>

      <div className="flex gap-4 text-sm mb-3">
        <span className="text-stone-500">Pokok <span className="font-medium text-stone-800">{formatRupiah(pokok)}</span></span>
        <span className="text-stone-500">Bunga <span className="font-medium text-stone-800">{formatRupiah(bunga)}</span></span>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onAksi('PERPANJANG')}
          className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition"
        >
          Perpanjang
        </button>
        <button
          type="button"
          onClick={() => onAksi('LUNAS')}
          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition"
        >
          Lunas / Diambil
        </button>
        {pinjaman.jenis === 'GADAI' && (
          <button
            type="button"
            onClick={() => onAksi('LELANG')}
            className="px-3 py-1.5 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-200 transition"
          >
            Lelang
          </button>
        )}
        <button
          type="button"
          onClick={() => onAksi('WRITEOFF')}
          className="px-3 py-1.5 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition"
        >
          Hapus buku
        </button>
      </div>
    </div>
  )
}

export default function AdminJatuhTempoPage() {
  const [items, setItems] = useState<SiklusTempo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hari, setHari] = useState(0)
  const [target, setTarget] = useState<AksiTarget | null>(null)
  const [memproses, setMemproses] = useState(false)
  const [aksiError, setAksiError] = useState('')

  const hariIni = tanggalWib(new Date().toISOString())

  const muat = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/pinjaman/tempo?hari=${hari}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (handleUnauthorized(res.status, '/admin/buku/tempo')) return
      const data = await res.json()
      if (data.success) {
        setItems(data.data)
      } else {
        setError(data.message || 'Gagal memuat data jatuh tempo')
      }
    } catch {
      setError('Gagal memuat data jatuh tempo')
    } finally {
      setLoading(false)
    }
  }, [hari])

  useEffect(() => {
    muat()
  }, [muat])

  const kirimAksi = async (payload: Record<string, unknown>) => {
    if (!target) return
    setMemproses(true)
    setAksiError('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/pinjaman/${target.pinjamanId}/aksi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      if (handleUnauthorized(res.status, '/admin/buku/tempo')) return
      const data = await res.json()
      if (data.success) {
        setTarget(null)
        muat()
      } else {
        setAksiError(data.message || 'Gagal memproses aksi')
      }
    } catch {
      setAksiError('Gagal memproses aksi')
    } finally {
      setMemproses(false)
    }
  }

  const bukaAksi = (item: SiklusTempo, aksi: JenisAksi) => {
    setAksiError('')
    setTarget({
      pinjamanId: item.pinjaman.id,
      aksi,
      nama: item.pinjaman.customer.nama,
      namaBarang: item.pinjaman.namaBarang,
      pokok: Number(item.pinjaman.pokok),
      nominalBunga: Number(item.nominalBunga),
      siklusKe: item.siklusKe
    })
  }

  const totalPokok = items.reduce((sum, item) => sum + Number(item.pinjaman.pokok), 0)
  const totalBunga = items.reduce((sum, item) => sum + Number(item.nominalBunga), 0)
  const jumlahTelat = items.filter((item) => selisihHari(tanggalWib(item.tanggalJatuhTempo), hariIni) > 0).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-stone-800">Jatuh Tempo</h1>
          <p className="text-sm text-stone-500">Pinjaman berjalan yang perlu ditindak hari ini.</p>
        </div>
        <Link href="/admin/gadai" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
          Ke daftar pengajuan &rarr;
        </Link>
      </div>

      <div className="flex gap-2">
        {[
          { nilai: 0, label: 'Hari ini & telat' },
          { nilai: 3, label: '3 hari ke depan' },
          { nilai: 7, label: '7 hari ke depan' }
        ].map((opsi) => (
          <button
            key={opsi.nilai}
            type="button"
            onClick={() => setHari(opsi.nilai)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
              hari === opsi.nilai ? 'bg-stone-800 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            {opsi.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Perlu ditindak', nilai: String(items.length) },
          { label: 'Sudah telat', nilai: String(jumlahTelat) },
          { label: 'Total pokok', nilai: formatRupiah(totalPokok) },
          { label: 'Total bunga', nilai: formatRupiah(totalBunga) }
        ].map((kartu) => (
          <div key={kartu.label} className="bg-white rounded-xl border border-stone-100 p-4">
            <p className="text-xs text-stone-500 mb-1">{kartu.label}</p>
            <p className="text-lg font-semibold text-stone-800">{kartu.nilai}</p>
          </div>
        ))}
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}

      {(() => {
        if (loading) {
          return <div className="bg-white rounded-xl border border-stone-100 p-8 text-center text-stone-400">Memuat data...</div>
        }
        if (items.length === 0) {
          return <div className="bg-white rounded-xl border border-stone-100 p-8 text-center text-stone-400">Tidak ada pinjaman yang jatuh tempo.</div>
        }
        return (
          <div className="space-y-3">
            {items.map((item) => (
              <KartuTempo key={item.id} item={item} hariIni={hariIni} onAksi={(aksi) => bukaAksi(item, aksi)} />
            ))}
          </div>
        )
      })()}

      <AksiPinjamanDialog
        target={target}
        loading={memproses}
        errorMessage={aksiError}
        onSubmit={kirimAksi}
        onCancel={() => setTarget(null)}
      />
    </div>
  )
}
