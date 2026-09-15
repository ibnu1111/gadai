import Link from 'next/link'
import type { Metadata } from 'next'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import WhatsAppIcon from '@/components/WhatsAppIcon'
import { ADDRESS_LINES, BUSINESS, OPENING_HOURS_DISPLAY, whatsappLink } from '@/lib/business'

const pageUrl = `${BUSINESS.url}/kontak`
const mapQuery = encodeURIComponent(
  `${BUSINESS.streetAddress}, ${BUSINESS.addressLocality}, ${BUSINESS.addressRegion} ${BUSINESS.postalCode}`
)

export const metadata: Metadata = {
  title: 'Kontak & Lokasi',
  description: `Hubungi Gadai Jogja via WhatsApp ${BUSINESS.phoneDisplay} atau datang langsung ke lokasi kami di ${BUSINESS.addressLocality}. Buka ${OPENING_HOURS_DISPLAY.toLowerCase()}.`,
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Kontak & Lokasi | ${BUSINESS.name}`,
    description: `Hubungi Gadai Jogja via WhatsApp atau datang langsung ke lokasi kami di ${BUSINESS.addressLocality}.`,
    url: pageUrl,
  },
}

export default function KontakPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Beranda', url: BUSINESS.url },
          { name: 'Kontak', url: pageUrl },
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
                <li className="text-white font-medium">Kontak</li>
              </ol>
            </nav>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5">Kontak & Lokasi</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Hubungi kami via WhatsApp untuk taksiran cepat, atau datang langsung ke lokasi kami di {BUSINESS.addressLocality}.
            </p>
          </div>
        </section>

        {/* Contact cards */}
        <section className="py-16 bg-white">
          <div className="max-w-5xl mx-auto px-4 grid sm:grid-cols-3 gap-6">
            <a
              href={whatsappLink('Halo Gadai Jogja, saya ingin bertanya')}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl p-6 text-center transition"
            >
              <WhatsAppIcon className="w-8 h-8 mx-auto mb-3 text-green-600" />
              <div className="font-bold text-gray-900 mb-1">WhatsApp</div>
              <div className="text-gray-600 text-sm">{BUSINESS.phoneDisplay}</div>
            </a>
            <a
              href={`mailto:${BUSINESS.email}`}
              className="bg-gray-50 hover:bg-blue-50 border border-gray-100 rounded-2xl p-6 text-center transition"
            >
              <svg className="w-8 h-8 mx-auto mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="font-bold text-gray-900 mb-1">Email</div>
              <div className="text-gray-600 text-sm">{BUSINESS.email}</div>
            </a>
            <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-center">
              <svg className="w-8 h-8 mx-auto mb-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="font-bold text-gray-900 mb-1">Jam Buka</div>
              <div className="text-gray-600 text-sm">{OPENING_HOURS_DISPLAY}</div>
            </div>
          </div>
        </section>

        {/* Address + map */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Alamat Kami</h2>
              <address className="not-italic text-gray-600 leading-relaxed mb-6">
                {ADDRESS_LINES.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </address>
              <p className="text-gray-600 leading-relaxed mb-6">
                Serah terima barang dan pencairan dana dilakukan langsung di lokasi ini. Supaya lebih cepat saat Anda datang, ajukan dan tanyakan taksiran dulu lewat WhatsApp.
              </p>
              <a
                href={whatsappLink('Halo Gadai Jogja, saya ingin tanya arah ke lokasi')}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg shadow-blue-200"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Tanya Arah via WhatsApp
              </a>
            </div>
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <iframe
                title="Lokasi Gadai Jogja"
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                className="absolute inset-0 w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Siap Mengajukan Gadai?</h2>
            <p className="text-blue-100 mb-8">Isi form pengajuan online, atau hubungi kami langsung untuk konsultasi.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition inline-flex items-center justify-center gap-2"
              >
                Ajukan Sekarang
              </Link>
              <a
                href={whatsappLink('Halo Gadai Jogja, saya ingin konsultasi')}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-700 transition inline-flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Chat WhatsApp
              </a>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  )
}
