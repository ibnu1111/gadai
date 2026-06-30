import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Gadai Jogja - Gadai Online Terpercaya di Yogyakarta | Proses Cepat & Aman',
  description: 'Gadai Jogja adalah platform gadai online terpercaya di Yogyakarta. Layanan gadai HP, laptop, motor, dan mobil dengan proses 15 menit, bunga mulai 2%, dan tanpa biaya admin tersembunyi.',
  keywords: 'gadai jogja, gadai online jogja, gadai hp jogja, gadai motor jogja, gadai laptop jogja, gadai mobil jogja, tempat gadai jogja, gadai 24 jam jogja',
  openGraph: {
    title: 'Gadai Jogja - Gadai Online Terpercaya di Yogyakarta',
    description: 'Layanan gadai HP, laptop, motor, mobil dengan proses cepat 15 menit. Bunga mulai 2%. Tanpa biaya admin.',
    url: 'https://gadaijogja.com',
    siteName: 'Gadai Jogja',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gadai Jogja - Gadai Online Terpercaya',
    description: 'Layanan gadai terpercaya di Yogyakarta. Proses cepat, bunga rendah.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  'name': 'Gadai Jogja',
  'description': 'Layanan gadai online terpercaya di Yogyakarta untuk HP, laptop, motor, dan mobil.',
  'url': 'https://gadaijogja.com',
  'telephone': '+6282299748978',
  'email': 'cs@gadaijogja.com',
  'address': {
    '@type': 'PostalAddress',
    'addressLocality': 'Yogyakarta',
    'addressRegion': 'DI Yogyakarta',
    'addressCountry': 'ID'
  },
  'areaServed': [
    { '@type': 'City', 'name': 'Kota Yogyakarta' },
    { '@type': 'AdministrativeArea', 'name': 'Sleman' },
    { '@type': 'AdministrativeArea', 'name': 'Bantul' },
    { '@type': 'AdministrativeArea', 'name': 'Kulon Progo' },
    { '@type': 'AdministrativeArea', 'name': 'Gunung Kidul' }
  ],
  'openingHours': 'Mo-Su 00:00-23:59',
  'priceRange': '$$',
  'sameAs': [
    'https://wa.me/6282299748978'
  ]
}

const faqs = [
  {
    question: 'Berapa lama proses gadai di Gadai Jogja?',
    answer: 'Proses gadai kami sangat cepat, hanya membutuhkan waktu 10-15 menit dari pengajuan hingga pencairan dana langsung ke rekening Anda. Untuk gadai motor/mobil mungkin butuh survey lokasi terlebih dahulu.'
  },
  {
    question: 'Apakah ada biaya admin atau biaya tersembunyi?',
    answer: 'Tidak ada biaya admin atau biaya tersembunyi sama sekali. Yang Anda bayar hanya bunga sesuai kesepakatan di awal. Semua transparan dan tertulis jelas di bukti gadai.'
  },
  {
    question: 'Berapa bunga gadai di Gadai Jogja?',
    answer: 'Bunga gadai kami mulai dari 2% per bulan tergantung jenis barang dan nilai gadai. Ini sangat kompetitif dibanding tempat gadai lain. Bunga dihitung per bulan, bukan per hari.'
  },
  {
    question: 'Apakah barang gadai dijamin aman?',
    answer: 'Sangat aman! Semua barang gadai disimpan di tempat yang aman dengan sistem keamanan 24 jam. Kami juga memberikan bukti gadai resmi sebagai jaminan.'
  },
  {
    question: 'Bagaimana cara menebus barang gadai?',
    answer: 'Hubungi kami via WhatsApp 0822-9974-8978, bayar pokok pinjaman + bunga, dan barang bisa langsung diambil. Proses tebus sangat cepat, bisa dalam hitungan menit.'
  },
  {
    question: 'Berapa nilai maksimal yang bisa dipinjam?',
    answer: 'Nilai pinjaman tergantung taksiran barang. Untuk HP/laptop bisa hingga 80% dari harga pasaran. Untuk motor/mobil bisa hingga 70% dari nilai NJKB. Tidak ada batasan maksimal.'
  }
]

const testimonials = [
  {
    name: 'Andi Pratama',
    location: 'Sleman',
    message: 'Proses sangat cepat! Saya gadai iPhone hanya 10 menit langsung cair. Pelayanan ramah dan profesional. Recommended!',
    initials: 'AP',
    color: '#3b82f6'
  },
  {
    name: 'Rini Wijayanti',
    location: 'Bantul',
    message: 'Bunga lebih rendah dari tempat lain. Pencairan langsung ke rekening. Sangat membantu untuk kebutuhan mendesak!',
    initials: 'RW',
    color: '#8b5cf6'
  },
  {
    name: 'Budi Santoso',
    location: 'Yogyakarta',
    message: 'Sudah langganan gadai di sini. Terpercaya, barang aman, dan proses tebus mudah. Top markotop!',
    initials: 'BS',
    color: '#10b981'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <span className="text-lg font-bold text-gray-900">Gadai Jogja</span>
                <span className="hidden sm:block text-xs text-gray-500">gadaijogja.com</span>
              </div>
            </div>
            <nav className="hidden lg:flex items-center gap-1">
              <a href="#layanan" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition">Layanan</a>
              <a href="#cara-kerja" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition">Cara Kerja</a>
              <a href="#wilayah" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition">Wilayah</a>
              <a href="#faq" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition">FAQ</a>
            </nav>
            <div className="flex items-center gap-3">
              <a href="/track" className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-gray-600 hover:text-blue-600 font-medium">
                Lacak
              </a>
              <a
                href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20konsultasi"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-lg shadow-blue-200"
              >
                Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-yellow-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white/90 text-sm font-medium">Terpercaya sejak 2020</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-6">
                Butuh Dana Cepat?
                <span className="block mt-2 text-yellow-400">Gadai Aja!</span>
              </h1>

              <p className="text-lg text-blue-100 mb-6 max-w-xl mx-auto lg:mx-0">
                Solusi gadai online terpercaya di Yogyakarta. Proses cepat 15 menit, bunga mulai 2%, tanpa biaya admin tersembunyi.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <a
                  href="#pengajuan"
                  className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>Gadai Sekarang</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20konsultasi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-700 transition-all inline-flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  <span>Chat WhatsApp</span>
                </a>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="font-bold text-white">15 Menit</p>
                    <p className="text-blue-200 text-xs">Proses Cepat</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <p className="font-bold text-white">100% Aman</p>
                    <p className="text-blue-200 text-xs">Terjamin</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  <div>
                    <p className="font-bold text-white">Bunga 2%</p>
                    <p className="text-blue-200 text-xs">Per Bulan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content - Quick Form */}
            <div id="pengajuan" className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-500 text-sm">Layanan Gadai Online</p>
                  <h3 className="text-xl font-bold text-gray-900">Ajukan Gadai Sekarang</h3>
                </div>
                <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-xs font-semibold">Online 24/7</span>
                </div>
              </div>

              <form action="/create" method="GET" className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
                  <input type="text" name="name" placeholder="Masukkan nama Anda" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor WhatsApp</label>
                  <input type="tel" name="phone" placeholder="08xxxxxxxxxx" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Barang</label>
                  <select name="category" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-600">
                    <option value="">Pilih kategori</option>
                    <option value="HP">HP / Smartphone</option>
                    <option value="Laptop">Laptop / Komputer</option>
                    <option value="Motor">Motor</option>
                    <option value="Mobil">Mobil</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimasi Nilai (Rp)</label>
                  <input type="number" name="amount" placeholder="Contoh: 500000" min="100000" required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                </div>

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-200 mt-2">
                  Lanjutkan Pengajuan
                </button>
              </form>

              <p className="text-xs text-gray-400 text-center mt-4">
                Atau hubungi langsung via{' '}
                <a href="https://wa.me/6282299748978" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">
                  WhatsApp 0822-9974-8978
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-16 md:h-20">
            <path d="M0,40 C320,100 640,0 960,60 C1280,120 1360,40 1440,60 L1440,120 L0,120 Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 group-hover:scale-110 transition-transform">1000+</div>
              <div className="text-gray-400 text-sm mt-2">Total Transaksi</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 group-hover:scale-110 transition-transform">15 Min</div>
              <div className="text-gray-400 text-sm mt-2">Proses Tercepat</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 group-hover:scale-110 transition-transform">24/7</div>
              <div className="text-gray-400 text-sm mt-2">Layanan Online</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400 group-hover:scale-110 transition-transform">2%</div>
              <div className="text-gray-400 text-sm mt-2">Bunga Per Bulan</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layanan Section */}
      <section id="layanan" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              LAYANAN KAMI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Solusi Gadai Terlengkap di Yogyakarta
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Kami menerima berbagai jenis barang gadai dengan proses cepat dan nilai taksir maksimal
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* HP Card */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-blue-600 transition-colors">
                <span className="text-3xl group-hover:scale-110 transition-transform">📱</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">Gadai HP</h3>
              <p className="text-gray-600 text-sm mb-4">iPhone, Samsung, OPPO, Vivo, Xiaomi dan semua merk</p>
              <div className="flex items-center justify-center text-blue-600 font-semibold text-sm">
                <span>Bunga 2%</span>
              </div>
            </div>

            {/* Laptop Card */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-purple-300 transition-all cursor-pointer text-center">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-purple-600 transition-colors">
                <span className="text-3xl group-hover:scale-110 transition-transform">💻</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">Gadai Laptop</h3>
              <p className="text-gray-600 text-sm mb-4">MacBook, Asus, HP, Dell, gaming dan kantor</p>
              <div className="flex items-center justify-center text-purple-600 font-semibold text-sm">
                <span>Bunga 2%</span>
              </div>
            </div>

            {/* Motor Card */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-green-300 transition-all cursor-pointer text-center">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-green-600 transition-colors">
                <span className="text-3xl group-hover:scale-110 transition-transform">🏍️</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">Gadai Motor</h3>
              <p className="text-gray-600 text-sm mb-4">Unit + STNK/BPKB, bisa bawa pulang</p>
              <div className="flex items-center justify-center text-green-600 font-semibold text-sm">
                <span>Survey Cepat</span>
              </div>
            </div>

            {/* Mobil Card */}
            <div className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-orange-300 transition-all cursor-pointer text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:bg-orange-600 transition-colors">
                <span className="text-3xl group-hover:scale-110 transition-transform">🚗</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">Gadai Mobil</h3>
              <p className="text-gray-600 text-sm mb-4">Unit + STNK/BPKB dengan nilai maksimal</p>
              <div className="flex items-center justify-center text-orange-600 font-semibold text-sm">
                <span>Survey Cepat</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Keunggulan Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-green-100 text-green-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              KEUNGGULAN KAMI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Gadai Jogja?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Proses Super Cepat</h3>
                <p className="text-gray-600 text-sm">Hanya 15 menit dari pengajuan hingga pencairan dana langsung ke rekening Anda.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Bunga Rendah</h3>
                <p className="text-gray-600 text-sm">Mulai dari 2% per bulan, lebih rendah dari kompetitor.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Tanpa Biaya Admin</h3>
                <p className="text-gray-600 text-sm">Tidak ada biaya tersembunyi. Semua transparan.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Aman & Terpercaya</h3>
                <p className="text-gray-600 text-sm">Barang dijamin aman dengan penyimpanan yang terjaga.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Layanan 24/7</h3>
                <p className="text-gray-600 text-sm">Customer service siap membantu kapan saja.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Lokasi Strategis</h3>
                <p className="text-gray-600 text-sm">Melayani seluruh wilayah Yogyakarta dan sekitarnya.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Kerja Section */}
      <section id="cara-kerja" className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              CARA KERJA
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Proses Gadai yang Mudah
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Hanya 5 langkah sederhana untuk mendapatkan dana yang Anda butuhkan
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            <div className="text-center relative">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">1</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Hubungi Kami</h3>
              <p className="text-gray-600 text-xs">Via WhatsApp</p>
              <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-blue-200"></div>
            </div>
            <div className="text-center relative">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">2</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Kirim Foto</h3>
              <p className="text-gray-600 text-xs">Barang & dokumen</p>
              <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-blue-200"></div>
            </div>
            <div className="text-center relative">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">3</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Taksiran Harga</h3>
              <p className="text-gray-600 text-xs">Tim kami kasih penawaran</p>
              <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-blue-200"></div>
            </div>
            <div className="text-center relative">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">4</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Survey</h3>
              <p className="text-gray-600 text-xs">Jika diperlukan</p>
              <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-blue-200"></div>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg">5</div>
              <h3 className="font-bold text-gray-900 mb-2 text-sm">Dana Cair</h3>
              <p className="text-gray-600 text-xs">Transfer ke rekening</p>
            </div>
          </div>
        </div>
      </section>

      {/* Wilayah Section */}
      <section id="wilayah" className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              WILAYAH LAYANAN
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Melayani Seluruh Yogyakarta
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏛️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Kota Yogyakarta</h3>
              <p className="text-gray-600 text-xs">Pusat Kota</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🏔️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Sleman</h3>
              <p className="text-gray-600 text-xs">Depok, Mlati, Ngaglik</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌾</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Bantul</h3>
              <p className="text-gray-600 text-xs">Sewon, Kasihan, Pandak</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌊</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Kulon Progo</h3>
              <p className="text-gray-600 text-xs">Wates, Sentolo</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-gray-200 text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">⛰️</span>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Gunung Kidul</h3>
              <p className="text-gray-600 text-xs">Wonosari</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimoni Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-yellow-100 text-yellow-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              TESTIMONI
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Dipercaya Ribuan Pelanggan
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.message}"</p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: testimonial.color }}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    <p className="text-gray-500 text-sm">{testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Pertanyaan yang Sering Diajukan
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-white rounded-xl overflow-hidden group">
                <summary className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 list-none">
                  <span className="font-semibold text-gray-900">{faq.question}</span>
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-4 text-gray-600">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Masih ada pertanyaan?</p>
            <a
              href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20bertanya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Tanya via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Memulai Gadai?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Dapatkan dana yang Anda butuhkan dengan proses mudah dan cepat
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pengajuan"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition inline-flex items-center justify-center gap-2"
            >
              Gadai Sekarang
            </a>
            <a
              href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20konsultasi"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition inline-flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Hubungi WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold text-white">Gadai Jogja</span>
              </div>
              <p className="text-gray-400 text-sm">
                Solusi gadai online terpercaya di Yogyakarta. Proses cepat, bunga rendah, tanpa biaya tersembunyi.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Layanan</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#layanan" className="hover:text-white transition">Gadai HP</a></li>
                <li><a href="#layanan" className="hover:text-white transition">Gadai Laptop</a></li>
                <li><a href="#layanan" className="hover:text-white transition">Gadai Motor</a></li>
                <li><a href="#layanan" className="hover:text-white transition">Gadai Mobil</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Kontak</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  </svg>
                  0822-9974-8978
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  cs@gadaijogja.com
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Yogyakarta, Indonesia
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} Gadai Jogja. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
