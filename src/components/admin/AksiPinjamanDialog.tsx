'use client'

import { useEffect, useState } from 'react'

export type JenisAksi = 'PERPANJANG' | 'LUNAS' | 'LELANG' | 'WRITEOFF'

export interface AksiTarget {
  pinjamanId: number
  aksi: JenisAksi
  nama: string
  namaBarang: string | null
  pokok: number
  nominalBunga: number
  siklusKe: number
}

interface AksiPinjamanDialogProps {
  target: AksiTarget | null
  loading?: boolean
  errorMessage?: string
  onSubmit: (payload: Record<string, unknown>) => void
  onCancel: () => void
}

const JUDUL: Record<JenisAksi, string> = {
  PERPANJANG: 'Perpanjang Pinjaman',
  LUNAS: 'Tandai Lunas / Diambil',
  LELANG: 'Tandai Lelang',
  WRITEOFF: 'Hapus Buku'
}

const TENOR_PILIHAN = [10, 14, 30]

function tanggalHariIni(): string {
  return new Date(Date.now() + 7 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function tambahHari(iso: string, hari: number): string {
  const dasar = new Date(`${iso}T12:00:00Z`)
  dasar.setUTCDate(dasar.getUTCDate() + hari)
  return dasar.toISOString().slice(0, 10)
}

function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(nilai)
}

export default function AksiPinjamanDialog({
  target,
  loading = false,
  errorMessage,
  onSubmit,
  onCancel
}: Readonly<AksiPinjamanDialogProps>) {
  const [tanggalBayar, setTanggalBayar] = useState(tanggalHariIni)
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState('')
  const [nominalBunga, setNominalBunga] = useState('')
  const [nominalDibayar, setNominalDibayar] = useState('')
  const [nominalAkhir, setNominalAkhir] = useState('')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    if (!target) return
    const hariIni = tanggalHariIni()
    setTanggalBayar(hariIni)
    setTanggalJatuhTempo(tambahHari(hariIni, 14))
    setNominalBunga(String(target.nominalBunga))
    setNominalDibayar(String(target.aksi === 'LUNAS' ? target.pokok + target.nominalBunga : target.nominalBunga))
    setNominalAkhir('')
    setCatatan('')
  }, [target])

  useEffect(() => {
    if (!target) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [target, loading, onCancel])

  if (!target) return null

  const { aksi } = target
  const berbahaya = aksi === 'LELANG' || aksi === 'WRITEOFF'
  const selisihHari = Math.round(
    (new Date(`${tanggalJatuhTempo}T12:00:00Z`).getTime() - new Date(`${tanggalBayar}T12:00:00Z`).getTime()) / 86400000
  )

  const kirim = () => {
    const payload: Record<string, unknown> = { aksi, tanggalBayar, catatan: catatan.trim() || undefined }
    if (aksi === 'PERPANJANG') {
      payload.tanggalJatuhTempo = tanggalJatuhTempo
      payload.nominalBunga = nominalBunga
      payload.nominalDibayar = nominalDibayar
    } else if (aksi === 'LUNAS') {
      payload.nominalDibayar = nominalDibayar
    } else {
      payload.nominalAkhir = nominalAkhir || 0
    }
    onSubmit(payload)
  }

  const inputClass = 'w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm'
  const labelClass = 'block text-xs font-medium text-stone-500 mb-1'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup dialog"
        onClick={() => !loading && onCancel()}
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm animate-overlay-in cursor-default"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="aksi-dialog-title"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-modal-in max-h-[90vh] overflow-y-auto"
      >
        <h2 id="aksi-dialog-title" className="text-lg font-semibold text-stone-800">{JUDUL[aksi]}</h2>
        <p className="text-sm text-stone-500 mb-4">
          {target.nama}
          {target.namaBarang ? ` · ${target.namaBarang}` : ' · Dapin'}
          {' · '}pokok {formatRupiah(target.pokok)} · siklus ke-{target.siklusKe}
        </p>

        <div className="space-y-3">
          <div>
            <label htmlFor="aksi-tanggal-bayar" className={labelClass}>Tanggal bayar</label>
            <input
              id="aksi-tanggal-bayar"
              type="date"
              value={tanggalBayar}
              onChange={(e) => setTanggalBayar(e.target.value)}
              className={inputClass}
            />
          </div>

          {aksi === 'PERPANJANG' && (
            <>
              <div>
                <div className={labelClass}>Tenor</div>
                <div className="flex gap-2 mb-2">
                  {TENOR_PILIHAN.map((hari) => (
                    <button
                      key={hari}
                      type="button"
                      onClick={() => setTanggalJatuhTempo(tambahHari(tanggalBayar, hari))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        selisihHari === hari
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {hari === 30 ? '1 bulan' : `${hari} hari`}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  aria-label="Jatuh tempo baru"
                  value={tanggalJatuhTempo}
                  onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="aksi-bunga-baru" className={labelClass}>Bunga siklus berikutnya</label>
                <input
                  id="aksi-bunga-baru"
                  type="number"
                  value={nominalBunga}
                  onChange={(e) => setNominalBunga(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="aksi-dibayar" className={labelClass}>Bunga yang dibayar sekarang</label>
                <input
                  id="aksi-dibayar"
                  type="number"
                  value={nominalDibayar}
                  onChange={(e) => setNominalDibayar(e.target.value)}
                  className={inputClass}
                />
              </div>
            </>
          )}

          {aksi === 'LUNAS' && (
            <div>
              <label htmlFor="aksi-pelunasan" className={labelClass}>
                Total diterima (pokok {formatRupiah(target.pokok)} + bunga {formatRupiah(target.nominalBunga)})
              </label>
              <input
                id="aksi-pelunasan"
                type="number"
                value={nominalDibayar}
                onChange={(e) => setNominalDibayar(e.target.value)}
                className={inputClass}
              />
            </div>
          )}

          {berbahaya && (
            <div>
              <label htmlFor="aksi-nominal-akhir" className={labelClass}>
                {aksi === 'LELANG' ? 'Hasil lelang' : 'Nominal yang sempat kembali'}
              </label>
              <input
                id="aksi-nominal-akhir"
                type="number"
                value={nominalAkhir}
                onChange={(e) => setNominalAkhir(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label htmlFor="aksi-catatan" className={labelClass}>Catatan (opsional)</label>
            <input
              id="aksi-catatan"
              type="text"
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {errorMessage && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mt-3">{errorMessage}</p>
        )}

        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 disabled:opacity-50 transition"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={kirim}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition ${
              berbahaya ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
            }`}
          >
            {loading ? 'Memproses...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
