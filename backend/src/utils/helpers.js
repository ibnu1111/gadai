/**
 * Normalize Indonesian phone number to format 62xxx
 * Converts 08xx to 62xx
 */
function normalizePhoneNumber(phone) {
  if (!phone) return null;

  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }

  // If doesn't start with 62, add it
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }

  return cleaned;
}

/**
 * Map frontend category to database category
 */
function mapKategoriBarang(kategori) {
  const mapping = {
    'Kendaraan': 'Motor',
    'Mobil': 'Mobil',
    'Gadget': 'HP',
    'HP': 'HP',
    'Elektronik': 'Elektronik',
    'Laptop': 'Laptop',
    'Perhiasan': 'Perhiasan',
    'Peralatan Rumah Tangga': 'Lainnya',
    'Lainnya': 'Lainnya'
  };
  return mapping[kategori] || kategori;
}

/**
 * Map database category to frontend label
 */
function getKategoriLabel(kategori) {
  const reverseMapping = {
    'Motor': 'Kendaraan',
    'Mobil': 'Mobil',
    'HP': 'Gadget',
    'Elektronik': 'Elektronik',
    'Laptop': 'Laptop',
    'Perhiasan': 'Perhiasan',
    'Lainnya': 'Lainnya'
  };
  return reverseMapping[kategori] || kategori;
}

/**
 * Calculate return date based on period
 */
function calculateTanggalKembali(tanggalPinjam, jangkaWaktu) {
  const date = new Date(tanggalPinjam);
  if (jangkaWaktu === '2minggu') {
    date.setDate(date.getDate() + 14);
  } else if (jangkaWaktu === '1bulan') {
    date.setMonth(date.getMonth() + 1);
  }
  return date;
}

/**
 * Update status based on due date
 */
function updateStatusBasedOnDueDate(currentStatus, tanggalKembali) {
  if (currentStatus !== 'AKTIF') return currentStatus;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(tanggalKembali);
  dueDate.setHours(0, 0, 0, 0);

  if (today > dueDate) return 'OVERDUE';
  if (today.getTime() === dueDate.getTime()) return 'JATUH_TEMPO';
  return currentStatus;
}

/**
 * Get status label for display
 */
function getStatusLabel(status) {
  const labels = {
    'PENDING': 'Menunggu',
    'AKTIF': 'Aktif',
    'LUNAS': 'Lunas',
    'JATUH_TEMPO': 'Jatuh Tempo',
    'OVERDUE': 'Terlambat',
    'DITOLAK': 'Ditolak',
    'DIPERPANJANG': 'Diperpanjang'
  };
  return labels[status] || status;
}

/**
 * Get status color for frontend
 */
function getStatusColor(status) {
  const colors = {
    'PENDING': 'warning',
    'AKTIF': 'success',
    'LUNAS': 'info',
    'JATUH_TEMPO': 'warning',
    'OVERDUE': 'danger',
    'DITOLAK': 'secondary',
    'DIPERPANJANG': 'primary'
  };
  return colors[status] || 'secondary';
}

/**
 * Format currency to Indonesian Rupiah
 */
function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(number);
}

module.exports = {
  normalizePhoneNumber,
  mapKategoriBarang,
  getKategoriLabel,
  calculateTanggalKembali,
  updateStatusBasedOnDueDate,
  getStatusLabel,
  getStatusColor,
  formatRupiah
};
