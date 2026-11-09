/**
 * Perbaiki data Qodri dan buat transaksi baru.
 *
 * Latar belakang: Qodri terdata dua kali sebagai customer terpisah.
 *   - customer 535 "qodri" (noHp IMPORT-00507) -> pinjaman 1246, STYLO 10jt,
 *     dicairkan 19 Agu 2026, siklus 1 sudah LUNAS (dibayar 15 Sep 2026).
 *     Tidak ada Gadai, tidak ada sumber dana, `nominalDibayar` kosong.
 *   - customer 572 "M Al Qodri" (noHp 6281233367346) -> gadai 52 + pinjaman
 *     1286, Motor Stylo CBS 160 6jt, dicairkan 26 Sep 2026, LUNAS 10 Okt 2026.
 *
 * Yang dilakukan:
 * 1. Gabungkan dua customer jadi satu: "M Al Qodri" (noHp 6281233367346).
 *    Customer 535 lama (import) dihapus setelah pinjamannya dipindahkan.
 * 2. Tutup pinjaman lama 1246 dengan benar: isi `nominalDibayar` dan
 *    `nominalAkhir` supaya konsisten dengan siklus yang sudah LUNAS.
 * 3. Buat transaksi baru: STYLO, pokok 10jt, bunga 10% (1jt), dicairkan
 *    31 Okt 2026, jatuh tempo 14 Nov 2026, didanai dari sumber dana Bagong.
 *
 * Idempoten: dijalankan dua kali tidak mengubah hasil akhir.
 *
 * Jalankan:
 *   node scripts/fix-qodri-transaksi.mjs
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const POKOK_BARU = 10_000_000
const BUNGA_PERSEN = 10
const TANGGAL_CAIR = new Date('2026-10-31T00:00:00.000Z')
const TANGGAL_KEMBALI = new Date('2026-11-14T00:00:00.000Z')
const NAMA_BARANG = 'STYLO'
const SUMBER_DANA = 'Bagong'

function hari(offset) {
  const d = new Date(TANGGAL_CAIR)
  d.setUTCDate(d.getUTCDate() + offset)
  return d
}

async function main() {
  // --- Cari customer & pinjaman lama -------------------------------------
  const lama = await prisma.customer.findFirst({
    where: { noHp: 'IMPORT-00507' },
    include: { pinjaman: { include: { siklus: { orderBy: { siklusKe: 'asc' } } } } }
  })
  const utama = await prisma.customer.findFirst({
    where: { noHp: '6281233367346' }
  })

  if (!utama) throw new Error('Customer "M Al Qodri" (6281233367346) tidak ditemukan')
  console.log(`customer utama: id=${utama.id} "${utama.nama}" ${utama.noHp}`)

  const pinjamanLama = lama?.pinjaman?.[0]
  if (!lama) {
    console.log('customer import sudah tidak ada, dilewati')
  } else {
    console.log(`customer lama: id=${lama.id} "${lama.nama}" ${lama.noHp}`)
  }

  // --- 1. Tutup pinjaman lama dengan benar --------------------------------
  if (pinjamanLama) {
    const siklus = pinjamanLama.siklus.at(-1)
    const pokok = pinjamanLama.pokok
    const bunga = siklus?.nominalBunga ?? 0
    const tagihan = pokok + bunga

    console.log(`\n[1] Menutup pinjaman ${pinjamanLama.id} (pokok=${pokok}, bunga=${bunga}, tagihan=${tagihan})`)

    await prisma.$transaction(async (tx) => {
      // Siklus: lengkapi nominalDibayar kalau kosong.
      if (siklus && !siklus.nominalDibayar) {
        await tx.siklus.update({
          where: { id: siklus.id },
          data: {
            nominalDibayar: tagihan,
            catatan: siklus.catatan || 'Pelunasan saat migrasi data Qodri'
          }
        })
        console.log(`    siklus ${siklus.id}: nominalDibayar diisi ${tagihan}`)
      }

      await tx.pinjaman.update({
        where: { id: pinjamanLama.id },
        data: {
          status: 'LUNAS',
          tanggalSelesai: siklus?.tanggalBayar ?? TANGGAL_CAIR,
          nominalAkhir: tagihan,
          catatan: [pinjamanLama.catatan, 'Migrasi data Qodri: digabung ke customer M Al Qodri']
            .filter(Boolean)
            .join(' - ')
        }
      })
      console.log(`    pinjaman ${pinjamanLama.id}: LUNAS, nominalAkhir=${tagihan}`)

      // Pindahkan ke customer utama supaya hanya ada satu customer Qodri.
      await tx.pinjaman.update({
        where: { id: pinjamanLama.id },
        data: { customerID: utama.id }
      })
      console.log(`    pinjaman ${pinjamanLama.id}: customerID -> ${utama.id}`)
    })
  }

  // --- 2. Hapus customer import yang sudah kosong -------------------------
  if (lama && lama.id !== utama.id) {
    const sisa = await prisma.pinjaman.count({ where: { customerID: lama.id } })
    const sisaGadai = await prisma.gadai.count({ where: { customerID: lama.id } })
    if (sisa === 0 && sisaGadai === 0) {
      await prisma.customer.delete({ where: { id: lama.id } })
      console.log(`\n[2] Customer import id=${lama.id} dihapus (sudah tidak punya transaksi)`)
    } else {
      console.log(`\n[2] Customer import id=${lama.id} TIDAK dihapus: masih ${sisa} pinjaman, ${sisaGadai} gadai`)
    }
  }

  // --- 3. Buat transaksi baru --------------------------------------------
  const sumberDana = await prisma.sumberDana.findUnique({ where: { nama: SUMBER_DANA } })
  if (!sumberDana) {
    throw new Error(`Sumber dana "${SUMBER_DANA}" belum ada. Jalankan seed-sumber-dana.mjs dulu.`)
  }

  // Idempoten: kalau sudah ada pinjaman STYLO 10jt yang dicairkan 31 Okt 2026
  // untuk customer ini, jangan buat lagi.
  const sudahAda = await prjamanCariBaru(utama.id)
  if (sudahAda) {
    console.log(`\n[3] Transaksi baru sudah ada (pinjaman ${sudahAda.id}), tidak dibuat ulang`)
  } else {
    const fee = (POKOK_BARU * BUNGA_PERSEN) / 100

  const dibuat = await prisma.$transaction(async (tx) => {
    const pinjaman = await tx.pinjaman.create({
        data: {
          customerID: utama.id,
          jenis: 'GADAI',
          namaBarang: NAMA_BARANG,
          pokok: POKOK_BARU,
          tanggalCair: TANGGAL_CAIR,
          status: 'AKTIF',
          dibuatOleh: 'Migrasi data Qodri',
          siklus: {
            create: {
              siklusKe: 1,
              tanggalMulai: TANGGAL_CAIR,
              tanggalJatuhTempo: TANGGAL_KEMBALI,
              nominalBunga: fee,
              dibuatOleh: 'Migrasi data Qodri'
            }
          },
          pendanaan: {
            create: {
              sumberDanaId: sumberDana.id,
              nominal: POKOK_BARU
            }
          }
        },
        include: { siklus: true, pendanaan: { include: { sumberDana: true } } }
      })

      // Gadai penyeimbang supaya detail gadai & surat perjanjian ikut ada.
      const gadai = await tx.gadai.create({
        data: {
          customerID: utama.id,
          kategoriBarang: 'Motor',
          namaBarang: NAMA_BARANG,
          nominalPinjam: POKOK_BARU,
          bungaPersentase: BUNGA_PERSEN,
          fee: fee,
          tanggalPinjam: TANGGAL_CAIR,
          tanggalKembali: TANGGAL_KEMBALI,
          atributTinggal: '-',
          deskripsi: 'Pinjaman motor STYLO - cair 31 Oktober 2026, jatuh tempo 14 November 2026',
          fotoBarang: '-',
          status: 'AKTIF',
          totalPembayaran: 0,
          createdBy: 'Migrasi data Qodri'
        }
      })

      await tx.pinjaman.update({
        where: { id: pinjaman.id },
        data: { gadaiID: gadai.gadaiID }
      })

      return pinjaman
    })

    console.log(`\n[3] Transaksi baru dibuat:`)
    console.log(`    Pinjaman #${dibuat.id} | STYLO | pokok=${POKOK_BARU} | bunga=${fee}`)
    console.log(`    Cair ${TANGGAL_CAIR.toISOString().slice(0, 10)} -> kembali ${TANGGAL_KEMBALI.toISOString().slice(0, 10)}`)
    console.log(`    Sumber dana: ${sumberDana.nama}`)
  }

  // --- Ringkasan ----------------------------------------------------------
  console.log('\n=== HASIL AKHIR QODRI ===')
  const customers = await prisma.customer.findMany({
    where: { nama: { contains: 'qodri', mode: 'insensitive' } },
    include: {
      pinjaman: {
        include: {
          siklus: { orderBy: { siklusKe: 'asc' } },
          pendanaan: { include: { sumberDana: true } }
        }
      }
    }
  })
  for (const c of customers) {
    console.log(`\ncustomer id=${c.id} "${c.nama}" ${c.noHp}`)
    for (const p of c.pinjaman) {
      console.log(`  pinjaman #${p.id} ${p.status} "${p.namaBarang}" pokok=${p.pokok} cair=${p.tanggalCair.toISOString().slice(0, 10)} selesai=${p.tanggalSelesai?.toISOString().slice(0, 10) ?? '-'} gadai=${p.gadaiID ?? '-'}`)
      const daftarDana = p.pendanaan.map((d) => `${d.sumberDana.nama}=${d.nominal}`).join(', ')
      console.log(`    dana: ${daftarDana || '(tidak ada)'}`)
      for (const s of p.siklus) {
        console.log(`    siklus #${s.siklusKe} ${s.status} ${s.tanggalMulai.toISOString().slice(0, 10)}->${s.tanggalJatuhTempo.toISOString().slice(0, 10)} bunga=${s.nominalBunga} bayar=${s.nominalDibayar ?? '-'}`)
      }
    }
  }
}

async function pinjamanCariBaru(customerID) {
  return prisma.pinjaman.findFirst({
    where: {
      customerID,
      jenis: 'GADAI',
      namaBarang: NAMA_BARANG,
      pokok: POKOK_BARU,
      tanggalCair: TANGGAL_CAIR
    }
  })
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
