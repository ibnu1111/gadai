import Image from 'next/image'
import Link from 'next/link'
import WhatsAppIcon from './WhatsAppIcon'
import { whatsappLink } from '@/lib/business'

// Shared across the homepage and every service landing page. Section links are
// absolute (`/#layanan`) so they resolve correctly from any route.
export default function SiteHeader() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/logo-gadai.png" alt="Gadai Jogja" width={40} height={40} className="h-10 w-auto" priority />
            <span className="hidden sm:block text-xs text-gray-400">gadaijogja.com</span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/#layanan" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition">Layanan</Link>
            <Link href="/#cara-kerja" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition">Cara Kerja</Link>
            <Link href="/#wilayah" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition">Wilayah</Link>
            <Link href="/#faq" className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition">FAQ</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/track" className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-gray-600 hover:text-blue-600 font-medium">
              Lacak
            </Link>
            <a
              href={whatsappLink('Halo Gadai Jogja, saya ingin konsultasi')}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm transition shadow-lg shadow-blue-200 flex items-center gap-2"
            >
              <WhatsAppIcon className="w-4 h-4" />
              Hubungi Kami
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
