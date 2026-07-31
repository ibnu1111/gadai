const WIB_OFFSET_MS = 7 * 60 * 60 * 1000

/**
 * Batas akhir hari (WIB) yang dinyatakan dalam UTC. Server berjalan di UTC
 * sementara buku besar memakai hari kalender Indonesia, jadi "jatuh tempo hari
 * ini" harus dihitung dari sisi WIB agar tidak bergeser sehari.
 */
export function akhirHariWib(selisihHari = 0): Date {
  const wib = new Date(Date.now() + WIB_OFFSET_MS)
  const akhir = Date.UTC(
    wib.getUTCFullYear(),
    wib.getUTCMonth(),
    wib.getUTCDate() + selisihHari,
    23, 59, 59, 999
  )
  return new Date(akhir - WIB_OFFSET_MS)
}

/**
 * Ubah "YYYY-MM-DD" jadi tengah hari UTC supaya tanggal kalendernya sama baik
 * dibaca sebagai UTC maupun WIB.
 */
export function parseTanggalWib(value: unknown): Date | null {
  if (typeof value !== 'string') return null
  const cocok = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!cocok) {
    const langsung = new Date(value)
    return Number.isNaN(langsung.getTime()) ? null : langsung
  }
  const [, tahun, bulan, tanggal] = cocok
  return new Date(Date.UTC(Number(tahun), Number(bulan) - 1, Number(tanggal), 12))
}

/** Tanggal hari ini menurut WIB, dinormalkan ke tengah hari UTC. */
export function hariIniWib(): Date {
  const wib = new Date(Date.now() + WIB_OFFSET_MS)
  return new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate(), 12))
}
