// Customer
export interface Customer {
  id?: number
  nama: string
  noHp: string
  fotoKtp?: string
  createdAt?: string
}

// Gadai
export interface Gadai {
  gadaiID?: number
  customerID: number
  customer?: Customer
  kategoriBarang: string
  namaBarang: string
  nominalPinjam: number
  bungaPersentase: number
  fee: number
  tanggalPinjam: string
  tanggalKembali: string
  atributTinggal: string
  deskripsi?: string
  fotoBarang: string
  fotoPendukung?: string
  status: string
  statusLabel?: string
  statusColor?: string
  totalPembayaran: number
  parentGadaiID?: number
  perpanjanganKe: number
  createdAt?: string
}

// Public Gadai Request
export interface PublicGadaiRequest {
  customerName: string
  phone: string
  fotoKtp?: string
  kategoriBarang: string
  namaBarang: string
  deskripsi?: string
  atributTinggal?: string
  fotoBarang: string
  fotoPendukung?: string
  jangkaWaktu: string
  nominalPinjam: number
}

// Public Gadai Response
export interface PublicGadaiResponse {
  success: boolean
  message: string
  data: {
    gadaiId: number
    customerId: number
    status: string
    nominalPengajuan: number
    bungaPersentase: number
    fee: number
    tanggalKembali: string
  }
  waNotificationLink?: string
}

// Tracking Response
export interface TrackingResponse {
  success: boolean
  customer: {
    customerId: number
    customerName: string
    phone: string
  } | null
  pengajuan: PengajuanItem[]
}

export interface PengajuanItem {
  gadaiId: number
  namaBarang: string
  kategoriBarang: string
  nominalPinjam: number
  bungaPersentase: number
  fee: number
  nominalPengambilan: number
  tanggalPengajuan: string
  tanggalKembali: string
  status: string
  statusLabel: string
  statusColor: string
  perpanjanganKe: number
  totalPembayaran: number
}

// Payment
export interface Payment {
  id?: number
  gadaiID: number
  jumlahBayar: number
  tipeBayar: string
  catatan?: string
  createdAt?: string
  createdBy?: string
}

// Admin
export interface Admin {
  id: number
  nama: string
  email: string
}

// Summary
export interface Summary {
  totalGadai: number
  aktif: number
  pending: number
  jatuhTempo: number
  overdue: number
  lunas: number
  totalNominal: number
}

// Constants
export const KATEGORI_BARANG = [
  { label: 'Elektronik', value: 'Elektronik' },
  { label: 'Perhiasan', value: 'Perhiasan' },
  { label: 'Kendaraan', value: 'Kendaraan' },
  { label: 'Gadget', value: 'Gadget' },
  { label: 'Peralatan Rumah Tangga', value: 'Peralatan Rumah Tangga' },
  { label: 'Lainnya', value: 'Lainnya' }
]

export const JANGKA_WAKTU = [
  { label: '2 Minggu (10%)', value: '2minggu' },
  { label: '1 Bulan (20%)', value: '1bulan' }
]

export const STATUS_COLORS: Record<string, string> = {
  'PENDING': 'warning',
  'AKTIF': 'success',
  'LUNAS': 'info',
  'JATUH_TEMPO': 'warning',
  'OVERDUE': 'danger',
  'DITOLAK': 'secondary',
  'DIPERPANJANG': 'primary'
}

export const STATUS_LABELS: Record<string, string> = {
  'PENDING': 'Menunggu',
  'AKTIF': 'Aktif',
  'LUNAS': 'Lunas',
  'JATUH_TEMPO': 'Jatuh Tempo',
  'OVERDUE': 'Terlambat',
  'DITOLAK': 'Ditolak',
  'DIPERPANJANG': 'Diperpanjang'
}
