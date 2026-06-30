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
 * Update status based on due date
 */
export function updateStatusBasedOnDueDate(currentStatus: string, tanggalKembali: Date): string {
  if (currentStatus !== 'AKTIF') return currentStatus

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dueDate = new Date(tanggalKembali)
  dueDate.setHours(0, 0, 0, 0)

  if (today > dueDate) return 'OVERDUE'
  if (today.getTime() === dueDate.getTime()) return 'JATUH_TEMPO'
  return currentStatus
}

/**
 * Get status label for display
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'PENDING': 'Menunggu',
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
