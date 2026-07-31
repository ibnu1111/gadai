/**
 * Singkatan bulan mengikuti kebiasaan penulisan di grup WhatsApp (hasil hitung
 * frekuensi dari export chat), bukan singkatan baku - campur Inggris/Indonesia.
 */
const BULAN_SINGKAT = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AGUS', 'SEPT', 'OCT', 'NOV', 'DES']

const BULAN_PANJANG = [
  'JANUARI', 'FEBRUARI', 'MARET', 'APRIL', 'MEI', 'JUNI',
  'JULI', 'AGUSTUS', 'SEPTEMBER', 'OKTOBER', 'NOVEMBER', 'DESEMBER'
]

export function formatAngka(nilai: number | string): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Number(nilai))
}

/** "YYYY-MM-DD" menurut zona WIB. */
export function isoWib(tanggal: Date): string {
  return tanggal.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
}

/** Contoh: "26 JUN" */
export function tanggalRekap(tanggal: Date): string {
  const [, bulan, hari] = isoWib(tanggal).split('-').map(Number)
  return `${hari} ${BULAN_SINGKAT[bulan - 1]}`
}

export function bulanSingkat(bulanKe: number): string {
  return BULAN_SINGKAT[bulanKe - 1]
}

export function bulanPanjang(bulanKe: number): string {
  return BULAN_PANJANG[bulanKe - 1]
}

/**
 * Nomor baris rekap. Nomor lama dipertahankan apa adanya termasuk yang bolong
 * (bekas entri lunas atau pindah grup tanggal), entri baru menyambung di atas
 * nomor tertinggi supaya tidak memakai ulang nomor yang sudah pernah dipakai.
 */
export function nomorBaris(nomorTersimpan: (number | null)[]): number[] {
  const terpakai = nomorTersimpan.filter((n): n is number => n !== null)
  let berikutnya = (terpakai.length > 0 ? Math.max(...terpakai) : 0) + 1
  return nomorTersimpan.map((n) => n ?? berikutnya++)
}
