import Link from 'next/link'
import type { Metadata } from 'next'
import BreadcrumbSchema from '@/components/BreadcrumbSchema'
import SiteFooter from '@/components/SiteFooter'
import SiteHeader from '@/components/SiteHeader'
import { BUSINESS } from '@/lib/business'

const pageUrl = `${BUSINESS.url}/syarat-ketentuan`

export const metadata: Metadata = {
  title: 'Syarat & Ketentuan',
  description:
    'Syarat dan ketentuan layanan gadai di Gadai Jogja: proses pengajuan, jasa gadai, masa berlaku, keterlambatan, dan prosedur lelang barang.',
  alternates: { canonical: pageUrl },
  openGraph: {
    title: `Syarat & Ketentuan | ${BUSINESS.name}`,
    description: 'Syarat dan ketentuan layanan gadai di Gadai Jogja.',
    url: pageUrl,
  },
}

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: '1. Ketentuan Umum',
    paragraphs: [
      'Syarat dan ketentuan ini berlaku untuk setiap transaksi gadai yang dilakukan melalui Gadai Jogja, baik pengajuan lewat WhatsApp maupun form di website ini. Dengan mengajukan gadai, nasabah dianggap telah membaca dan menyetujui ketentuan berikut.',
      'Gadai Jogja adalah usaha gadai perorangan, bukan lembaga keuangan berbadan hukum. Barang gadai disimpan langsung oleh pemilik usaha, bukan dititipkan ke pihak ketiga.',
    ],
  },
  {
    title: '2. Pengajuan & Verifikasi',
    paragraphs: [
      'Pengajuan dan taksiran awal dapat dilakukan secara online lewat WhatsApp atau form di website, dengan mengirimkan foto dan keterangan barang.',
      'Setelah harga disepakati, barang tetap harus diantar dan diserahkan langsung di lokasi kami untuk dicek dan ditaksir ulang secara fisik sebelum dana dicairkan. Nasabah wajib menunjukkan KTP asli untuk pencatatan akad gadai.',
      'Barang yang diajukan tidak boleh berstatus hasil kejahatan, sengketa, atau dalam keadaan terkunci/terblokir (misalnya akun iCloud, Mi Account, atau blokir IMEI untuk perangkat elektronik, atau STNK/BPKB bermasalah untuk kendaraan).',
    ],
  },
  {
    title: '3. Taksiran & Pencairan Dana',
    paragraphs: [
      'Nilai taksiran mengikuti kondisi fisik barang dan harga pasaran unit sejenis, dan dapat mencapai maksimal 85% dari harga pasaran tersebut. Nilai final ditentukan setelah pengecekan langsung di lokasi, dan dapat berbeda dari estimasi awal via WhatsApp.',
      'Dana pinjaman ditransfer ke rekening nasabah setelah barang diserahkan dan akad gadai disepakati kedua belah pihak.',
    ],
  },
  {
    title: '4. Jasa Gadai',
    paragraphs: [
      'Jasa gadai dikenakan sebesar 10% dari nilai pokok pinjaman untuk masa 2 minggu, atau 20% untuk masa 1 bulan. Jasa dihitung dari nilai pokok pinjaman, tanpa biaya admin atau biaya tersembunyi lainnya.',
    ],
  },
  {
    title: '5. Masa Gadai & Perpanjangan',
    paragraphs: [
      'Masa gadai dihitung sejak tanggal pencairan dana sesuai jangka waktu yang dipilih. Jika belum bisa menebus pada tanggal jatuh tempo, nasabah dapat memperpanjang masa gadai cukup dengan membayar jasa berjalan, tanpa perlu melunasi pokok pinjaman.',
    ],
  },
  {
    title: '6. Keterlambatan & Prosedur Lelang',
    paragraphs: [
      'Toleransi keterlambatan diberikan maksimal 3 hari setelah tanggal jatuh tempo. Selama masa toleransi, nasabah masih dapat menebus atau memperpanjang seperti biasa.',
      'Jika hingga batas toleransi tersebut nasabah tidak melakukan penebusan maupun perpanjangan jasa, dan tidak ada konfirmasi dari nasabah, barang gadai dianggap dilepaskan haknya dan berpotensi dilelang oleh Gadai Jogja untuk menutup nilai pokok pinjaman beserta jasa yang berjalan.',
      'Kami akan berupaya menghubungi nasabah melalui nomor yang terdaftar sebelum barang dilelang. Kelebihan hasil lelang di atas total kewajiban nasabah (jika ada) akan dikembalikan setelah nasabah dapat dihubungi dan mengonfirmasi data diri.',
    ],
  },
  {
    title: '7. Penitipan & Tanggung Jawab Barang',
    paragraphs: [
      'Selama masa gadai, barang disimpan di tempat penyimpanan milik Gadai Jogja dan tidak digunakan untuk kepentingan pribadi maupun disewakan ke pihak lain. Kendaraan (motor/mobil) diparkir 100% di lokasi kami dan tidak dioperasikan.',
      'Gadai Jogja bertanggung jawab menjaga keamanan barang selama masa gadai berlangsung sesuai kondisi saat diserahkan, di luar kerusakan akibat force majeure atau kondisi di luar kendali yang wajar.',
    ],
  },
  {
    title: '8. Penebusan Barang',
    paragraphs: [
      'Barang dapat ditebus kapan saja selama masa gadai maupun masa perpanjangan dengan membayar nilai pokok pinjaman ditambah jasa yang berjalan. Setelah pembayaran diterima, barang langsung diserahkan kembali kepada nasabah atau pihak yang diberi kuasa tertulis.',
    ],
  },
  {
    title: '9. Perubahan Ketentuan',
    paragraphs: [
      'Gadai Jogja dapat memperbarui syarat dan ketentuan ini sewaktu-waktu untuk penyesuaian layanan. Perubahan berlaku sejak dipublikasikan di halaman ini. Untuk transaksi yang sudah berjalan, ketentuan yang berlaku adalah yang disepakati pada saat akad gadai dibuat.',
    ],
  },
]

export default function SyaratKetentuanPage() {
  return (
    <>
      <BreadcrumbSchema
        items={[
          { name: 'Beranda', url: BUSINESS.url },
          { name: 'Syarat & Ketentuan', url: pageUrl },
        ]}
      />

      <div className="min-h-screen bg-white">
        <SiteHeader />

        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
          <div className="relative max-w-3xl mx-auto px-4 py-16 md:py-20 text-center">
            <nav aria-label="Breadcrumb" className="mb-6 flex justify-center">
              <ol className="flex items-center gap-2 text-sm text-blue-200">
                <li><Link href="/" className="hover:text-white transition">Beranda</Link></li>
                <li aria-hidden="true">/</li>
                <li className="text-white font-medium">Syarat & Ketentuan</li>
              </ol>
            </nav>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-5">Syarat & Ketentuan</h1>
            <p className="text-lg text-blue-100 max-w-2xl mx-auto">
              Ketentuan berikut berlaku untuk setiap transaksi gadai di Gadai Jogja, baik pengajuan online maupun serah terima langsung di lokasi kami.
            </p>
          </div>
        </section>

        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4">
            {SECTIONS.map((section) => (
              <div key={section.title} className="mb-10 last:mb-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">{section.title}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-gray-600 leading-relaxed mb-3 last:mb-0">
                    {paragraph}
                  </p>
                ))}
              </div>
            ))}

            <p className="text-gray-500 text-sm mt-12 pt-8 border-t border-gray-100">
              Ada pertanyaan soal ketentuan di atas? Hubungi kami lewat{' '}
              <a href={`https://wa.me/${BUSINESS.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium">
                WhatsApp {BUSINESS.phoneDisplay}
              </a>{' '}
              sebelum mengajukan gadai.
            </p>
          </div>
        </section>

        <SiteFooter />
      </div>
    </>
  )
}
