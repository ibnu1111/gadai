import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://gadaijogja.com'),
  title: {
    default: 'Gadai Jogja - Gadai Online Terpercaya di Yogyakarta | Proses Cepat & Aman',
    template: '%s | Gadai Jogja',
  },
  description: 'Gadai Jogja - Platform gadai online terpercaya di Yogyakarta. Layanan gadai HP, laptop, motor, dan mobil dengan proses 15 menit, jasa 10%, terima utuh tanpa potongan.',
  keywords: [
    'gadai jogja',
    'gadai online jogja',
    'gadai hp jogja',
    'gadai motor jogja',
    'gadai laptop jogja',
    'gadai mobil jogja',
    'tempat gadai jogja',
    'gadai 24 jam jogja',
    'gadai tanpa bpkb jogja',
    'pinjaman jogja',
    'kredit jogja',
  ],
  authors: [{ name: 'Gadai Jogja' }],
  creator: 'Gadai Jogja',
  publisher: 'Gadai Jogja',
  icons: {
    icon: '/favicon-gadai.png',
    apple: '/favicon-gadai.png',
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://gadaijogja.com',
    siteName: 'Gadai Jogja',
    title: 'Gadai Jogja - Gadai Online Terpercaya di Yogyakarta',
    description: 'Layanan gadai HP, laptop, motor, mobil dengan proses cepat 15 menit. Jasa 10%, terima utuh tanpa potongan.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gadai Jogja - Gadai Online Terpercaya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gadai Jogja - Gadai Online Terpercaya di Yogyakarta',
    description: 'Layanan gadai terpercaya di Yogyakarta. Proses cepat, jasa transparan.',
    images: ['/og-image.jpg'],
  },
  alternates: {
    canonical: 'https://gadaijogja.com',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="min-h-screen bg-white antialiased scroll-smooth">{children}</body>
    </html>
  )
}
