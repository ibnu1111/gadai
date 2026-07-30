import Image from 'next/image'
import Link from 'next/link'
import AnimatedCounter from '@/components/home/AnimatedCounter'
import FaqAccordion from '@/components/home/FaqAccordion'
import AjukanFormTabs from '@/components/home/AjukanFormTabs'
import SiteHeader from '@/components/SiteHeader'
import SiteFooter from '@/components/SiteFooter'
import WhatsAppIcon from '@/components/WhatsAppIcon'
import { BUSINESS, addressSchema, openingHoursSchema, whatsappLink } from '@/lib/business'

export default function Home() {
  const faqs = [
    {
      question: 'Berapa lama proses gadai di Gadai Jogja?',
      answer: 'Proses gadai kami sangat cepat, hanya membutuhkan waktu 10-15 menit dari pengajuan hingga pencairan dana langsung ke rekening Anda. Untuk motor & mobil, kepemilikan harus jelas dan akan ditaksir di tempat kami.'
    },
    {
      question: 'Apakah gadai bisa sepenuhnya online tanpa datang ke lokasi?',
      answer: 'Tidak. Yang bisa dilakukan online adalah pengajuan dan taksiran harga, lewat form di website atau WhatsApp. Setelah harga disepakati, Anda tetap mengantar unit ke tempat kami untuk dicek langsung, baru dana dicairkan ke rekening. Barang disimpan di tempat kami selama masa gadai, jadi tidak ada serah terima lewat kurir atau pengiriman.'
    },
    {
      question: 'Apakah ada biaya admin atau biaya tersembunyi?',
      answer: 'Tidak ada biaya admin atau biaya tersembunyi sama sekali. Yang Anda bayar hanya jasa sesuai kesepakatan di awal. Semua transparan dan tertulis jelas di bukti gadai.'
    },
    {
      question: 'Berapa jasa gadai di Gadai Jogja?',
      answer: 'Jasa gadai kami 10% per 2 minggu, terima utuh tanpa potongan. Proses cepat dan transparan.'
    },
    {
      question: 'Apakah barang gadai dijamin aman?',
      answer: 'Sangat aman! Semua barang gadai disimpan di tempat yang aman dengan sistem keamanan 24 jam. Bukti gadai dikirim dalam bentuk elektronik dengan rincian sesuai akad awal.'
    },
    {
      question: 'Bagaimana cara menebus barang gadai?',
      answer: 'Hubungi kami via WhatsApp 0822-9974-8978, bayar pokok pinjaman + jasa, dan barang bisa langsung diambil. Proses tebus sangat cepat, bisa dalam hitungan menit.'
    },
    {
      question: 'Bagaimana jika belum bisa menebus barang?',
      answer: 'Jika belum bisa menebus, barang bisa diperpanjang cukup dengan bayar jasa saja. Hubungi kami via WhatsApp untuk perpanjangan.'
    },
    {
      question: 'Bagaimana jika tidak diperpanjang atau tidak diambil?',
      answer: 'Jika tidak diperpanjang atau tidak diambil, barang berpotensi akan dilelang. Toleransi keterlambatan maksimal 3 hari.'
    },
    {
      question: 'Berapa nilai maksimal yang bisa dipinjam?',
      answer: 'Nilai pinjaman tergantung taksiran barang. Bisa hingga 85% dari harga pasaran. Tidak ada batasan maksimal.'
    },
    {
      question: 'Apakah bisa gadai motor tanpa BPKB di Gadai Jogja?',
      answer: 'Bisa. Kami menerima gadai motor tanpa BPKB selama STNK dan identitas pemilik jelas serta unit diparkir 100% di tempat kami selama masa gadai. Taksiran tetap kompetitif meski tanpa BPKB.'
    },
    {
      question: 'Apakah Gadai Jogja buka 24 jam?',
      answer: 'Pengajuan dan taksiran lewat WhatsApp atau form di website bisa dilakukan 24 jam setiap hari. Untuk serah terima barang dan pencairan dana, silakan datang ke tempat kami di Wedomartani, Ngemplak, Sleman yang buka setiap hari pukul 06.00 - 20.00 WIB.'
    }
  ]

  // FAQPage structured data (schema.org) so Google can show an FAQ rich result for this page.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

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

  // LocalBusiness structured data with aggregate rating + reviews, built from the
  // testimonials shown above (all displayed with a 5-star rating in the UI).
  // Note: Google generally does not render self-authored review rich snippets for a
  // business's own site, but the markup is still valid/useful schema.org metadata.
  const businessSchema = {
    '@context': 'https://schema.org',
    '@type': 'FinancialService',
    name: BUSINESS.name,
    description: 'Gadai Jogja melayani gadai HP, laptop, motor, dan mobil di Yogyakarta. Pengajuan dan taksiran harga dilakukan online lewat website atau WhatsApp, sedangkan serah terima serta penyimpanan barang dilakukan langsung di tempat kami.',
    image: `${BUSINESS.url}/og-image.jpg`,
    url: BUSINESS.url,
    telephone: BUSINESS.telephone,
    email: BUSINESS.email,
    priceRange: '$$',
    currenciesAccepted: 'IDR',
    address: addressSchema,
    openingHoursSpecification: openingHoursSchema,
    areaServed: BUSINESS.areaServed,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      reviewCount: String(testimonials.length),
    },
    review: testimonials.map((testimonial) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: testimonial.name },
      reviewRating: { '@type': 'Rating', ratingValue: '5', bestRating: '5' },
      reviewBody: testimonial.message,
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSchema) }}
      />
      <div className="min-h-screen bg-white">
      <SiteHeader />

      {/* Hero Section - Minimalis */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-8 animate-fade-in-up">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white/90 text-sm font-medium">Terpercaya sejak 2020</span>
          </div>

          {/* Headline */}
          <div className="animate-fade-in-up [animation-delay:100ms]">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Butuh Dana Cepat?
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">Gadai Aja di Jogja!</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Gadai HP, laptop, motor & mobil di Yogyakarta. Ajukan taksiran online, serah terima dan penyimpanan unit di tempat kami. Cair 15 menit, jasa 10% per 2 minggu.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up [animation-delay:200ms]">
            <a
              href="#form"
              className="group bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all inline-flex items-center justify-center gap-2"
            >
              Gadai Sekarang
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20konsultasi"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-10 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-700 transition-all inline-flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              Chat WhatsApp
            </a>
          </div>

          {/* Quick Features */}
          <div className="flex flex-wrap justify-center gap-6 mt-12 animate-fade-in-up [animation-delay:300ms]">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white/80 text-sm">15 Menit Cair</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white/80 text-sm">Jasa 10% (2 Minggu)</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white/80 text-sm">Terima Utuh</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-white/80 text-sm">100% Aman</span>
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

      {/* Form Section with Tabs */}
      <section id="form" className="py-16 bg-white">
        <div className="max-w-xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Ajukan Gadai Sekarang</h2>
            <p className="text-gray-500">Isi form atau lihat cara kerja kami</p>
          </div>

          <AjukanFormTabs />
        </div>
      </section>

      {/* Stats Bar */}
      <div className="bg-gray-900 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                <AnimatedCounter end={1000} />
              </div>
              <div className="text-gray-400 text-sm mt-2">Total Transaksi</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                <AnimatedCounter end={15} />
              </div>
              <div className="text-gray-400 text-sm mt-2">Menit Proses</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                24<span className="text-lg">/</span>7
              </div>
              <div className="text-gray-400 text-sm mt-2">Pengajuan Online</div>
            </div>
            <div className="group">
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent group-hover:scale-110 transition-transform">
                10<span className="text-lg">%</span>
              </div>
              <div className="text-gray-400 text-sm mt-2">Jasa (2 Minggu)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layanan Section with Images */}
      <section id="layanan" className="py-16 bg-gray-50">
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

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* HP Card */}
            <Link href="/gadai-hp" className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
              <Image src="/images/4.jpeg" alt="Gadai HP" fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Gadai HP</h3>
                <p className="text-white/80 text-xs">HP tidak dipakai</p>
              </div>
            </Link>

            {/* Smartwatch Card */}
            <Link href="/gadai-smartwatch" className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
              <Image src="/images/2.jpeg" alt="Gadai Smartwatch" fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Smartwatch</h3>
                <p className="text-white/80 text-xs">Tidak dipakai</p>
              </div>
            </Link>

            {/* Laptop Card */}
            <Link href="/gadai-laptop" className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
              <Image src="/images/6.jpeg" alt="Gadai Laptop" fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Gadai Laptop</h3>
                <p className="text-white/80 text-xs">Laptop tidak dipakai</p>
              </div>
            </Link>

            {/* Motor Card */}
            <Link href="/gadai-motor" className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
              <Image src="/images/7.jpeg" alt="Gadai Motor" fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Gadai Motor</h3>
                <p className="text-white/80 text-xs">Unit 100% parkir</p>
              </div>
            </Link>

            {/* Mobil Card */}
            <Link href="/gadai-mobil" className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all">
              <Image src="/images/8.jpeg" alt="Gadai Mobil" fill sizes="(max-width: 768px) 50vw, 20vw" className="object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Gadai Mobil</h3>
                <p className="text-white/80 text-xs">Unit 100% parkir</p>
              </div>
            </Link>
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
            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Proses Super Cepat</h3>
                <p className="text-gray-600 text-sm">Hanya 15 menit dari pengajuan hingga pencairan dana langsung ke rekening Anda.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-green-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Jasa Transparan</h3>
                <p className="text-gray-600 text-sm">10% per 2 minggu, terima utuh tanpa potongan.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Tanpa Biaya Admin</h3>
                <p className="text-gray-600 text-sm">Tidak ada biaya tersembunyi. Semua transparan.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-yellow-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Aman & Terpercaya</h3>
                <p className="text-gray-600 text-sm">Barang dijamin aman dengan penyimpanan yang terjaga.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Layanan 24/7</h3>
                <p className="text-gray-600 text-sm">Customer service siap membantu kapan saja.</p>
              </div>
            </div>

            <div className="bg-white rounded-xl p-6 flex items-start gap-4 border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {[
              { num: 1, title: 'Hubungi Kami', desc: 'Via WhatsApp' },
              { num: 2, title: 'Kirim Foto', desc: 'Barang & dokumen' },
              { num: 3, title: 'Taksiran', desc: 'Tim kami kasih penawaran' },
              { num: 4, title: 'Antar Unit', desc: 'Serah terima di tempat kami' },
              { num: 5, title: 'Dana Cair', desc: 'Transfer ke rekening' }
            ].map((step, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold mx-auto mb-4 shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  {step.num}
                </div>
                <h3 className="font-bold text-gray-900 mb-1 text-sm">{step.title}</h3>
                <p className="text-gray-600 text-xs">{step.desc}</p>
                {i < 4 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-blue-300 to-blue-200"></div>
                )}
              </div>
            ))}
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

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { name: 'Kota Yogyakarta', desc: 'Pusat Kota', emoji: '🏛️' },
              { name: 'Sleman', desc: 'Depok, Mlati, Ngaglik', emoji: '🏔️' },
              { name: 'Bantul', desc: 'Sewon, Kasihan, Pandak', emoji: '🌾' },
              { name: 'Kulon Progo', desc: 'Wates, Sentolo', emoji: '🌊' },
              { name: 'Gunung Kidul', desc: 'Wonosari', emoji: '⛰️' }
            ].map((area, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200 text-center hover:shadow-lg transition-all hover:-translate-y-1">
                <div className="text-4xl mb-3">{area.emoji}</div>
                <h3 className="font-bold text-gray-900 mb-1">{area.name}</h3>
                <p className="text-gray-600 text-xs">{area.desc}</p>
              </div>
            ))}
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
              <div key={index} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
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
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
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

          <FaqAccordion faqs={faqs} />

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Masih ada pertanyaan?</p>
            <a
              href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20bertanya"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-green-200"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              Tanya via WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Siap Memulai Gadai?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Dapatkan dana yang Anda butuhkan dengan proses mudah dan cepat
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/create"
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition inline-flex items-center justify-center gap-2 shadow-xl"
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
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              </svg>
              Hubungi WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Floating WhatsApp Button */}
      <a
        href={whatsappLink('Halo Gadai Jogja, saya ingin bertanya')}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat WhatsApp Gadai Jogja"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
        style={{ animationDuration: '2s' }}
      >
        <WhatsAppIcon className="w-8 h-8" />
        {/* Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></span>
      </a>

      <SiteFooter />
      </div>
    </>
  )
}
