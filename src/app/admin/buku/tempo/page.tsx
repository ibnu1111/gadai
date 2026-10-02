'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
    tanggalCair: string
    customer: { id: number; nama: string; noHp: string }
  }
  nominalAkhir?: string | null
}

interface GadaiRingkas {
  gadaiID: number
  namaBarang: string
  nominalPinjam: string
  status: string
  createdAt: string
  customer: { nama: string; noHp: string }
}

type Tab = 'AKTIF' | 'PENGAJUAN' | 'LUNAS' | 'SELESAI_LAIN'

const STATUS_PENGAJUAN_AKTIF = new Set(['PENDING', 'MENUNGGU_REKENING', 'MENUNGGU_TRANSFER', 'MENUNGGU_VERIFIKASI_TRANSFER'])

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
    return <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-red-100 text-red-700">Telat {selisih} hari</span>
  }
  if (selisih === 0) {
    return <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-amber-100 text-amber-700">Jatuh tempo hari ini</span>
  }
  return <span className="inline-flex px-2.5 py-1 text-xs font-medium rounded-full bg-stone-100 text-stone-600">{-selisih} hari lagi</span>
}

function BarisPinjaman({
  item,
  hariIni,
  aksiAktif,
  onAksi
}: Readonly<{ item: SiklusTempo; hariIni: string; aksiAktif: boolean; onAksi?: (aksi: JenisAksi) => void }>) {
  const router = useRouter()
  const { pinjaman } = item
  const pokok = Number(pinjaman.pokok)
  const bunga = Number(item.nominalBunga)
  const detailHref = `/admin/pinjaman/${pinjaman.id}`

  const pergiKeDetail = () => {
    router.push(detailHref)
  }

  return (
    <tr
      onClick={pergiKeDetail}
      className="hover:bg-stone-50 transition cursor-pointer"
    >
      <td className="px-4 py-3">
        <span className="text-sm font-medium text-stone-800 group-hover:text-amber-600 transition">
          {pinjaman.customer.nama}
        </span>
        <p className="text-xs text-stone-400">{pinjaman.customer.noHp}</p>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <p className="text-sm text-stone-700">{pinjaman.namaBarang || 'Tanpa jaminan'}</p>
        <p className="text-xs text-stone-400">
          siklus ke-{item.siklusKe}
          {pinjaman.gadaiID ? ` · #${pinjaman.gadaiID}` : ''}
        </p>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-stone-700">{formatRupiah(pokok)}</td>
      <td className="px-4 py-3 text-sm text-stone-600 hidden md:table-cell">{formatRupiah(bunga)}</td>
      <td className="px-4 py-3 hidden md:table-cell text-sm text-stone-500">{formatTanggal(pinjaman.tanggalCair)}</td>
      <td className="px-4 py-3">
        {aksiAktif ? (
          <LabelTempo jatuhTempo={tanggalWib(item.tanggalJatuhTempo)} hariIni={hariIni} />
        ) : (
          <span className="text-sm font-semibold text-stone-700">
            {item.nominalAkhir ? formatRupiah(Number(item.nominalAkhir)) : '-'}
          </span>
        )}
        <p className="text-xs text-stone-400 mt-1">{formatTanggal(item.tanggalJatuhTempo)}</p>
      </td>
      <td className="px-4 py-3">
        {aksiAktif && onAksi ? (
          <div className="flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => onAksi('PERPANJANG')} className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 transition">
              Perpanjang
            </button>
            <button type="button" onClick={() => onAksi('LUNAS')} className="px-2.5 py-1 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition">
              Lunas
            </button>
            {pinjaman.jenis === 'GADAI' && (
              <button type="button" onClick={() => onAksi('LELANG')} className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-200 transition">
                Lelang
              </button>
            )}
            <button type="button" onClick={() => onAksi('WRITEOFF')} className="px-2.5 py-1 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition">
              Hapus buku
            </button>
          </div>
        ) : (
          <Link
            href={detailHref}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition"
          >
            Detail
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        )}
      </td>
    </tr>
  )
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-stone-100 text-stone-600',
  MENUNGGU_REKENING: 'bg-blue-50 text-blue-600',
  MENUNGGU_TRANSFER: 'bg-blue-50 text-blue-600',
  MENUNGGU_VERIFIKASI_TRANSFER: 'bg-purple-50 text-purple-600',
  DITOLAK: 'bg-red-50 text-red-600'
}

function BarisPengajuan({ item }: Readonly<{ item: GadaiRingkas }>) {
  const router = useRouter()
  const detailHref = `/admin/gadai/${item.gadaiID}`

  return (
    <tr
      onClick={() => router.push(detailHref)}
      className="hover:bg-stone-50 transition cursor-pointer"
    >
      <td className="px-4 py-3 text-sm font-medium text-stone-600">#{item.gadaiID}</td>
      <td className="px-4 py-3 text-sm font-medium text-stone-800">{item.customer.nama}</td>
      <td className="px-4 py-3 hidden sm:table-cell text-sm text-stone-700">{item.namaBarang}</td>
      <td className="px-4 py-3 text-sm font-semibold text-stone-700">{formatRupiah(Number(item.nominalPinjam))}</td>
      <td className="px-4 py-3 hidden md:table-cell text-sm text-stone-500">{formatTanggal(item.createdAt)}</td>
      <td className="px-4 py-3">
        <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${STATUS_BADGE[item.status] ?? 'bg-stone-100 text-stone-600'}`}>
          {item.status.replaceAll('_', ' ')}
        </span>
      </td>
      <td className="px-4 py-3">
        <Link
          href={detailHref}
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium transition"
        >
          Detail
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </td>
    </tr>
  )
}

const TABS: { key: Tab; label: string }[] = [
  { key: 'AKTIF', label: 'Aktif & Jatuh Tempo' },
  { key: 'PENGAJUAN', label: 'Pengajuan Baru' },
  { key: 'LUNAS', label: 'Lunas' },
  { key: 'SELESAI_LAIN', label: 'Lelang / Hapus Buku' }
]

export default function AdminDaftarPinjamanPage() {
  const [tab, setTab] = useState<Tab>('AKTIF')
  const [items, setItems] = useState<SiklusTempo[]>([])
  const [pengajuan, setPengajuan] = useState<GadaiRingkas[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hari, setHari] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [target, setTarget] = useState<AksiTarget | null>(null)
  const [memproses, setMemproses] = useState(false)
  const [aksiError, setAksiError] = useState('')

  const hariIni = tanggalWib(new Date().toISOString())

  useEffect(() => {
    setPage(1)
  }, [tab, hari, search])

  const muat = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const token = localStorage.getItem('adminToken')
      const headers = { Authorization: `Bearer ${token}` }

      if (tab === 'PENGAJUAN') {
        const res = await fetch(`/api/gadai?limit=100&search=${encodeURIComponent(search)}`, { headers })
        if (handleUnauthorized(res.status, '/admin/buku/tempo')) return
        const data = await res.json()
        if (data.success) {
          const daftar: GadaiRingkas[] = data.data.filter((g: GadaiRingkas) => STATUS_PENGAJUAN_AKTIF.has(g.status))
          setPengajuan(daftar)
          setTotalPages(1)
        } else {
          setError(data.message || 'Gagal memuat data pengajuan')
        }
        return
      }

      let statusParam: string = 'LELANG'
      if (tab === 'AKTIF') statusParam = 'AKTIF'
      else if (tab === 'LUNAS') statusParam = 'LUNAS'
      const hariQuery = tab === 'AKTIF' && hari !== null ? `&hari=${hari}` : ''
      const res = await fetch(`/api/pinjaman?status=${statusParam}&page=${page}&limit=20&search=${encodeURIComponent(search)}${hariQuery}`, { headers })
      if (handleUnauthorized(res.status, '/admin/buku/tempo')) return
      const data = await res.json()
      if (data.success) {
        setItems(data.data)
        setTotalPages(data.pagination?.totalPages ?? 1)
      } else {
        setError(data.message || 'Gagal memuat data pinjaman')
      }
    } catch {
      setError('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [tab, hari, search, page])

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
  const jumlahTelat = tab === 'AKTIF' ? items.filter((item) => selisihHari(tanggalWib(item.tanggalJatuhTempo), hariIni) > 0).length : 0

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">Daftar Pinjaman</h1>
        <p className="text-sm text-stone-500">Semua pinjaman, pengajuan, dan jatuh temponya dalam satu tempat.</p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-stone-800 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tab === 'AKTIF' && (
          <div className="flex gap-2">
            {[
              { nilai: 0, label: 'Hari ini & telat' },
              { nilai: 3, label: '3 hari' },
              { nilai: 7, label: '7 hari' },
              { nilai: null, label: 'Semua' }
            ].map((opsi) => (
              <button
                key={opsi.label}
                type="button"
                onClick={() => setHari(opsi.nilai)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  hari === opsi.nilai ? 'bg-amber-600 text-white' : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {opsi.label}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama customer..."
          className="ml-auto px-3 py-1.5 rounded-lg text-sm border border-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {tab === 'AKTIF' && (
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
      )}

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

      <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                {tab === 'PENGAJUAN' ? (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden sm:table-cell">Barang</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Nominal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Aksi</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden sm:table-cell">Barang</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Pokok</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Bunga</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide hidden md:table-cell">Tanggal Pengajuan</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">{tab === 'AKTIF' ? 'Jatuh Tempo' : 'Nominal Akhir'}</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Aksi</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {(() => {
                const kolom = 7
                if (loading) {
                  return (
                    <tr>
                      <td colSpan={kolom} className="px-4 py-8 text-center text-stone-400">
                        <div className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Memuat data...
                        </div>
                      </td>
                    </tr>
                  )
                }

                if (tab === 'PENGAJUAN') {
                  if (pengajuan.length === 0) {
                    return (
                      <tr>
                        <td colSpan={kolom} className="px-4 py-12 text-center text-stone-400">Tidak ada pengajuan baru yang menunggu diproses.</td>
                      </tr>
                    )
                  }
                  return pengajuan.map((item) => <BarisPengajuan key={item.gadaiID} item={item} />)
                }

                if (items.length === 0) {
                  return (
                    <tr>
                      <td colSpan={kolom} className="px-4 py-12 text-center text-stone-400">Tidak ada data.</td>
                    </tr>
                  )
                }
                return items.map((item) => (
                  <BarisPinjaman
                    key={item.id}
                    item={item}
                    hariIni={hariIni}
                    aksiAktif={tab === 'AKTIF'}
                    onAksi={tab === 'AKTIF' ? (aksi) => bukaAksi(item, aksi) : undefined}
                  />
                ))
              })()}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-3 py-1.5 rounded-lg text-sm border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-50"
          >
            &larr; Sebelumnya
          </button>
          <span className="text-sm text-stone-500">Halaman {page} / {totalPages}</span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-3 py-1.5 rounded-lg text-sm border border-stone-200 text-stone-600 disabled:opacity-40 hover:bg-stone-50"
          >
            Berikutnya &rarr;
          </button>
        </div>
      )}

      <AksiPinjamanDialog target={target} loading={memproses} errorMessage={aksiError} onSubmit={kirimAksi} onCancel={() => setTarget(null)} />
    </div>
  )
}
