import Image from 'next/image'
import Link from 'next/link'
import WhatsAppIcon from './WhatsAppIcon'
import { ADDRESS_LINES, BUSINESS, OPENING_HOURS_DISPLAY } from '@/lib/business'
import { SERVICES } from '@/lib/services'

// Shared across the homepage and every service landing page. The visible NAP here
// must stay identical to the JSON-LD and to the Google Business Profile listing.
export default function SiteFooter() {
  return (
    <footer className="bg-gray-900 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo-gadai.png" alt="Gadai Jogja" width={40} height={40} className="h-10 w-auto" />
            </div>
            <p className="text-gray-400 text-sm">
              Gadai HP, laptop, motor & mobil terpercaya di Yogyakarta. Pengajuan online, serah terima unit di tempat kami. Jasa 10% per 2 minggu, tanpa biaya tersembunyi.
            </p>
          </div>
          <div>
            <h2 className="font-bold text-white mb-4">Layanan</h2>
            <ul className="space-y-2 text-gray-400 text-sm">
              {SERVICES.map((service) => (
                <li key={service.slug}>
                  <Link href={`/${service.slug}`} className="hover:text-white transition">{service.navLabel}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-bold text-white mb-4">Kontak & Lokasi</h2>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="flex items-center gap-2">
                <WhatsAppIcon className="w-4 h-4 flex-shrink-0" />
                {BUSINESS.phoneDisplay}
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {BUSINESS.email}
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <address className="not-italic">
                  {ADDRESS_LINES.map((line) => (
                    <span key={line} className="block">{line}</span>
                  ))}
                </address>
              </li>
              <li className="flex items-center gap-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {OPENING_HOURS_DISPLAY}
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} {BUSINESS.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
