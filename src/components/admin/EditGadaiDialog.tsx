'use client'

import { useEffect, useState } from 'react'

export interface GadaiEditTarget {
  gadaiID: number
  nama: string
  namaBarang: string
  kategoriBarang: string
  nominalPinjam: number
  bungaPersentase: number
  tanggalPinjam: string
  tanggalKembali: string
  deskripsi: string | null
  atributTinggal: string
  nomorPolisi: string | null
}

interface EditGadaiDialogProps {
  target: GadaiEditTarget | null
  loading?: boolean
  errorMessage?: string
  onSubmit: (payload: Record<string, unknown>) => void
  onCancel: () => void
}

const KATEGORI_BARANG = ['Mobil', 'Motor', 'Elektronik', 'HP', 'Laptop', 'Perhiasan', 'Lainnya']

function formatRupiah(nilai: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(nilai)
}

function toInputDate(iso: string): string {
  if (!iso) return ''
  const tanggal = new Date(iso)
  if (Number.isNaN(tanggal.getTime())) return ''
  // Pakai en-CA supaya hasilnya format YYYY-MM-DD (tanggal lokal WIB).
  return tanggal.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
}

export default function EditGadaiDialog({
  target,
  loading = false,
  errorMessage,
  onSubmit,
  onCancel
}: Readonly<EditGadaiDialogProps>) {
  const [kategoriBarang, setKategoriBarang] = useState('')
  const [namaBarang, setNamaBarang] = useState('')
  const [nominal, setNominal] = useState('')
  const [bunga, setBunga] = useState('')
  const [tanggalPinjam, setTanggalPinjam] = useState('')
  const [tanggalKembali, setTanggalKembali] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [atributTinggal, setAtributTinggal] = useState('')
  const [nomorPolisi, setNomorPolisi] = useState('')

  useEffect(() => {
    if (!target) return
    setKategoriBarang(target.kategoriBarang)
    setNamaBarang(target.namaBarang)
    setNominal(String(target.nominalPinjam))
    setBunga(String(target.bungaPersentase))
    setTanggalPinjam(toInputDate(target.tanggalPinjam))
    setTanggalKembali(toInputDate(target.tanggalKembali))
    setDeskripsi(target.deskripsi || '')
    setAtributTinggal(target.atributTinggal || '')
    setNomorPolisi(target.nomorPolisi || '')
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

  const nominalNum = Number(nominal) || 0
  const bungaNum = Number(bunga) || 0
  const jasa = Math.round((nominalNum * bungaNum) / 100)
  const perluNopol = kategoriBarang === 'Motor' || kategoriBarang === 'Mobil'
  const tanggalTidakValid =
    tanggalPinjam !== '' && tanggalKembali !== '' && tanggalKembali < tanggalPinjam

  const inputClass = 'w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm'
  const labelClass = 'block text-xs font-medium text-stone-500 mb-1'

  const kirim = () => {
    onSubmit({
      kategoriBarang,
      namaBarang,
      nominalPinjam: nominalNum,
      bungaPersentase: bungaNum,
      tanggalPinjam,
      tanggalKembali,
      deskripsi,
      atributTinggal,
      nomorPolisi: perluNopol ? nomorPolisi : null
    })
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
        aria-labelledby="edit-gadai-title"
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-modal-in max-h-[90vh] overflow-y-auto"
      >
        <h2 id="edit-gadai-title" className="text-lg font-semibold text-stone-800">Ubah Pengajuan</h2>
        <p className="text-sm text-stone-500 mb-4">
          #{target.gadaiID} &bull; {target.nama}
        </p>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-gadai-kategori" className={labelClass}>Kategori barang</label>
              <select
                id="edit-gadai-kategori"
                value={kategoriBarang}
                onChange={(e) => setKategoriBarang(e.target.value)}
                className={inputClass}
              >
                {KATEGORI_BARANG.map((k) => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-gadai-nama" className={labelClass}>Nama barang</label>
              <input
                id="edit-gadai-nama"
                type="text"
                value={namaBarang}
                onChange={(e) => setNamaBarang(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-gadai-nominal" className={labelClass}>Nominal pinjaman</label>
              <input
                id="edit-gadai-nominal"
                type="number"
                min="0"
                step="1000"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="edit-gadai-bunga" className={labelClass}>Bunga (%)</label>
              <input
                id="edit-gadai-bunga"
                type="number"
                min="0"
                step="0.01"
                value={bunga}
                onChange={(e) => setBunga(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <p className="text-xs text-stone-500">
            Jasa = <span className="font-semibold text-stone-700">{formatRupiah(jasa)}</span>
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-gadai-pinjam" className={labelClass}>Tanggal pinjam</label>
              <input
                id="edit-gadai-pinjam"
                type="date"
                value={tanggalPinjam}
                onChange={(e) => setTanggalPinjam(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="edit-gadai-kembali" className={labelClass}>Tanggal kembali</label>
              <input
                id="edit-gadai-kembali"
                type="date"
                value={tanggalKembali}
                onChange={(e) => setTanggalKembali(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {tanggalTidakValid && (
            <p className="text-xs text-red-500">Tanggal kembali tidak boleh lebih awal dari tanggal pinjam.</p>
          )}

          <div>
            <label htmlFor="edit-gadai-atribut" className={labelClass}>Kelengkapan barang</label>
            <input
              id="edit-gadai-atribut"
              type="text"
              value={atributTinggal}
              onChange={(e) => setAtributTinggal(e.target.value)}
              placeholder="Contoh: dus, charger, BPKB asli"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="edit-gadai-deskripsi" className={labelClass}>Deskripsi</label>
            <textarea
              id="edit-gadai-deskripsi"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              rows={2}
              className={inputClass}
            />
          </div>

          {perluNopol && (
            <div>
              <label htmlFor="edit-gadai-polisi" className={labelClass}>Nomor polisi</label>
              <input
                id="edit-gadai-polisi"
                type="text"
                value={nomorPolisi}
                onChange={(e) => setNomorPolisi(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
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
            disabled={loading || tanggalTidakValid || nominalNum <= 0}
            className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  )
}
