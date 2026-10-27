import { Prisma } from '@prisma/client'
import { hitungPersentaseDariFee } from '@/lib/ubahDataGadai'

export type JenisPinjaman = 'GADAI' | 'DAPIN'

export interface HasilMigrasi {
  jenis: JenisPinjaman
  gadaiID: number | null
  pesan: string
}

/**
 * Pindahkan klasifikasi pinjaman antara GADAI dan DAPIN, sekaligus memindahkan
 * datanya supaya tidak ada yang tertinggal di tabel yang salah.
 *
 * DAPIN -> GADAI: dibuat record Gadai baru yang datanya diambil dari Pinjaman
 * (nominal, total bunga, tanggal jatuh tempo, nama barang) lalu Pinjaman
 * ditautkan ke Gadai itu.
 *
 * GADAI -> DAPIN: data Gadai disalin ke Pinjaman (nama barang, catatan asal),
 * lalu record Gadai beserta payment-nya dihapus dan tautannya dilepas. Riwayat
 * pembayaran tetap tersimpan di Siklus.nominalDibayar.
 *
 * WAJIB dipanggil di dalam prisma.$transaction.
 */
export async function migrasiJenisPinjaman(
  tx: Prisma.TransactionClient,
  pinjamanId: number,
  jenisTujuan: JenisPinjaman
): Promise<HasilMigrasi | { error: string; status: number }> {
  const pinjaman = await tx.pinjaman.findUnique({
    where: { id: pinjamanId },
    include: {
      siklus: { orderBy: { siklusKe: 'asc' } },
      gadai: {
        include: {
          payments: true,
          extensions: { select: { gadaiID: true } }
        }
      }
    }
  })

  if (!pinjaman) return { error: 'Pinjaman tidak ditemukan', status: 404 }

  const jenisSekarang = pinjaman.jenis as JenisPinjaman
  if (jenisSekarang === jenisTujuan) {
    return {
      jenis: jenisSekarang,
      gadaiID: pinjaman.gadaiID,
      pesan: `Pinjaman sudah bertipe ${jenisTujuan}`
    }
  }

  if (jenisTujuan === 'GADAI') {
    // --- DAPIN -> GADAI ---------------------------------------------------
    if (pinjaman.gadai) {
      // Sudah ada record Gadai tertaut: cukup samakan jenis & nama barangnya.
      await tx.pinjaman.update({
        where: { id: pinjamanId },
        data: {
          jenis: 'GADAI',
          namaBarang: pinjaman.namaBarang?.trim() || pinjaman.gadai.namaBarang
        }
      })
      return {
        jenis: 'GADAI',
        gadaiID: pinjaman.gadai.gadaiID,
        pesan: `Pinjaman ditandai sebagai gadai dan ditautkan ke gadai #${pinjaman.gadai.gadaiID}`
      }
    }

    const siklusTerakhir = pinjaman.siklus.at(-1)
    // Fee = bunga siklus yang sedang berjalan, bukan jumlah seluruh siklus;
    // penjumlahan akan jauh melebihi nominal pokok untuk pinjaman yang sudah
    // diperpanjang beberapa kali.
    const fee = siklusTerakhir?.nominalBunga ?? new Prisma.Decimal(0)
    // Total pembayaran = nominal siklus terakhir yang sudah dibayar (pokok +
    // bunga). Pakai ini, bukan jumlah semua siklus, supaya "Sisa Tagihan" di
    // halaman gadai tidak jadi negatif untuk pinjaman yang sudah lunas.
    const totalDibayar = siklusTerakhir?.nominalDibayar ?? new Prisma.Decimal(0)
    const tanggalKembali = siklusTerakhir?.tanggalJatuhTempo ?? pinjaman.tanggalSelesai ?? pinjaman.tanggalCair
    const namaBarang = pinjaman.namaBarang?.trim() || 'Tanpa jaminan'

    const gadaiBaru = await tx.gadai.create({
      data: {
        customerID: pinjaman.customerID,
        kategoriBarang: tebakKategoriBarang(namaBarang),
        namaBarang,
        nominalPinjam: pinjaman.pokok,
        bungaPersentase: new Prisma.Decimal(
          hitungPersentaseDariFee(Number(pinjaman.pokok), Number(fee)).toFixed(2)
        ),
        fee,
        tanggalPinjam: pinjaman.tanggalCair,
        tanggalKembali,
        atributTinggal: '-',
        deskripsi: pinjaman.catatan,
        status: statusGadaiDariPinjaman(pinjaman.status),
        totalPembayaran: totalDibayar,
        createdBy: 'Migrasi DAPIN ke GADAI'
      }
    })

    await tx.pinjaman.update({
      where: { id: pinjamanId },
      data: { jenis: 'GADAI', gadaiID: gadaiBaru.gadaiID }
    })

    return {
      jenis: 'GADAI',
      gadaiID: gadaiBaru.gadaiID,
      pesan: `Data dipindahkan ke gadai #${gadaiBaru.gadaiID}`
    }
  }

  // --- GADAI -> DAPIN ------------------------------------------------------
  const gadai = pinjaman.gadai
  if (!gadai) {
    // Tidak ada record Gadai tertaut: cukup ubah jenisnya.
    await tx.pinjaman.update({
      where: { id: pinjamanId },
      data: { jenis: 'DAPIN' }
    })
    return {
      jenis: 'DAPIN',
      gadaiID: null,
      pesan: 'Pinjaman ditandai sebagai pinjaman biasa (dapin)'
    }
  }

  const asalGadai = gadai.namaBarang ? ` (${gadai.namaBarang})` : ''
  const catatanBaru = [
    pinjaman.catatan?.trim(),
    `Migrasi dari gadai #${gadai.gadaiID}${asalGadai}`
  ]
    .filter(Boolean)
    .join(' - ')

  // Putuskan anak perpanjangan lebih dulu supaya penghapusan Gadai induk tidak
  // gagal karena masih direferensikan.
  if (gadai.extensions.length > 0) {
    await tx.gadai.updateMany({
      where: { gadaiID: { in: gadai.extensions.map((e) => e.gadaiID) } },
      data: { parentGadaiID: gadai.parentGadaiID }
    })
  }

  await tx.pinjaman.update({
    where: { id: pinjamanId },
    data: {
      jenis: 'DAPIN',
      gadaiID: null,
      namaBarang: pinjaman.namaBarang?.trim() || gadai.namaBarang,
      catatan: catatanBaru || null
    }
  })

  await tx.payment.deleteMany({ where: { gadaiID: gadai.gadaiID } })
  await tx.gadai.delete({ where: { gadaiID: gadai.gadaiID } })

  return {
    jenis: 'DAPIN',
    gadaiID: null,
    pesan: `Data gadai #${gadai.gadaiID} dipindahkan ke pinjaman biasa (dapin)`
  }
}

function statusGadaiDariPinjaman(status: string): string {
  switch (status) {
    case 'LUNAS':
      return 'LUNAS'
    case 'LELANG':
      return 'LELANG'
    case 'WRITEOFF':
      return 'WRITEOFF'
    default:
      return 'AKTIF'
  }
}

/**
 * Pinjaman hasil import lama menyimpan nama barang bebas (VARIO, PCX, LAPTOP,
 * ...) tanpa kategori. Saat dimigrasikan ke Gadai, kategori ditebak dari nama
 * barang supaya datanya tidak semuanya jadi "Lainnya".
 */
const MOTOR = [
  'VARIO', 'PCX', 'SUPRA', 'NMAX', 'BEAT', 'SKUPI', 'MIO', 'YAMAHA', 'HONDA',
  'SUZUKI', 'KAWASAKI', 'DUCATI', 'BMW', 'TIGER', 'VESPA', 'SCOOPY', 'RACING',
  'MOTOR', 'BEBEK', 'MATIC', 'GL', 'MAX', 'MINI', 'TRAIL', 'SPORT'
]
const MOBIL = ['MOBIL', 'CAR', 'AVANZA', 'XENIA', 'INNOVA', 'JAZZ', 'YARIS', 'PAJERO', 'AVEGAR']
const LAPTOP = ['LAPTOP', 'MACBOOK', 'NOTEBOOK', 'COMPUTER', 'PC', 'ASUS', 'LENOVO', 'HP BOOK']
const HP = ['HP', 'IPHONE', 'SAMSUNG', 'XIAOMI', 'REDMI', 'REALME', 'OPPO', 'VIVO']
const ELEKTRONIK = ['TV', 'KULKAS', 'MESIN CUCI', 'AC', 'AIR CONDITIONER', 'MICROWAVE', 'KOMPOR']
const PERHIASAN = ['EMAS', 'PERAK', 'BERLIAN', 'MUTIARA', 'PERHIASAN', 'GOLD']
const SMARTWATCH = ['SMARTWATCH', 'SMART WATCH', 'WATCH']

export function tebakKategoriBarang(namaBarang: string): string {
  const nama = namaBarang.toUpperCase()
  const cek = (daftar: string[]) => daftar.some((k) => nama.includes(k))

  if (cek(MOTOR)) return 'Motor'
  if (cek(MOBIL)) return 'Mobil'
  if (cek(SMARTWATCH)) return 'Elektronik'
  if (cek(LAPTOP)) return 'Laptop'
  if (cek(HP)) return 'HP'
  if (cek(ELEKTRONIK)) return 'Elektronik'
  if (cek(PERHIASAN)) return 'Perhiasan'
  return 'Lainnya'
}
