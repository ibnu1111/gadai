'use client'

interface SwitchJenisProps {
  jenis: 'GADAI' | 'DAPIN'
  disabled?: boolean
  onToggle: (jenisBaru: 'GADAI' | 'DAPIN') => void
}

/**
 * Switch gadai/dapin per baris list. Kiri = gadai, kanan = pinjaman biasa
 * (dapin). Menyalakan gadai memindahkan data pinjaman ke tabel Gadai;
 * Sebaliknya mengembalikan datanya ke Pinjaman.
 */
export default function SwitchJenis({ jenis, disabled, onToggle }: Readonly<SwitchJenisProps>) {
  const gadaiAktif = jenis === 'GADAI'

  return (
    <div
      className="inline-flex items-center rounded-full bg-stone-100 p-0.5"
      title="Geser untuk memindahkan data antara gadai dan pinjaman biasa"
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle('GADAI')}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition disabled:opacity-40 ${
          gadaiAktif ? 'bg-amber-600 text-white shadow-sm' : 'text-stone-500 hover:text-stone-700'
        }`}
      >
        Gadai
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onToggle('DAPIN')}
        className={`px-2.5 py-1 rounded-full text-xs font-medium transition disabled:opacity-40 ${
          gadaiAktif ? 'text-stone-500 hover:text-stone-700' : 'bg-stone-600 text-white shadow-sm'
        }`}
      >
        Pinjaman
      </button>
    </div>
  )
}
