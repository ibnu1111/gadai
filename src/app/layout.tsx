import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://gadaijogja.com'),
  title: {
    default: 'Gadai Jogja - Gadai Online Terpercaya di Yogyakarta | Proses Cepat & Aman',
    template: '%s | Gadai Jogja',
  },
  description: 'Gadai Jogja - Platform gadai online terpercaya di Yogyakarta. Layanan gadai HP, laptop, motor, dan mobil dengan proses 15 menit, bunga mulai 2%, tanpa biaya admin tersembunyi.',
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
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: 'https://gadaijogja.com',
    siteName: 'Gadai Jogja',
    title: 'Gadai Jogja - Gadai Online Terpercaya di Yogyakarta',
    description: 'Layanan gadai HP, laptop, motor, mobil dengan proses cepat 15 menit. Bunga mulai 2%. Tanpa biaya admin.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Gadai Jogja - Gadai Online Terpercaya',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gadai Jogja - Gadai Online Terpercaya di Yogyakarta',
    description: 'Layanan gadai terpercaya di Yogyakarta. Proses cepat, bunga rendah.',
    images: ['/og-image.png'],
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
  verification: {
    google: 'your-google-verification-code', // Tambahkan kode verifikasi Google Search Console
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link rel="canonical" href="https://gadaijogja.com" />
      </head>
      <body className="min-h-screen bg-white antialiased">{children}</body>
    </html>
  )
}
