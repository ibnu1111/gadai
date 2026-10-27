import { Prisma } from '@prisma/client'

/**
 * Logika bersama untuk mengoreksi data gadai dan menjaga konsistensinya
 * dengan buku besar (Pinjaman + Siklus + PinjamanDana).
 *
 * Dua hal penting yang dijaga helper ini:
 *  1. Mass-assignment: field Gadai yang boleh diubah lewat endpoint edit
 *     dibatasi lewat PATCH_GADAI_ALLOWED. Tanpa whitelist, request body bisa
 *     ikut menyetel status, customerID, totalPembayaran, dan field internal lain.
 *  2. Invariant buku besar: total PinjamanDana.nominal harus sama persis
 *     dengan Pinjaman.pokok. Kalau pokok diubah, rincian sumber dana ikut
 *     di-rescale proporsional supaya invariant itu tetap berlaku.
 */

/** Field Gadai yang boleh diubah lewat form edit admin. */
export const PATCH_GADAI_ALLOWED = [
  'kategoriBarang',
  'namaBarang',
  'nominalPinjam',
  'bungaPersentase',
  'tanggalPinjam',
  'tanggalKembali',
  'atributTinggal',
  'deskripsi',
  'nomorPolisi'
] as const

export type FieldGadaiEditable = (typeof PATCH_GADAI_ALLOWED)[number]

/** Status gadai yang sudah final - data financial-nya tidak boleh diubah lagi. */
const STATUS_FINAL = new Set(['LUNAS', 'LELANG', 'WRITEOFF', 'DITOLAK'])

export interface PatchGadai {
  kategoriBarang?: string
  namaBarang?: string
  nominalPinjam?: number
  bungaPersentase?: number
  tanggalPinjam?: Date
  tanggalKembali?: Date
  atributTinggal?: string
  deskripsi?: string | null
  nomorPolisi?: string | null
}

/** Fee = nominal x bunga%. Dibulatkan 2 desimal, sama seperti saat create gadai. */
export function hitungFee(nominal: number, bungaPersentase: number): Prisma.Decimal {
  return new Prisma.Decimal(((nominal * bungaPersentase) / 100).toFixed(2))
}

function desimal(nilai: number): Prisma.Decimal {
  return new Prisma.Decimal(nilai.toFixed(2))
}

/**
 * Rescale rincian sumber dana secara proporsional supaya totalnya persis sama
 * dengan pokok baru. Selisih akibat pembulatan dikoreksi ke baris terbesar
 * supaya total tidak selisih satu rupiah pun.
 */
export function rescalePinjamanDana(
  rows: { id: number; nominal: Prisma.Decimal }[],
  pokokLama: Prisma.Decimal,
  pokokBaru: Prisma.Decimal
): { id: number; nominal: Prisma.Decimal }[] {
  if (rows.length === 0) return []
  if (pokokLama.equals(pokokBaru)) {
    return rows.map((r) => ({ id: r.id, nominal: r.nominal }))
  }

  const rasio = pokokBaru.dividedBy(pokokLama)
  const hasil = rows.map((r) => ({
    id: r.id,
    nominal: r.nominal.times(rasio).toDecimalPlaces(2)
  }))

  // Koreksi selisih pembulatan pada baris dengan nominal terbesar.
  const total = hasil.reduce((acc, r) => acc.plus(r.nominal), new Prisma.Decimal(0))
  const selisih = pokokBaru.minus(total)
  if (!selisih.isZero()) {
    let indexTertinggi = 0
    for (let i = 1; i < hasil.length; i++) {
      if (hasil[i].nominal.greaterThan(hasil[indexTertinggi].nominal)) indexTertinggi = i
    }
    hasil[indexTertinggi] = {
      ...hasil[indexTertinggi],
      nominal: hasil[indexTertinggi].nominal.plus(selisih).toDecimalPlaces(2)
    }
  }

  return hasil
}

export interface HasilPatchGadai {
  gadai: Prisma.GadaiGetPayload<{ include: { customer: true } }>
  /** True kalau ada buku besar (Pinjaman) yang ikut tersinkron. */
  tersinkron: boolean
}

/**
 * Terapkan patch ke Gadai dan, bila gadai ini sudah punya Pinjaman di buku
 * besar, samakan Pinjaman/Siklus/PinjamanDana-nya juga.
 *
 * WAJIB dipanggil di dalam prisma.$transaction.
 */
export async function terapkanPatchGadai(
  tx: Prisma.TransactionClient,
  gadaiID: number,
  patch: PatchGadai
): Promise<HasilPatchGadai | { error: string; status: number }> {
  const existing = await tx.gadai.findUnique({
    where: { gadaiID },
    include: {
      customer: true,
      pinjaman: {
        include: {
          siklus: { where: { status: 'BERJALAN' }, orderBy: { siklusKe: 'desc' } },
          pendanaan: true
        }
      }
    }
  })

  if (!existing) return { error: 'Gadai not found', status: 404 }

  const sudahFinal = STATUS_FINAL.has(existing.status)

  // Saring patch hanya ke field yang diizinkan.
  const data: Record<string, unknown> = {}
  if (patch.kategoriBarang !== undefined) data.kategoriBarang = patch.kategoriBarang
  if (patch.namaBarang !== undefined) data.namaBarang = patch.namaBarang
  if (patch.atributTinggal !== undefined) data.atributTinggal = patch.atributTinggal
  if (patch.deskripsi !== undefined) data.deskripsi = patch.deskripsi || null
  if (patch.nomorPolisi !== undefined) data.nomorPolisi = patch.nomorPolisi || null
  if (patch.tanggalPinjam !== undefined) data.tanggalPinjam = patch.tanggalPinjam
  if (patch.tanggalKembali !== undefined) data.tanggalKembali = patch.tanggalKembali

  const nominalBaru = patch.nominalPinjam ?? Number(existing.nominalPinjam)
  const bungaBaru = patch.bungaPersentase ?? Number(existing.bungaPersentase)

  if (patch.nominalPinjam !== undefined || patch.bungaPersentase !== undefined) {
    if (sudahFinal) {
      return {
        error: `Data financial sudah final untuk status ${existing.status}. Hanya nama barang, deskripsi, dan nomor polisi yang bisa diubah.`,
        status: 400
      }
    }
    data.nominalPinjam = desimal(nominalBaru)
    data.bungaPersentase = desimal(bungaBaru)
    // Fee selalu dihitung ulang di server supaya tidak bisa tidak sinkron.
    data.fee = hitungFee(nominalBaru, bungaBaru)
  }

  if (Object.keys(data).length === 0) {
    return { error: 'Tidak ada data yang diubah', status: 400 }
  }

  const pinjaman = existing.pinjaman
  const adaBukuBesar = Boolean(pinjaman)

  // Terapkan perubahan ke Gadai dulu.
  await tx.gadai.update({ where: { gadaiID }, data })

  // Sinkronkan buku besar bila gadai ini sudah/cair jadi AKTIF.
  if (pinjaman) {
    const pokokBaru = desimal(nominalBaru)
    const feeBaru = hitungFee(nominalBaru, bungaBaru)

    await tx.pinjaman.update({
      where: { id: pinjaman.id },
      data: {
        pokok: pokokBaru,
        namaBarang: patch.namaBarang !== undefined ? patch.namaBarang : pinjaman.namaBarang
      }
    })

    // Siklus yang sedang berjalan memakai absolute nominal bunga, bukan persen.
    const siklusBerjalan = pinjaman.siklus[0]
    if (siklusBerjalan) {
      const dataSiklus: Record<string, unknown> = {}
      if (patch.bungaPersentase !== undefined || patch.nominalPinjam !== undefined) {
        dataSiklus.nominalBunga = feeBaru
      }
      if (patch.tanggalKembali !== undefined) {
        dataSiklus.tanggalJatuhTempo = patch.tanggalKembali
      }
      if (Object.keys(dataSiklus).length > 0) {
        await tx.siklus.update({ where: { id: siklusBerjalan.id }, data: dataSiklus })
      }
    }

    // Rincian sumber dana harus tetap totalnya sama dengan pokok baru.
    if (patch.nominalPinjam !== undefined) {
      const hasilRescale = rescalePinjamanDana(
        pinjaman.pendanaan,
        pinjaman.pokok,
        pokokBaru
      )
      for (const row of hasilRescale) {
        await tx.pinjamanDana.update({
          where: { id: row.id },
          data: { nominal: row.nominal }
        })
      }
    }

    // Bunga yang sudah dibayar jangan sampai melebihi fee baru.
    if (patch.nominalPinjam !== undefined || patch.bungaPersentase !== undefined) {
      const bungaTerbayar = existing.bungaTerbayar
      if (bungaTerbayar.greaterThan(feeBaru)) {
        await tx.gadai.update({
          where: { gadaiID },
          data: { bungaTerbayar: feeBaru }
        })
      }
    }
  }

  const gadai = await tx.gadai.findUnique({
    where: { gadaiID },
    include: { customer: true }
  })

  return { gadai: gadai!, tersinkron: adaBukuBesar }
}

/**
 * Hitung persentase bunga dari fee dan pokok. Dipakai saat pinjaman
 * diedit lewat modal pinjaman (bunga disimpan absolut di siklus).
 */
export function hitungPersentaseDariFee(nominal: number, fee: number): number {
  if (!nominal) return 0
  return Number(((fee / nominal) * 100).toFixed(2))
}
