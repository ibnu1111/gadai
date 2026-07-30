import Image from 'next/image'
import Link from 'next/link'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import FaqAccordion from '@/components/home/FaqAccordion'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import WhatsAppIcon from '@/components/WhatsAppIcon'
import { BUSINESS, OPENING_HOURS_DISPLAY, providerSchema, whatsappLink } from '@/lib/business'
import { SERVICES, type ServiceContent } from '@/lib/services'

const STEPS = [
  { num: 1, title: 'Hubungi Kami', desc: 'Via WhatsApp atau form di website' },
  { num: 2, title: 'Kirim Foto', desc: 'Unit & dokumen pendukung' },
  { num: 3, title: 'Taksiran', desc: 'Kami kirim penawaran harga' },
  { num: 4, title: 'Antar Unit', desc: 'Serah terima di tempat kami' },
  { num: 5, title: 'Dana Cair', desc: 'Transfer ke rekening Anda' },
]

export default function ServiceLandingPage({ service }: { readonly service: ServiceContent }) {
  const pageUrl = `${BUSINESS.url}/${service.slug}`
  const otherServices = SERVICES.filter((item) => item.slug !== service.slug)

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.h1,
    serviceType: service.navLabel,
    description: service.metaDescription,
    url: pageUrl,
    areaServed: BUSINESS.areaServed,
    provider: providerSchema,
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: service.faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Beranda', url: BUSINESS.url },
          { name: service.navLabel, url: pageUrl },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="min-h-screen bg-white">
        <SiteHeader />

        {/* Hero */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-1/4 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
          </div>
          <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-20">
            <nav aria-label="Breadcrumb" className="mb-6">
              <ol className="flex items-center gap-2 text-sm text-blue-200">
                <li><Link href="/" className="hover:text-white transition">Beranda</Link></li>
                <li aria-hidden="true">/</li>
                <li className="text-white font-medium">{service.navLabel}</li>
              </ol>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-5">
              {service.h1}
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">{service.tagline}</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/create"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition inline-flex items-center justify-center gap-2"
              >
                Ajukan Sekarang
              </Link>
              <a
                href={whatsappLink(`Halo Gadai Jogja, saya ingin ${service.navLabel.toLowerCase()}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-700 transition inline-flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-5 h-5" />
                Tanya Taksiran
              </a>
            </div>
          </div>
        </section>

        {/* Intro + image */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-2 gap-10 items-start">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Cara {service.navLabel} di Gadai Jogja
              </h2>
              {service.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 40)} className="text-gray-600 leading-relaxed">{paragraph}</p>
              ))}
            </div>
            <div className="relative h-72 md:h-96 rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={service.image}
                alt={service.imageAlt}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>

        {/* Brands */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 text-center">
              {service.brandsHeading}
            </h2>
            <ul className="flex flex-wrap justify-center gap-3">
              {service.brands.map((brand) => (
                <li
                  key={brand}
                  className="bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2 rounded-full shadow-sm"
                >
                  {brand}
                </li>
              ))}
            </ul>
            <p className="text-center text-gray-500 text-sm mt-6">
              Tidak menemukan tipe Anda? Tetap tanyakan via WhatsApp, banyak unit di luar daftar ini juga kami terima.
            </p>
          </div>
        </section>

        {/* Requirements */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              Syarat {service.navLabel}
            </h2>
            <ul className="space-y-3">
              {service.requirements.map((requirement) => (
                <li key={requirement} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-600">{requirement}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Highlights */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
              Kenapa {service.navLabel} di Sini?
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {service.highlights.map((highlight) => (
                <div key={highlight.title} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
                  <div className={`w-10 h-10 ${service.accent} rounded-xl mb-4`}></div>
                  <h3 className="font-bold text-gray-900 mb-2">{highlight.title}</h3>
                  <p className="text-gray-600 text-sm">{highlight.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
              Alur {service.navLabel}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {STEPS.map((step) => (
                <div key={step.num} className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-3 shadow-lg shadow-blue-200">
                    {step.num}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-1 text-sm">{step.title}</h3>
                  <p className="text-gray-600 text-xs">{step.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-500 text-sm mt-8">
              Lokasi serah terima: {BUSINESS.streetAddress}, {BUSINESS.addressLocality}. Buka {OPENING_HOURS_DISPLAY.toLowerCase()}.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-3xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
              FAQ {service.navLabel}
            </h2>
            <FaqAccordion faqs={service.faqs} />
          </div>
        </section>

        {/* Other services */}
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
              Layanan Gadai Lainnya
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {otherServices.map((item) => (
                <Link
                  key={item.slug}
                  href={`/${item.slug}`}
                  className="group relative h-40 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all"
                >
                  <Image
                    src={item.image}
                    alt={item.imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                  <span className="absolute bottom-4 left-4 text-white font-bold">{item.navLabel}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Siap {service.navLabel}?
            </h2>
            <p className="text-blue-100 mb-8 text-lg">
              Kirim foto unit Anda sekarang, taksiran keluar sebelum Anda berangkat ke lokasi.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/create"
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition shadow-xl inline-flex items-center justify-center"
              >
                Isi Form Pengajuan
              </Link>
              <a
                href={whatsappLink(`Halo Gadai Jogja, saya ingin ${service.navLabel.toLowerCase()}`)}
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-700 px-8 py-4 rounded-xl font-semibold text-lg transition inline-flex items-center justify-center gap-2"
              >
                <WhatsAppIcon className="w-6 h-6" />
                Chat WhatsApp
              </a>
            </div>
          </div>
        </section>

        <a
          href={whatsappLink('Halo Gadai Jogja, saya ingin bertanya')}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat WhatsApp Gadai Jogja"
          className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <WhatsAppIcon className="w-8 h-8" />
        </a>

        <SiteFooter />
      </div>
    </>
  )
}
