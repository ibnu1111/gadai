import type { Metadata } from 'next'
import { BUSINESS } from './business'

export type ServiceFaq = {
  question: string
  answer: string
}

export type ServiceContent = {
  slug: string
  /** Short label used in nav lists and "layanan lainnya" cards. */
  navLabel: string
  /** Metadata title (the root layout appends " | Gadai Jogja"). */
  title: string
  metaDescription: string
  h1: string
  tagline: string
  intro: string[]
  image: string
  imageAlt: string
  /** Tailwind classes for the accent badge, matching the homepage service card colours. */
  accent: string
  brandsHeading: string
  brands: string[]
  requirements: string[]
  highlights: { title: string; desc: string }[]
  faqs: ServiceFaq[]
}

const HANDOVER_NOTE =
  'Pengajuan dan taksiran awal bisa dilakukan online lewat WhatsApp atau form di website. Setelah harga disepakati, unit diantar ke tempat kami di Wedomartani, Ngemplak, Sleman untuk dicek langsung, lalu dana ditransfer ke rekening Anda.'

export const SERVICES: ServiceContent[] = [
  {
    slug: 'gadai-hp',
    navLabel: 'Gadai HP',
    title: 'Gadai HP & iPhone Jogja - Cair 15 Menit',
    metaDescription:
      'Gadai HP iPhone, Samsung, Xiaomi, OPPO & vivo di Jogja. Taksiran hingga 85% harga pasaran, jasa 10% per 2 minggu, dana cair 15 menit di tempat kami.',
    h1: 'Gadai HP di Jogja',
    tagline:
      'iPhone, Samsung, Xiaomi, OPPO, vivo, realme dan merek lain. Taksiran mengikuti harga pasaran unit bekas, dana cair 15 menit.',
    intro: [
      'Punya HP yang sudah jarang dipakai tapi masih berfungsi baik? Daripada dijual dan hilang selamanya, gadaikan saja. Di Gadai Jogja, HP Anda ditaksir mengikuti harga pasaran unit bekas dengan tipe dan kondisi yang sama, bukan harga asal, sehingga nilai pinjaman bisa mencapai 85% dari harga pasaran.',
      HANDOVER_NOTE,
      'Selama masa gadai, HP disimpan dalam kondisi mati di tempat penyimpanan kami dan tidak dipakai oleh siapa pun. Unit hanya dikeluarkan saat Anda menebusnya.',
    ],
    image: '/images/4.jpeg',
    imageAlt: 'Layanan gadai HP di Gadai Jogja',
    accent: 'bg-blue-500',
    brandsHeading: 'Merek HP yang Kami Terima',
    brands: [
      'iPhone (semua seri)',
      'Samsung Galaxy S, Z & A Series',
      'Xiaomi, POCO & Redmi',
      'OPPO & OnePlus',
      'vivo & iQOO',
      'realme',
      'Infinix & Tecno',
      'ASUS ROG Phone',
    ],
    requirements: [
      'HP menyala normal dan bisa dioperasikan: layar, tombol, kamera, dan jaringan berfungsi.',
      'Akun iCloud, Mi Account, atau akun Google sudah di-logout sebelum serah terima.',
      'KTP asli pemilik untuk pencatatan akad gadai.',
      'Kelengkapan seperti dus, charger, dan nota pembelian menaikkan nilai taksiran, tapi bukan syarat wajib.',
      'Unit bukan barang hasil kejahatan dan tidak dalam status blokir IMEI.',
    ],
    highlights: [
      { title: 'Taksiran Hingga 85%', desc: 'Nilai taksir mengikuti harga pasaran unit bekas yang sedang berlaku.' },
      { title: 'Jasa 10% per 2 Minggu', desc: 'Terima utuh tanpa potongan, tanpa biaya admin atau biaya tersembunyi.' },
      { title: 'Unit & Data Aman', desc: 'HP disimpan dalam kondisi mati di penyimpanan kami dan tidak dioperasikan.' },
      { title: 'Bisa Diperpanjang', desc: 'Belum bisa menebus? Cukup bayar jasanya untuk memperpanjang masa gadai.' },
    ],
    faqs: [
      {
        question: 'Berapa nilai gadai HP saya?',
        answer:
          'Nilai taksiran mengikuti harga pasaran unit bekas dengan tipe, kapasitas, dan kondisi yang sama, dan bisa mencapai 85% dari harga tersebut. Kirim foto beserta tipe HP Anda via WhatsApp untuk mendapat estimasi sebelum datang ke lokasi.',
      },
      {
        question: 'Berapa lama masa gadai HP dan bisakah diperpanjang?',
        answer:
          'Masa gadai dihitung per 2 minggu dengan jasa 10%. Jika belum bisa menebus di akhir periode, cukup bayar jasanya untuk memperpanjang, dengan toleransi keterlambatan 3 hari.',
      },
      {
        question: 'Apakah akun iCloud atau Mi Account harus dilepas?',
        answer:
          'Ya, wajib. Akun iCloud, Mi Account, maupun akun Google harus di-logout sebelum serah terima. HP yang masih terkunci akun tidak bisa ditaksir karena statusnya tidak bisa diverifikasi.',
      },
      {
        question: 'HP tanpa dus dan charger apakah tetap diterima?',
        answer:
          'Tetap diterima. Kelengkapan hanya memengaruhi besar nilai taksiran, bukan syarat wajib. HP tanpa dus tetap bisa digadaikan dengan taksiran yang menyesuaikan.',
      },
      {
        question: 'Apakah HP saya dipakai selama masa gadai?',
        answer:
          'Tidak. Unit disimpan dalam kondisi mati di tempat penyimpanan kami dan hanya dikeluarkan pada saat Anda menebus atau memperpanjang masa gadai.',
      },
    ],
  },
  {
    slug: 'gadai-laptop',
    navLabel: 'Gadai Laptop',
    title: 'Gadai Laptop & MacBook Jogja - Cair 15 Menit',
    metaDescription:
      'Gadai laptop MacBook, ASUS, Lenovo, Acer & HP di Jogja. Taksiran hingga 85% harga pasaran, jasa 10% per 2 minggu, dana cair 15 menit di tempat kami.',
    h1: 'Gadai Laptop di Jogja',
    tagline:
      'MacBook, ASUS, Lenovo, Acer, HP, Dell hingga laptop gaming. Taksiran tinggi, proses 15 menit, unit disimpan aman.',
    intro: [
      'Laptop menganggur bisa jadi sumber dana cepat tanpa harus dilepas permanen. Gadai Jogja menerima laptop kerja, laptop kuliah, sampai laptop gaming dan workstation, dengan nilai taksir mengikuti harga pasaran unit bekas sesuai spesifikasi dan kondisinya.',
      HANDOVER_NOTE,
      'Laptop disimpan dalam kondisi mati selama masa gadai. Kami sarankan Anda mem-backup data penting sebelum serah terima karena unit tidak akan dioperasikan oleh tim kami.',
    ],
    image: '/images/6.jpeg',
    imageAlt: 'Layanan gadai laptop di Gadai Jogja',
    accent: 'bg-purple-500',
    brandsHeading: 'Merek Laptop yang Kami Terima',
    brands: [
      'MacBook Air & MacBook Pro',
      'ASUS & ASUS ROG',
      'Lenovo & ThinkPad',
      'Acer & Predator',
      'HP Pavilion, Envy & Victus',
      'Dell & Alienware',
      'MSI',
      'Axioo & merek lokal lainnya',
    ],
    requirements: [
      'Laptop menyala normal, layar dan keyboard berfungsi, tidak mati total.',
      'Password BIOS dinonaktifkan, serta Find My Mac atau akun Windows/Apple sudah logout.',
      'Charger asli disertakan saat serah terima.',
      'KTP asli pemilik untuk pencatatan akad gadai.',
      'Nota pembelian, dus, atau kartu garansi menaikkan nilai taksiran.',
    ],
    highlights: [
      { title: 'Nilai Sesuai Spesifikasi', desc: 'Prosesor, RAM, penyimpanan, dan kartu grafis ikut diperhitungkan dalam taksiran.' },
      { title: 'Jasa 10% per 2 Minggu', desc: 'Dana diterima utuh, tanpa potongan admin di awal.' },
      { title: 'Penyimpanan Terjaga', desc: 'Unit disimpan dalam kondisi mati di tempat penyimpanan kami selama masa gadai.' },
      { title: 'Tebus Kapan Saja', desc: 'Tidak ada penalti pelunasan lebih awal, bayar pokok plus jasa berjalan.' },
    ],
    faqs: [
      {
        question: 'Laptop merek dan spesifikasi apa saja yang diterima?',
        answer:
          'Kami menerima hampir semua merek populer seperti MacBook, ASUS, Lenovo, Acer, HP, Dell, dan MSI. Semakin baru generasinya dan semakin tinggi spesifikasinya, semakin tinggi pula nilai taksirannya.',
      },
      {
        question: 'Apakah MacBook harus logout iCloud dan mematikan Find My Mac?',
        answer:
          'Ya. Find My Mac dan Apple ID harus dinonaktifkan sebelum serah terima, sama seperti password BIOS pada laptop Windows. Unit yang masih terkunci tidak bisa ditaksir.',
      },
      {
        question: 'Apakah laptop gaming nilainya lebih tinggi?',
        answer:
          'Umumnya ya, karena laptop gaming dengan kartu grafis diskrit memiliki harga pasaran bekas yang lebih tinggi. Taksiran final tetap ditentukan setelah unit dicek langsung.',
      },
      {
        question: 'Bagaimana dengan data pribadi di laptop saya?',
        answer:
          'Unit disimpan dalam kondisi mati dan tidak dioperasikan selama masa gadai. Meski begitu, kami tetap menyarankan Anda mem-backup dan menghapus data sensitif sebelum serah terima.',
      },
      {
        question: 'Laptop dengan baterai bocor atau layar bergaris masih bisa digadaikan?',
        answer:
          'Bisa, selama laptop masih menyala dan bisa dioperasikan. Kerusakan minor akan memengaruhi nilai taksiran, sementara unit yang mati total tidak dapat kami terima.',
      },
    ],
  },
  {
    slug: 'gadai-motor',
    navLabel: 'Gadai Motor',
    title: 'Gadai Motor Jogja - Bisa Tanpa BPKB',
    metaDescription:
      'Gadai motor Honda, Yamaha, Suzuki & Kawasaki di Jogja, bisa tanpa BPKB. Unit parkir aman di tempat kami, jasa 10% per 2 minggu, dana cair 15 menit.',
    h1: 'Gadai Motor di Jogja',
    tagline:
      'Honda, Yamaha, Suzuki, Kawasaki. Bisa dengan atau tanpa BPKB, unit diparkir 100% di tempat kami selama masa gadai.',
    intro: [
      'Gadai Jogja menerima gadai motor dengan skema unit masuk, artinya motor Anda menjadi jaminan fisik dan diparkir di tempat kami selama masa gadai. Karena unitnya yang menjadi jaminan, kami tetap bisa memproses motor tanpa BPKB selama STNK aktif dan identitas pemilik jelas.',
      HANDOVER_NOTE,
      'Skema ini berbeda dengan gadai BPKB di leasing yang membiarkan motor tetap Anda pakai. Konsekuensinya nilai taksir bisa lebih tinggi dan prosesnya jauh lebih cepat, tapi unit tidak bisa dibawa pulang sampai ditebus.',
    ],
    image: '/images/7.jpeg',
    imageAlt: 'Layanan gadai motor di Gadai Jogja',
    accent: 'bg-green-500',
    brandsHeading: 'Motor yang Kami Terima',
    brands: [
      'Honda Beat, Vario, PCX & Scoopy',
      'Yamaha NMAX, Aerox, Mio & Fazzio',
      'Suzuki Nex, Address & Satria',
      'Kawasaki',
      'Motor matic, bebek & sport',
      'Motor listrik (kondisional)',
    ],
    requirements: [
      'STNK aktif dan pajak tahun berjalan masih hidup.',
      'KTP asli pemilik. Jika STNK berbeda nama, sertakan kuitansi atau bukti jual beli.',
      'Unit dalam kondisi hidup dan layak jalan.',
      'Unit diparkir 100% di tempat kami selama masa gadai dan tidak bisa dibawa pulang.',
    ],
    highlights: [
      { title: 'Bisa Tanpa BPKB', desc: 'Cukup STNK aktif dan identitas pemilik yang jelas, karena unit fisik yang menjadi jaminan.' },
      { title: 'Taksiran Kompetitif', desc: 'Nilai mengikuti harga pasaran motor bekas sesuai tipe, tahun, dan kondisi unit.' },
      { title: 'Parkir Terlindung', desc: 'Unit disimpan di area parkir tertutup milik kami dan tidak digunakan.' },
      { title: 'Perpanjang Mudah', desc: 'Cukup bayar jasa untuk memperpanjang tanpa perlu memindahkan unit.' },
    ],
    faqs: [
      {
        question: 'Apakah bisa gadai motor tanpa BPKB di Jogja?',
        answer:
          'Bisa. Kami menerima gadai motor dengan STNK saja selama pajak masih hidup dan identitas serta kepemilikan pemilik jelas. Karena jaminannya adalah unit fisik, motor diparkir 100% di tempat kami selama masa gadai.',
      },
      {
        question: 'Apakah motor tetap bisa saya pakai selama digadaikan?',
        answer:
          'Tidak. Berbeda dengan gadai BPKB di leasing, di sini unit fisik yang menjadi jaminan sehingga motor diparkir di tempat kami sampai Anda menebusnya.',
      },
      {
        question: 'Berapa lama masa gadai motor dan bisakah diperpanjang?',
        answer:
          'Masa gadai dihitung per 2 minggu dengan jasa 10%. Jika belum bisa menebus, Anda cukup membayar jasanya untuk memperpanjang dan unit tetap tersimpan di tempat kami. Tersedia juga toleransi keterlambatan 3 hari.',
      },
      {
        question: 'Bagaimana jika STNK atas nama orang lain?',
        answer:
          'Masih memungkinkan selama Anda bisa menunjukkan bukti kepemilikan seperti kuitansi atau bukti jual beli, disertai KTP asli Anda. Silakan konfirmasi kondisinya lebih dulu via WhatsApp.',
      },
      {
        question: 'Bagaimana keamanan motor selama masa gadai?',
        answer:
          'Unit disimpan di area parkir kami yang terlindung dan diawasi, tidak dipakai untuk keperluan apa pun, dan hanya dikeluarkan saat proses tebus.',
      },
    ],
  },
  {
    slug: 'gadai-mobil',
    navLabel: 'Gadai Mobil',
    title: 'Gadai Mobil Jogja - Cair Cepat & Aman',
    metaDescription:
      'Gadai mobil Avanza, Xenia, Brio, Agya & lainnya di Jogja. Unit diparkir aman di tempat kami, jasa 10% per 2 minggu, taksiran langsung di lokasi.',
    h1: 'Gadai Mobil di Jogja',
    tagline:
      'Taksiran langsung di lokasi, unit diparkir aman di tempat kami, dana ditransfer ke rekening Anda.',
    intro: [
      'Untuk kebutuhan dana yang lebih besar, Gadai Jogja menerima gadai mobil dengan skema unit masuk. Mobil Anda menjadi jaminan fisik dan diparkir di tempat kami, sehingga nilai taksiran bisa jauh lebih tinggi dibanding skema gadai surat.',
      HANDOVER_NOTE,
      'Karena nilainya besar, taksiran final untuk mobil selalu dilakukan setelah unit dan dokumennya dicek langsung. Estimasi awal tetap bisa Anda dapatkan lewat WhatsApp dengan mengirim foto, tipe, tahun, dan kondisi kendaraan.',
    ],
    image: '/images/8.jpeg',
    imageAlt: 'Layanan gadai mobil di Gadai Jogja',
    accent: 'bg-orange-500',
    brandsHeading: 'Mobil yang Kami Terima',
    brands: [
      'Toyota Avanza, Agya, Calya & Innova',
      'Daihatsu Xenia, Ayla & Sigra',
      'Honda Brio, Mobilio & Jazz',
      'Suzuki Ertiga & Carry',
      'Mitsubishi Xpander',
      'Mobil niaga & pikap',
    ],
    requirements: [
      'STNK dan BPKB asli dengan kepemilikan yang jelas.',
      'Pajak kendaraan tahun berjalan masih hidup.',
      'KTP asli pemilik. Jika berbeda nama, sertakan kuitansi atau bukti jual beli bermeterai.',
      'Unit diparkir 100% di tempat kami selama masa gadai.',
    ],
    highlights: [
      { title: 'Plafon Lebih Besar', desc: 'Nilai taksiran mobil memungkinkan pinjaman jauh di atas gadai elektronik.' },
      { title: 'Jasa 10% per 2 Minggu', desc: 'Struktur biaya yang sama dan transparan, tertulis di bukti gadai.' },
      { title: 'Parkir Diawasi', desc: 'Mobil disimpan di area parkir kami dan tidak digunakan selama masa gadai.' },
      { title: 'Taksiran Terbuka', desc: 'Perhitungan taksiran dijelaskan langsung sebelum Anda memutuskan.' },
    ],
    faqs: [
      {
        question: 'Berapa nilai taksiran mobil saya?',
        answer:
          'Taksiran mengikuti harga pasaran mobil bekas sesuai tipe, tahun, kilometer, dan kondisi unit. Kirim data dan foto kendaraan via WhatsApp untuk estimasi awal, taksiran final ditentukan saat unit dicek di lokasi.',
      },
      {
        question: 'Apakah mobil tetap bisa dipakai selama digadaikan?',
        answer:
          'Tidak. Skema kami adalah gadai unit masuk, sehingga mobil diparkir di tempat kami selama masa gadai dan hanya dikeluarkan saat proses tebus.',
      },
      {
        question: 'Berapa lama masa gadai mobil dan bisakah diperpanjang?',
        answer:
          'Masa gadai dihitung per 2 minggu dengan jasa 10%. Bila belum bisa menebus di akhir periode, cukup bayar jasanya untuk memperpanjang, dengan toleransi keterlambatan 3 hari.',
      },
      {
        question: 'Apakah taksiran mobil bisa dilakukan sepenuhnya online?',
        answer:
          'Estimasi awal bisa lewat foto dan data unit via WhatsApp, tetapi taksiran final dan pencairan tetap dilakukan setelah mobil beserta dokumennya dicek langsung di tempat kami.',
      },
      {
        question: 'Bagaimana keamanan mobil selama masa gadai?',
        answer:
          'Unit disimpan di area parkir kami yang diawasi, tidak dipakai untuk keperluan apa pun, dan kondisinya dicatat saat serah terima sebagai acuan ketika ditebus.',
      },
    ],
  },
  {
    slug: 'gadai-smartwatch',
    navLabel: 'Gadai Smartwatch',
    title: 'Gadai Smartwatch Jogja - Apple Watch & Galaxy',
    metaDescription:
      'Gadai smartwatch Apple Watch, Samsung Galaxy Watch, Garmin & Amazfit di Jogja. Proses 15 menit, jasa 10% per 2 minggu, unit disimpan aman.',
    h1: 'Gadai Smartwatch di Jogja',
    tagline:
      'Apple Watch, Galaxy Watch, Garmin, Amazfit dan merek lain. Proses cepat, unit disimpan aman di tempat kami.',
    intro: [
      'Smartwatch yang sudah jarang dipakai tetap punya nilai jual yang baik, terutama seri Apple Watch dan Galaxy Watch. Gadai Jogja menerimanya sebagai jaminan gadai dengan proses yang sama cepatnya dengan gadai HP.',
      HANDOVER_NOTE,
      'Karena ukurannya kecil dan mudah rusak, unit smartwatch disimpan terpisah dalam penyimpanan khusus dan kondisinya dicatat saat serah terima.',
    ],
    image: '/images/2.jpeg',
    imageAlt: 'Layanan gadai smartwatch di Gadai Jogja',
    accent: 'bg-pink-500',
    brandsHeading: 'Smartwatch yang Kami Terima',
    brands: [
      'Apple Watch (semua seri)',
      'Samsung Galaxy Watch',
      'Garmin',
      'Amazfit',
      'Huawei Watch',
      'Merek lain (kondisional)',
    ],
    requirements: [
      'Unit menyala normal dan layar sentuh berfungsi.',
      'Activation Lock dilepas serta Apple ID, Samsung Account, atau akun Garmin sudah logout dan unpair.',
      'Charger disertakan saat serah terima.',
      'KTP asli pemilik untuk pencatatan akad gadai.',
      'Dus dan strap original menaikkan nilai taksiran.',
    ],
    highlights: [
      { title: 'Proses 15 Menit', desc: 'Alur dan kecepatan yang sama dengan gadai HP, tanpa antre panjang.' },
      { title: 'Jasa 10% per 2 Minggu', desc: 'Dana diterima utuh tanpa potongan biaya admin.' },
      { title: 'Penyimpanan Khusus', desc: 'Unit kecil disimpan terpisah dan kondisinya dicatat saat serah terima.' },
      { title: 'Tanpa Biaya Tersembunyi', desc: 'Semua rincian tertulis jelas di bukti gadai elektronik.' },
    ],
    faqs: [
      {
        question: 'Smartwatch merek apa saja yang diterima?',
        answer:
          'Kami menerima Apple Watch, Samsung Galaxy Watch, Garmin, Amazfit, dan Huawei Watch. Merek di luar itu masih mungkin diterima, tergantung harga pasaran unit bekasnya.',
      },
      {
        question: 'Apakah Activation Lock Apple Watch harus dilepas?',
        answer:
          'Ya. Apple Watch harus di-unpair dari iPhone dan Activation Lock dinonaktifkan sebelum serah terima, karena unit yang masih terkunci akun tidak bisa ditaksir.',
      },
      {
        question: 'Berapa nilai gadai smartwatch?',
        answer:
          'Nilai mengikuti harga pasaran unit bekas sesuai seri, ukuran, dan kondisi. Kirim foto dan tipe unit via WhatsApp untuk mendapat estimasi sebelum datang.',
      },
      {
        question: 'Smartwatch dengan strap non-original apakah tetap diterima?',
        answer:
          'Tetap diterima. Strap non-original hanya sedikit memengaruhi nilai taksiran dan bukan alasan penolakan.',
      },
      {
        question: 'Apakah bisa gadai smartwatch tanpa dus?',
        answer:
          'Bisa. Dus dan kelengkapan hanya menambah nilai taksiran, sementara charger tetap kami minta disertakan agar unit bisa diuji saat pengecekan.',
      },
    ],
  },
]

export function getService(slug: string): ServiceContent {
  const service = SERVICES.find((item) => item.slug === slug)
  if (!service) {
    throw new Error(`Unknown service slug: ${slug}`)
  }
  return service
}

/** Per-page metadata for a service landing page (root layout appends " | Gadai Jogja"). */
export function serviceMetadata(service: ServiceContent): Metadata {
  const url = `${BUSINESS.url}/${service.slug}`
  return {
    title: service.title,
    description: service.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: `${service.title} | ${BUSINESS.name}`,
      description: service.metaDescription,
      url,
    },
  }
}
