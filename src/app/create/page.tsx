import type { Metadata } from 'next'
import CreatePageClient from './CreatePageClient'

export const metadata: Metadata = {
  title: 'Ajukan Gadai Online - Form Pengajuan Cepat',
  description: 'Isi form pengajuan gadai HP, laptop, motor, atau mobil secara online di Gadai Jogja. Proses 15 menit, jasa 10% per 2 minggu, dana langsung cair ke rekening.',
  alternates: {
    canonical: 'https://gadaijogja.com/create',
  },
  openGraph: {
    title: 'Ajukan Gadai Online - Gadai Jogja',
    description: 'Isi form pengajuan gadai HP, laptop, motor, atau mobil secara online. Proses 15 menit, jasa 10% per 2 minggu.',
    url: 'https://gadaijogja.com/create',
  },
}

export default function CreatePage() {
  return <CreatePageClient />
}
