import Link from 'next/link'
import type { Metadata } from 'next'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import WhatsAppIcon from '@/components/WhatsAppIcon'
import { BUSINESS, whatsappLink } from '@/lib/business'

const pageUrl = `${BUSINESS.url}/tentang-kami`

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description:
    'Gadai Jogja adalah usaha gadai perorangan di Yogyakarta yang fokus membantu pencairan dana cepat dengan taksiran tinggi, barang disimpan aman di gudang milik sendiri.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Tentang Kami | ${BUSINESS.name}`,
    description: 'Usaha gadai perorangan di Yogyakarta yang fokus membantu pencairan dana cepat dengan taksiran tinggi.',
    url: pageUrl,
  },
}

const NILAI = [
  {
    title: 'Dikelola Langsung',
    desc: 'Bukan dititipkan ke pihak ketiga — setiap barang gadai kami simpan dan pantau sendiri di gudang dan tempat tinggal kami.',
  },
  {
    title: 'Taksiran Maksimal',
    desc: 'Fokus kami membantu nasabah mendapat pencairan dana secepat mungkin dengan nominal pinjaman yang tinggi sesuai nilai barang.',
  },
  {
    title: 'Aturan Transparan',
    desc: 'Jasa, jatuh tempo, dan prosedur lelang dijelaskan sejak awal akad, tanpa biaya tersembunyi di kemudian hari.',
  },
  {
    title: 'Komunikasi Personal',
    desc: 'Sebagai usaha perorangan, setiap nasabah bisa langsung berkomunikasi dengan kami lewat WhatsApp, bukan lewat birokrasi berlapis.',
  },
]

export default function TentangKamiPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Beranda', url: BUSINESS.url },
          { name: 'Tentang Kami', url: pageUrl },
        ]}
      />

      <div className="min-h-screen bg-white">
        <SiteHeader />

        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
          </div>
          <div className="relative max-w-3xl mx-auto px-4 py-16 md:py-20 text-center">
            <nav aria-label="Breadcrumb" className="mb-6 flex justify-center">
              <ol className="flex items-center gap-2 text-sm text-blue-200">
                <li><Link href="/" className="hover:text-white transition">Beranda</Link></li>
                <li aria-hidden="true">/</li>
                <li className="text-white font-medium">Tentang Kami</li>
              </ol>
            </nav>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5">Tentang Gadai Jogja</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Usaha gadai perorangan yang membantu warga Yogyakarta mendapatkan dana cepat, dengan taksiran tinggi dan proses yang jujur.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 space-y-5 text-gray-600 leading-relaxed">
            <p>
              Gadai Jogja adalah usaha gadai perorangan yang melayani warga Yogyakarta dan sekitarnya. Kami hadir untuk membantu siapa saja yang butuh dana cepat, dengan proses yang sederhana dan nilai taksiran yang tinggi untuk setiap barang yang digadaikan.
            </p>
            <p>
              Karena dikelola secara langsung dan personal, setiap barang yang dititipkan kami simpan sendiri di gudang dan tempat tinggal kami — bukan di gudang pihak ketiga — sehingga keamanannya kami pantau dan kami tanggung jawabi sendiri setiap hari.
            </p>
            <p>
              Fokus utama kami adalah membantu nasabah memperoleh pencairan dana secepat mungkin dengan nominal pinjaman yang maksimal, mengikuti nilai taksir barang, tanpa proses berbelit dan tanpa biaya tersembunyi.
            </p>
            <p>
              Kami juga menerapkan sistem lelang yang transparan: jika sebuah barang gadai tidak diperpanjang jasanya atau telah melewati batas jatuh tempo, barang tersebut berpotensi kami lelang untuk menyelesaikan kewajiban gadai, sesuai kesepakatan yang sudah dijelaskan sejak awal transaksi.
            </p>
            <p>
              Sebagai usaha perorangan, kami mengutamakan kedekatan dan kepercayaan langsung dengan setiap nasabah — komunikasi cepat, harga yang jujur, dan proses yang bisa dipantau sendiri lewat WhatsApp atau halaman{' '}
              <Link href="/track" className="text-blue-600 hover:text-blue-700 font-medium">Lacak Status</Link>{' '}
              di website ini.
            </p>
          </div>
        </section>

        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">Yang Kami Pegang Teguh</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {NILAI.map((item) => (
                <div key={item.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ada yang Ingin Ditanyakan?</h2>
            <p className="text-blue-100 mb-8">Hubungi kami langsung, atau lihat lokasi dan cara mengajukan gadai.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={whatsappLink('Halo Gadai Jogja, saya ingin bertanya')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition inline-flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Chat WhatsApp
              </a>
              <Link
                href="/kontak"
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-700 transition inline-flex items-center justify-center gap-2"
              >
                Lihat Lokasi Kami
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  )
}
