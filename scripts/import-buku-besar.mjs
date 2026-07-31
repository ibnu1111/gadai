#!/usr/bin/env node
/**
 * Impor histori buku besar dari rekap WhatsApp.
 *
 *   node scripts/import-buku-besar.mjs --file <json>            # dry run + rekonsiliasi
 *   node scripts/import-buku-besar.mjs --file <json> --apply    # tulis ke database
 *   node scripts/import-buku-besar.mjs --file <json> --apply --hapus   # ganti data impor lama
 *
 * File JSON berisi data nasabah, jadi simpan di luar repo dan jangan pernah di-commit.
 * DATABASE_URL wajib menunjuk host publik Railway saat dijalankan dari laptop.
 */
import { readFileSync } from 'node:fs'
import { PrismaClient } from '@prisma/client'

const args = process.argv.slice(2)
const ambilArg = (nama) => {
  const i = args.indexOf(nama)
  return i >= 0 ? args[i + 1] : null
}

const berkas = ambilArg('--file')
const terapkan = args.includes('--apply')
const hapusDulu = args.includes('--hapus')

if (!berkas) {
  console.error('Wajib: --file <path json>')
  process.exit(1)
}

/** Angka closing tulisan tangan, dipakai sebagai pembanding rekonsiliasi. */
const KEUNTUNGAN_MANUAL = {
  '2025-08': 85295000, '2025-09': 92362000, '2025-10': 92640000, '2025-11': 86735000,
  '2025-12': 98230000, '2026-01': 92187000, '2026-02': 95680000, '2026-03': 96240000,
  '2026-04': 110285000, '2026-05': 106555000, '2026-06': 117665000, '2026-07': 116145000
}
const TERPUTAR_MANUAL = 441580000
const MODAL_MANUAL = { MEGA: 150900000, 'TAB ANAK': 126200000, 'TAB EMAS': 70300000 }

const rupiah = (n) => new Intl.NumberFormat('id-ID').format(Math.round(n))
const tanggal = (iso) => new Date(`${iso}T12:00:00.000Z`)

// PowerShell menulis BOM di depan file UTF-8
const data = JSON.parse(readFileSync(berkas, 'utf8').replace(/^\uFEFF/, ''))
const pinjaman = data.pinjaman ?? []

// ---------- rekonsiliasi ----------
const urutTeks = (a, b) => a.localeCompare(b)

function hitungStatistik() {
  const perBulan = new Map()
  const perJenis = new Map()
  const modalSumber = new Map()
  let siklus = 0
  let pendanaan = 0
  let pokokAktif = 0
  let jumlahAktif = 0

  for (const p of pinjaman) {
    perJenis.set(p.jenis, (perJenis.get(p.jenis) ?? 0) + 1)
    if (p.status === 'AKTIF') {
      jumlahAktif++
      pokokAktif += p.pokok
    }
    for (const s of p.siklus) {
      siklus++
      const bulan = s.tanggalJatuhTempo.slice(0, 7)
      perBulan.set(bulan, (perBulan.get(bulan) ?? 0) + s.nominalBunga)
    }
    for (const d of p.pendanaan ?? []) {
      pendanaan++
      modalSumber.set(d.sumber, (modalSumber.get(d.sumber) ?? 0) + d.nominal)
    }
  }

  return {
    perBulan, perJenis, modalSumber, siklus, pendanaan, pokokAktif, jumlahAktif,
    nasabah: new Set(pinjaman.map((p) => p.nama))
  }
}

function cetakRingkasan(stat) {
  const jenis = [...stat.perJenis].map(([k, v]) => `${k} ${v}`).join(', ')
  console.log('=== RINGKASAN ===')
  console.log(`Rekap terakhir : ${data.meta?.rekapTerakhir ?? '-'}`)
  console.log(`Nasabah unik   : ${stat.nasabah.size}`)
  console.log(`Pinjaman       : ${pinjaman.length}  (${jenis})`)
  console.log(`Siklus         : ${stat.siklus}`)
  console.log(`Baris pendanaan: ${stat.pendanaan}`)
  console.log(`Baris WA gagal : ${data.meta?.barisDilewati ?? '-'}`)
}

function cetakKeuntungan(stat) {
  console.log('\n=== KEUNTUNGAN PER BULAN (hitung vs tulisan tangan) ===')
  console.log('Bulan     |        Hitung |        Manual |       Selisih |   %')
  let totalHitung = 0
  let totalManual = 0
  for (const [bulan, manual] of Object.entries(KEUNTUNGAN_MANUAL)) {
    const hitung = stat.perBulan.get(bulan) ?? 0
    const selisih = hitung - manual
    totalHitung += hitung
    totalManual += manual
    const persen = ((selisih / manual) * 100).toFixed(1)
    console.log(
      `${bulan}   | ${rupiah(hitung).padStart(13)} | ${rupiah(manual).padStart(13)} | ${rupiah(selisih).padStart(13)} | ${persen.padStart(5)}`
    )
  }
  const selisihTotal = totalHitung - totalManual
  const persenTotal = ((selisihTotal / totalManual) * 100).toFixed(2)
  console.log(
    `TOTAL     | ${rupiah(totalHitung).padStart(13)} | ${rupiah(totalManual).padStart(13)} | ${rupiah(selisihTotal).padStart(13)} | ${persenTotal.padStart(5)}`
  )

  const luar = [...stat.perBulan.keys()].filter((b) => !(b in KEUNTUNGAN_MANUAL)).sort(urutTeks)
  if (luar.length > 0) {
    const rincian = luar.map((b) => `${b} (${rupiah(stat.perBulan.get(b))})`).join(', ')
    console.log(`\nBulan di luar periode closing: ${rincian}`)
  }
}

function cetakPosisi(stat) {
  console.log('\n=== POSISI BERJALAN ===')
  console.log(`Pinjaman aktif : ${stat.jumlahAktif}`)
  console.log(`Pokok terputar : ${rupiah(stat.pokokAktif)}  (manual ${rupiah(TERPUTAR_MANUAL)}, selisih ${rupiah(stat.pokokAktif - TERPUTAR_MANUAL)})`)
  // closing ditulis tanggal 30, jadi pencairan setelah itu wajar bikin angka kita lebih besar
  const sebelumClosing = pinjaman
    .filter((p) => p.status === 'AKTIF' && p.tanggalCair <= '2026-07-30')
    .reduce((a, p) => a + p.pokok, 0)
  console.log(`Cair s/d 30 Jul: ${rupiah(sebelumClosing)}  (selisih ${rupiah(sebelumClosing - TERPUTAR_MANUAL)})`)

  const ganjil = pinjaman.flatMap((p) =>
    p.siklus.filter((s) => s.nominalBunga % 1000 !== 0).map((s) => ({ nama: p.namaPenuh, ...s }))
  )
  if (ganjil.length > 0) {
    console.log(`\n=== BUNGA JANGGAL (bukan kelipatan 1.000) - ${ganjil.length} siklus ===`)
    for (const g of ganjil.slice(0, 15)) {
      console.log(`  ${g.nama.padEnd(22)} ${g.tanggalJatuhTempo}  ${rupiah(g.nominalBunga)}`)
    }
  }
}

function cetakModal(stat) {
  console.log('\n=== MODAL PER SUMBER ===')
  for (const [sumber, manual] of Object.entries(MODAL_MANUAL)) {
    const hitung = stat.modalSumber.get(sumber) ?? 0
    console.log(`${sumber.padEnd(9)} | ${rupiah(hitung).padStart(13)} | manual ${rupiah(manual).padStart(13)} | selisih ${rupiah(hitung - manual).padStart(13)}`)
  }
  const asing = [...stat.modalSumber.keys()].filter((s) => !(s in MODAL_MANUAL))
  if (asing.length > 0) console.log(`Sumber tak dikenal: ${asing.join(', ')}`)

  const sisa = data.sisaModal ?? []
  if (sisa.length > 0) {
    const totalSisa = sisa.reduce((a, b) => a + b.Nominal, 0)
    console.log(`\n=== MODAL TAK TERCOCOK (${sisa.length} baris, ${rupiah(totalSisa)}) ===`)
    for (const s of [...sisa].sort((a, b) => b.Nominal - a.Nominal).slice(0, 20)) {
      console.log(`  ${s.Sumber.padEnd(9)} ${rupiah(s.Nominal).padStart(12)}  ${s.Target}`)
    }
  }
}

function laporan() {
  const stat = hitungStatistik()
  cetakRingkasan(stat)
  cetakKeuntungan(stat)
  cetakPosisi(stat)
  cetakModal(stat)
  return stat
}

// ---------- tulis ----------
async function tulis(prisma, nasabah) {
  const cacat = pinjaman.filter((p) => !p.nama?.trim() || p.pokok <= 0 || p.siklus.length === 0)
  if (cacat.length > 0) {
    console.error(`\nBatal: ${cacat.length} pinjaman tidak lengkap (nama/pokok/siklus kosong).`)
    console.error(cacat.slice(0, 5).map((p) => JSON.stringify({ nama: p.namaPenuh, pokok: p.pokok })).join('\n'))
    process.exit(1)
  }

  const adaImpor = await prisma.pinjaman.count({ where: { dibuatOleh: 'IMPORT' } })
  if (adaImpor > 0) {
    if (!hapusDulu) {
      console.error(`\nBatal: sudah ada ${adaImpor} pinjaman hasil impor. Tambahkan --hapus untuk mengganti.`)
      process.exit(1)
    }
    console.log(`\nMenghapus ${adaImpor} pinjaman impor lama...`)
    await prisma.pinjaman.deleteMany({ where: { dibuatOleh: 'IMPORT' } })
    await prisma.customer.deleteMany({ where: { noHp: { startsWith: 'IMPORT-' } } })
  }

  const sumberDana = await prisma.sumberDana.findMany({ select: { id: true, nama: true } })
  const petaSumber = new Map(sumberDana.map((s) => [s.nama, s.id]))
  const kurang = new Set()
  for (const p of pinjaman) for (const d of p.pendanaan ?? []) if (!petaSumber.has(d.sumber)) kurang.add(d.sumber)
  if (kurang.size > 0) {
    console.error(`\nBatal: sumber dana belum ada di database: ${[...kurang].join(', ')}`)
    process.exit(1)
  }

  console.log(`\nMembuat ${nasabah.size} nasabah...`)
  const daftar = [...nasabah].sort(urutTeks)
  await prisma.customer.createMany({
    data: daftar.map((nama, i) => ({ nama, noHp: `IMPORT-${String(i + 1).padStart(5, '0')}` })),
    skipDuplicates: true
  })
  const customer = await prisma.customer.findMany({
    where: { noHp: { startsWith: 'IMPORT-' } },
    select: { id: true, nama: true }
  })
  const petaCustomer = new Map(customer.map((c) => [c.nama, c.id]))

  console.log(`Menulis ${pinjaman.length} pinjaman...`)
  const UKURAN = 50
  let selesai = 0
  for (let i = 0; i < pinjaman.length; i += UKURAN) {
    const potongan = pinjaman.slice(i, i + UKURAN)
    await prisma.$transaction(
      potongan.map((p) =>
        prisma.pinjaman.create({
          data: {
            customerID: petaCustomer.get(p.nama),
            jenis: p.jenis,
            namaBarang: p.namaBarang,
            pokok: p.pokok,
            tanggalCair: tanggal(p.tanggalCair),
            status: p.status,
            tanggalSelesai: p.tanggalSelesai ? tanggal(p.tanggalSelesai) : null,
            nominalAkhir: p.nominalAkhir ?? null,
            dibuatOleh: 'IMPORT',
            siklus: {
              create: p.siklus.map((s) => ({
                siklusKe: s.siklusKe,
                tanggalMulai: tanggal(s.tanggalMulai),
                tanggalJatuhTempo: tanggal(s.tanggalJatuhTempo),
                nominalBunga: s.nominalBunga,
                status: s.status,
                tanggalBayar: s.tanggalBayar ? tanggal(s.tanggalBayar) : null,
                nominalDibayar: s.nominalDibayar ?? null,
                nomorUrut: s.nomorUrut ?? null,
                dibuatOleh: 'IMPORT'
              }))
            },
            pendanaan: {
              create: (p.pendanaan ?? []).map((d) => ({
                sumberDanaId: petaSumber.get(d.sumber),
                nominal: d.nominal
              }))
            }
          }
        })
      )
    )
    selesai += potongan.length
    if (selesai % 200 < UKURAN) console.log(`  ${selesai}/${pinjaman.length}`)
  }

  const [totalPinjaman, totalSiklus, totalDana] = await Promise.all([
    prisma.pinjaman.count(),
    prisma.siklus.count(),
    prisma.pinjamanDana.count()
  ])
  console.log(`\nSelesai. Pinjaman ${totalPinjaman}, Siklus ${totalSiklus}, PinjamanDana ${totalDana}.`)
}

const { nasabah } = laporan()

if (!terapkan) {
  console.log('\n(dry run - tidak ada yang ditulis. Tambahkan --apply untuk mengeksekusi.)')
  process.exit(0)
}

const prisma = new PrismaClient()
try {
  await tulis(prisma, nasabah)
} finally {
  await prisma.$disconnect()
}
