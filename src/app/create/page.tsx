import type { Metadata } from 'next'
import CreatePageClient from './CreatePageClient'

export const metadata: Metadata = {
  title: 'Ajukan Gadai - Form Pengajuan Online',
  description: 'Ajukan taksiran gadai HP, laptop, motor, atau mobil lewat form online. Unit diserahkan di tempat kami, dana cair 15 menit, jasa 10% per 2 minggu.',
  alternates: {
    canonical: 'https://gadaijogja.com/create',
  },
  openGraph: {
    title: 'Ajukan Gadai - Form Pengajuan Online | Gadai Jogja',
    description: 'Ajukan taksiran gadai HP, laptop, motor, atau mobil lewat form online. Unit diserahkan di tempat kami, dana cair 15 menit.',
    url: 'https://gadaijogja.com/create',
  },
}

export default function CreatePage() {
  return <CreatePageClient />
}
