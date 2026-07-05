/**
 * Normalize Indonesian phone number to format 62xxx
 */
export function normalizePhoneNumber(phone: string | null): string | null {
  if (!phone) return null

  let cleaned = phone.replace(/\D/g, '')

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1)
  }

  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned
  }

  return cleaned
}

/**
 * Map frontend category to database category
 */
export function mapKategoriBarang(kategori: string): string {
  const mapping: Record<string, string> = {
    'Kendaraan': 'Motor',
    'Mobil': 'Mobil',
    'Gadget': 'HP',
    'HP': 'HP',
    'Elektronik': 'Elektronik',
    'Laptop': 'Laptop',
    'Perhiasan': 'Perhiasan',
    'Peralatan Rumah Tangga': 'Lainnya',
    'Lainnya': 'Lainnya'
  }
  return mapping[kategori] || kategori
}

/**
 * Map database category to frontend label
 */
export function getKategoriLabel(kategori: string): string {
  const reverseMapping: Record<string, string> = {
    'Motor': 'Kendaraan',
    'Mobil': 'Mobil',
    'HP': 'Gadget',
    'Elektronik': 'Elektronik',
    'Laptop': 'Laptop',
    'Perhiasan': 'Perhiasan',
    'Lainnya': 'Lainnya'
  }
  return reverseMapping[kategori] || kategori
}

/**
 * Calculate return date based on period
 */
export function calculateTanggalKembali(tanggalPinjam: Date, jangkaWaktu: string): Date {
  const date = new Date(tanggalPinjam)
  if (jangkaWaktu === '2minggu') {
    date.setDate(date.getDate() + 14)
  } else if (jangkaWaktu === '1bulan') {
    date.setMonth(date.getMonth() + 1)
  }
  return date
}

/**
 * Add one tenor (2 minggu if bunga 10%, 1 bulan otherwise) to a date. Used to
 * compute the next due date on disbursement confirmation / extension.
 */
export function addTenor(date: Date, bungaPersentase: number): Date {
  const result = new Date(date)
  if (bungaPersentase <= 10) {
    result.setDate(result.getDate() + 14)
  } else {
    result.setMonth(result.getMonth() + 1)
  }
  return result
}

/**
 * Update status based on due date
 */
export function updateStatusBasedOnDueDate(currentStatus: string, tanggalKembali: Date): string {
  if (currentStatus !== 'AKTIF' && currentStatus !== 'JATUH_TEMPO') return currentStatus

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(tanggalKembali)
  dueDate.setHours(0, 0, 0, 0)

  if (today > dueDate) return 'OVERDUE'
  if (today.getTime() === dueDate.getTime()) return 'JATUH_TEMPO'
  return currentStatus
}

/**
 * Whether a gadai has reached (or passed) its due date and should show the
 * "Ambil" / "Perpanjang" actions, regardless of whether the persisted status
 * has already been synced to JATUH_TEMPO/OVERDUE.
 */
export function isDueOrOverdue(status: string, tanggalKembali: Date | string): boolean {
  if (!['AKTIF', 'JATUH_TEMPO', 'OVERDUE'].includes(status)) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(tanggalKembali)
  dueDate.setHours(0, 0, 0, 0)
  return today >= dueDate
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'PENDING': 'Menunggu',
    'MENUNGGU_REKENING': 'Menunggu Rekening',
    'MENUNGGU_TRANSFER': 'Menunggu Transfer',
    'MENUNGGU_VERIFIKASI_TRANSFER': 'Menunggu Verifikasi Transfer',
    'AKTIF': 'Aktif',
    'LUNAS': 'Lunas',
    'JATUH_TEMPO': 'Jatuh Tempo',
    'OVERDUE': 'Terlambat',
    'DITOLAK': 'Ditolak',
    'DIPERPANJANG': 'Diperpanjang'
  }
  return labels[status] || status
}

/**
 * Get status color for frontend
 */
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    'PENDING': 'warning',
    'MENUNGGU_REKENING': 'warning',
    'MENUNGGU_TRANSFER': 'warning',
    'MENUNGGU_VERIFIKASI_TRANSFER': 'warning',
    'AKTIF': 'success',
    'LUNAS': 'info',
    'JATUH_TEMPO': 'warning',
    'OVERDUE': 'danger',
    'DITOLAK': 'secondary',
    'DIPERPANJANG': 'primary'
  }
  return colors[status] || 'secondary'
}

/**
 * Format currency to Indonesian Rupiah
 */
export function formatRupiah(number: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number)
}

/** Whether a kategori barang requires a nomor polisi / STNK (Motor or Mobil) */
export function isKendaraan(kategoriBarang: string): boolean {
  return kategoriBarang === 'Motor' || kategoriBarang === 'Mobil'
}

/**
 * Documents the customer is supposed to provide at/after initial submission
 * (KTP always, STNK only for vehicles). Used to show the "kelengkapan"
 * indicator to admin.
 */
export function getMissingInitialDocs(gadai: { kategoriBarang: string; fotoPendukung?: string | null }, customer: { fotoKtp?: string | null }): string[] {
  const missing: string[] = []
  if (!customer.fotoKtp) missing.push('Foto KTP')
  if (isKendaraan(gadai.kategoriBarang) && !gadai.fotoPendukung) missing.push('Foto STNK')
  return missing
}

/**
 * Fields the admin must fill in once the customer brings the item to the
 * office, before the loan can be submitted for the customer to fill in their
 * bank account details (noRekening/namaBank are no longer admin's job - see
 * getMissingCustomerRekening below).
 */
export function getMissingAdminCompletion(gadai: {
  kategoriBarang: string
  fotoCustomerBarang?: string | null
  nomorPolisi?: string | null
}): string[] {
  const missing: string[] = []
  if (!gadai.fotoCustomerBarang) missing.push('Foto Customer dengan Barang')
  if (isKendaraan(gadai.kategoriBarang) && !gadai.nomorPolisi) missing.push('Nomor Polisi')
  return missing
}

/**
 * Bank account fields the customer must self-submit (via the /rekening/[token]
 * public link) before the loan can move on to MENUNGGU_TRANSFER.
 */
export function getMissingCustomerRekening(gadai: {
  noRekening?: string | null
  namaBank?: string | null
}): string[] {
  const missing: string[] = []
  if (!gadai.noRekening) missing.push('Nomor Rekening')
  if (!gadai.namaBank) missing.push('Nama Bank')
  return missing
}

/** Nomor WA bagian keuangan yang menerima link upload bukti transfer pencairan */
export const FINANCE_WA_NUMBER = '62819676216'
