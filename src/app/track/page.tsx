import type { Metadata } from 'next'
import TrackPageClient from './TrackPageClient'

export const metadata: Metadata = {
  title: 'Lacak Status Pengajuan Gadai',
  description: 'Cek status pengajuan gadai Anda di Gadai Jogja dengan memasukkan nomor WhatsApp. Pantau status verifikasi, jatuh tempo, dan riwayat pembayaran.',
  alternates: {
    canonical: 'https://gadaijogja.com/track',
  },
  openGraph: {
    title: 'Lacak Status Pengajuan Gadai - Gadai Jogja',
    description: 'Cek status pengajuan gadai Anda di Gadai Jogja dengan memasukkan nomor WhatsApp.',
    url: 'https://gadaijogja.com/track',
  },
}

export default function TrackPage() {
  return <TrackPageClient />
}
