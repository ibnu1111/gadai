'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// Animated counter component
function AnimatedCounter({ end, duration = 2000 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [isVisible, end, duration])

  return <div ref={ref}>{count}+</div>
}

// FAQ Item Component with animation
function FaqItem({ question, answer, isOpen, onClick }: { question: string; answer: string; isOpen: boolean; onClick: () => void }) {
  return (
    <div
      className={`bg-white rounded-2xl overflow-hidden transition-all duration-300 ${
        isOpen ? 'shadow-lg ring-2 ring-blue-100' : 'shadow-sm hover:shadow-md'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full px-6 py-5 flex items-center justify-between text-left"
      >
        <span className="font-semibold text-gray-900 pr-4">{question}</span>
        <svg
          className={`w-5 h-5 text-gray-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 text-gray-600">
          {answer}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const [amountDisplay, setAmountDisplay] = useState('')

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const formatAmount = (value: string) => {
    const number = value.replace(/\D/g, '')
    return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAmount(e.target.value)
    setAmountDisplay(formatted)
  }

  const faqs = [
    {
      question: 'Berapa lama proses gadai di Gadai Jogja?',
      answer: 'Proses gadai kami sangat cepat, hanya membutuhkan waktu 10-15 menit dari pengajuan hingga pencairan dana langsung ke rekening Anda. Untuk motor & mobil, kepemilikan harus jelas dan akan ditaksir di tempat kami.'
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <img src="/logo-gadai.png" alt="Gadai Jogja" className="h-10 w-auto" />
              <div className="hidden sm:block">
                <span className="text-xs text-gray-400">gadaijogja.com</span>
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
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-lg shadow-blue-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                </svg>
                Hubungi Kami
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Minimalis */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-20 md:py-28 text-center">
          {/* Badge */}
          <div className={`inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-8 transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-white/90 text-sm font-medium">Terpercaya sejak 2020</span>
          </div>

          {/* Headline */}
          <div className={`transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
              Butuh Dana Cepat?
              <span className="block mt-2 bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">Gadai Aja!</span>
            </h1>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Gadai online terpercaya di Yogyakarta. Proses 15 menit, jasa 10% per 2 minggu, terima utuh tanpa potongan.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
          <div className={`flex flex-wrap justify-center gap-6 mt-12 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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

          <div className="bg-gray-50 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setOpenFaq(0)}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  openFaq === 0 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Ajukan
              </button>
              <button
                onClick={() => setOpenFaq(1)}
                className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                  openFaq === 1 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cara Kerja
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {openFaq === 0 ? (
                /* Form Tab */
                <div>
                  <form action="/create" method="GET" className="space-y-4">
                    <div>
                      <input type="text" name="name" placeholder="Nama Lengkap" required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                    </div>

                    <div>
                      <input type="tel" name="phone" placeholder="Nomor WhatsApp" required
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <select name="category" required
                        className="px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-gray-600">
                        <option value="">Kategori</option>
                        <option value="HP">HP</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Motor">Motor</option>
                        <option value="Mobil">Mobil</option>
                      </select>

                      <div className="relative">
                        <input type="hidden" name="amount" value={amountDisplay.replace(/\./g, '')} />
                        <input type="text" placeholder="1.000.000" onChange={handleAmountChange} value={amountDisplay}
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-right" />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold text-lg transition shadow-lg shadow-blue-200 mt-4">
                      Lanjutkan Pengajuan
                    </button>
                  </form>

                  <p className="text-center text-gray-400 text-sm mt-4">
                    atau hubungi via{' '}
                    <a href="https://wa.me/6282299748978" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">
                      WhatsApp 0822-9974-8978
                    </a>
                  </p>
                </div>
              ) : (
                /* Cara Kerja Tab */
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Hubungi via WhatsApp</h4>
                      <p className="text-gray-600 text-sm">Hubungi via WhatsApp atau isi form di website untuk taksir harga</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Setuju Harga</h4>
                      <p className="text-gray-600 text-sm">Jika setuju dengan taksiran, datang ke lokasi dengan barang</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Verifikasi & Cair</h4>
                      <p className="text-gray-600 text-sm">Cek barang, dana langsung cair</p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Tebus / Perpanjang</h4>
                      <p className="text-gray-600 text-sm">Bayar jasa + pokok untuk menebus barang</p>
                    </div>
                  </div>

                  <a href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20bertanya"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-bold text-center transition shadow-lg mt-4">
                    Tanya via WhatsApp
                  </a>
                </div>
              )}
            </div>
          </div>
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
              <div className="text-gray-400 text-sm mt-2">Layanan Online</div>
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
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
              <img src="/images/4.jpeg" alt="Gadai HP" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Gadai HP</h3>
                <p className="text-white/80 text-xs">HP tidak dipakai</p>
              </div>
            </div>

            {/* Smartwatch Card */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
              <img src="/images/2.jpeg" alt="Gadai Smartwatch" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Smartwatch</h3>
                <p className="text-white/80 text-xs">Tidak dipakai</p>
              </div>
            </div>

            {/* Laptop Card */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
              <img src="/images/6.jpeg" alt="Gadai Laptop" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Gadai Laptop</h3>
                <p className="text-white/80 text-xs">Laptop tidak dipakai</p>
              </div>
            </div>

            {/* Motor Card */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
              <img src="/images/7.jpeg" alt="Gadai Motor" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Gadai Motor</h3>
                <p className="text-white/80 text-xs">Unit 100% parkir</p>
              </div>
            </div>

            {/* Mobil Card */}
            <div className="group relative h-64 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer">
              <img src="/images/8.jpeg" alt="Gadai Mobil" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="inline-block bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                  Jasa 10%
                </div>
                <h3 className="text-lg font-bold text-white mb-1">Gadai Mobil</h3>
                <p className="text-white/80 text-xs">Unit 100% parkir</p>
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
              { num: 4, title: 'Survey', desc: 'Jika diperlukan' },
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

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FaqItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFaq === index}
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              />
            ))}
          </div>

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
        href="https://wa.me/6282299748978?text=Halo%20Gadai%20Jogja,%20saya%20ingin%20bertanya"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 animate-bounce"
        style={{ animationDuration: '2s' }}
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        </svg>
        {/* Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-30"></span>
      </a>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo-gadai.png" alt="Gadai Jogja" className="h-10 w-auto" />
              </div>
              <p className="text-gray-400 text-sm">
                Solusi gadai online terpercaya di Yogyakarta. Proses cepat, jasa 10% per 2 minggu, tanpa biaya tersembunyi.
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
