'use client'

import { useEffect, useState } from 'react'

export interface PinjamanEditTarget {
  pinjamanId: number
  nama: string
  namaBarang: string | null
  pokok: number
  nominalBunga: number
  tanggalJatuhTempo: string
  catatan: string | null
  /** Status pinjaman: AKTIF (bisa diedit penuh) atau sudah final. */
  status: string
}

interface EditPinjamanDialogProps {
  target: PinjamanEditTarget | null
  loading?: boolean
  errorMessage?: string
  onSubmit: (payload: Record<string, unknown>) => void
  onCancel: () => void
}

const STATUS_FINAL: Record<string, string> = {
  LUNAS: 'lunas',
  LELANG: 'lelang',
  WRITEOFF: 'dihapus buku'
}

function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(nilai)
}

function toInputDate(iso: string): string {
  if (!iso) return ''
  const tanggal = new Date(iso)
  if (Number.isNaN(tanggal.getTime())) return ''
  return tanggal.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
}

export default function EditPinjamanDialog({
  target,
  loading = false,
  errorMessage,
  onSubmit,
  onCancel
}: Readonly<EditPinjamanDialogProps>) {
  const [namaBarang, setNamaBarang] = useState('')
  const [pokok, setPokok] = useState('')
  const [nominalBunga, setNominalBunga] = useState('')
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState('')
  const [catatan, setCatatan] = useState('')

  useEffect(() => {
    if (!target) return
    setNamaBarang(target.namaBarang || '')
    setPokok(String(target.pokok))
    setNominalBunga(String(target.nominalBunga))
    setTanggalJatuhTempo(toInputDate(target.tanggalJatuhTempo))
    setCatatan(target.catatan || '')
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

  const sudahFinal = Boolean(STATUS_FINAL[target.status])
  const pokokNum = Number(pokok) || 0
  const bungaNum = Number(nominalBunga) || 0

  const inputClass = 'w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm'
  const labelClass = 'block text-xs font-medium text-stone-500 mb-1'

  const kirim = () => {
    const payload: Record<string, unknown> = { namaBarang, catatan }
    // Field financial hanya dikirim kalau pinjaman masih bisa diubah.
    if (!sudahFinal) {
      payload.pokok = pokokNum
      payload.nominalBunga = bungaNum
      payload.tanggalJatuhTempo = tanggalJatuhTempo
    }
    onSubmit(payload)
  }

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
        aria-labelledby="edit-pinjaman-title"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-modal-in max-h-[90vh] overflow-y-auto"
      >
        <h2 id="edit-pinjaman-title" className="text-lg font-semibold text-stone-800">Ubah Pinjaman</h2>
        <p className="text-sm text-stone-500 mb-4">
          {target.nama}
          {target.namaBarang ? ` · ${target.namaBarang}` : ' · Dapin'}
        </p>

        {sudahFinal && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-4">
            Pinjaman ini sudah {STATUS_FINAL[target.status]}, jadi nominal dan jatuh tempo tidak bisa diubah.
          </p>
        )}

        <div className="space-y-3">
          <div>
            <label htmlFor="edit-pinjaman-nama" className={labelClass}>Nama barang</label>
            <input
              id="edit-pinjaman-nama"
              type="text"
              value={namaBarang}
              onChange={(e) => setNamaBarang(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-pinjaman-pokok" className={labelClass}>Pokok</label>
              <input
                id="edit-pinjaman-pokok"
                type="number"
                min="0"
                step="1000"
                value={pokok}
                onChange={(e) => setPokok(e.target.value)}
                disabled={sudahFinal}
                className={`${inputClass} disabled:opacity-50`}
              />
            </div>
            <div>
              <label htmlFor="edit-pinjaman-bunga" className={labelClass}>Bunga siklus ini</label>
              <input
                id="edit-pinjaman-bunga"
                type="number"
                min="0"
                step="1000"
                value={nominalBunga}
                onChange={(e) => setNominalBunga(e.target.value)}
                disabled={sudahFinal}
                className={`${inputClass} disabled:opacity-50`}
              />
            </div>
          </div>

          {!sudahFinal && (
            <>
              <div>
                <label htmlFor="edit-pinjaman-tempo" className={labelClass}>Jatuh tempo</label>
                <input
                  id="edit-pinjaman-tempo"
                  type="date"
                  value={tanggalJatuhTempo}
                  onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                  className={inputClass}
                />
              </div>
              <p className="text-xs text-stone-500">
                Total kembali = <span className="font-semibold text-stone-700">{formatRupiah(pokokNum + bungaNum)}</span>
              </p>
            </>
          )}

          <div>
            <label htmlFor="edit-pinjaman-catatan" className={labelClass}>Catatan</label>
            <input
              id="edit-pinjaman-catatan"
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
            disabled={loading || (!sudahFinal && pokokNum <= 0)}
            className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
