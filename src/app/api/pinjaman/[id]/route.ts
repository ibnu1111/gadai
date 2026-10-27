import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { hitungPersentaseDariFee, rescalePinjamanDana } from '@/lib/ubahDataGadai'

// GET /api/pinjaman/[id] - Detail satu pinjaman: data pokok, riwayat siklus, dan
// rincian sumber dana pencairan.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const pinjamanId = Number.parseInt(id)
    if (!Number.isInteger(pinjamanId)) {
      return NextResponse.json({ success: false, message: 'ID pinjaman tidak valid' }, { status: 400 })
    }

    const pinjaman = await prisma.pinjaman.findUnique({
      where: { id: pinjamanId },
      include: {
        customer: { select: { id: true, nama: true, noHp: true } },
        gadai: { select: { gadaiID: true, status: true } },
        siklus: { orderBy: { siklusKe: 'desc' } },
        pendanaan: { include: { sumberDana: { select: { id: true, nama: true } } } }
      }
    })

    if (!pinjaman) {
      return NextResponse.json({ success: false, message: 'Pinjaman tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: pinjaman })
  } catch (error) {
    console.error('Error fetching pinjaman detail:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch pinjaman' }, { status: 500 })
  }
}

// PUT /api/pinjaman/[id] - Koreksi data pinjaman yang sudah tercatat di buku
// besar. Field financial (pokok, bunga siklus, jatuh tempo) hanya boleh diubah
// selama pinjaman masih AKTIF; kalau sudah LUNAS/LELANG/WRITEOFF, hanya nama
// barang dan catatan yang boleh disentuh.
//
// Bila pinjaman ini berasal dari gadai, Gadai-nya ikut disinkronkan supaya
// halaman detail gadai, surat perjanjian, dan halaman lacak customer selalu
// menampilkan angka yang sama.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const pinjamanId = Number.parseInt(id)
    if (!Number.isInteger(pinjamanId)) {
      return NextResponse.json({ success: false, message: 'ID pinjaman tidak valid' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const { namaBarang, pokok, nominalBunga, tanggalJatuhTempo, catatan } = body

    const pinjaman = await prisma.pinjaman.findUnique({
      where: { id: pinjamanId },
      include: {
        gadai: { select: { gadaiID: true, status: true } },
        siklus: { where: { status: 'BERJALAN' }, orderBy: { siklusKe: 'desc' } },
        pendanaan: true
      }
    })

    if (!pinjaman) {
      return NextResponse.json({ success: false, message: 'Pinjaman tidak ditemukan' }, { status: 404 })
    }

    const sudahFinal = pinjaman.status !== 'AKTIF'
    const adaPerubahanFinancial =
      pokok !== undefined || nominalBunga !== undefined || tanggalJatuhTempo !== undefined

    if (sudahFinal && adaPerubahanFinancial) {
      return NextResponse.json({
        success: false,
        message: `Pinjaman sudah berstatus ${pinjaman.status}, field financial tidak bisa diubah. Hanya nama barang dan catatan yang boleh disunting.`
      }, { status: 400 })
    }

    // --- Validasi ----------------------------------------------------------
    let pokokBaru: Prisma.Decimal | null = null
    if ( pokok !== undefined) {
      const nilai = Number(pokok)
      if (!Number.isFinite(nilai) || nilai <= 0) {
        return NextResponse.json({ success: false, message: 'Pokok harus lebih dari nol' }, { status: 400 })
      }
      pokokBaru = new Prisma.Decimal(nilai.toFixed(2))
    }

    let bungaBaru: Prisma.Decimal | null = null
    if (nominalBunga !== undefined) {
      const nilai = Number(nominalBunga)
      if (!Number.isFinite(nilai) || nilai < 0) {
        return NextResponse.json({ success: false, message: 'Nominal bunga tidak valid' }, { status: 400 })
      }
      bungaBaru = new Prisma.Decimal(nilai.toFixed(2))
    }

    let tanggalBaru: Date | null = null
    if (tanggalJatuhTempo !== undefined) {
      const tanggal = new Date(tanggalJatuhTempo)
      if (Number.isNaN(tanggal.getTime())) {
        return NextResponse.json({ success: false, message: 'Tanggal jatuh tempo tidak valid' }, { status: 400 })
      }
      const siklusBerjalan = pinjaman.siklus[0]
      if (siklusBerjalan && tanggal.getTime() <= siklusBerjalan.tanggalMulai.getTime()) {
        return NextResponse.json({
          success: false,
          message: 'Tanggal jatuh tempo baru harus setelah tanggal mulai siklus'
        }, { status: 400 })
      }
      tanggalBaru = tanggal
    }

    const namaBaru = namaBarang !== undefined ? String(namaBarang || '').trim() : null
    if (namaBarang !== undefined && !namaBaru) {
      return NextResponse.json({ success: false, message: 'Nama barang tidak boleh kosong' }, { status: 400 })
    }

    if (
      pokokBaru === null &&
      bungaBaru === null &&
      tanggalBaru === null &&
      namaBaru === null &&
      catatan === undefined
    ) {
      return NextResponse.json({ success: false, message: 'Tidak ada data yang diubah' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // 1. Pinjaman
      const dataPinjaman: Record<string, unknown> = {}
      if (pokokBaru !== null) dataPinjaman.pokok = pokokBaru
      if (namaBaru !== null) dataPinjaman.namaBarang = namaBaru
      if (catatan !== undefined) dataPinjaman.catatan = String(catatan || '').trim() || null
      if (Object.keys(dataPinjaman).length > 0) {
        await tx.pinjaman.update({ where: { id: pinjamanId }, data: dataPinjaman })
      }

      // 2. Siklus berjalan
      const siklusBerjalan = pinjaman.siklus[0]
      if (siklusBerjalan && (bungaBaru !== null || tanggalBaru !== null)) {
        const dataSiklus: Record<string, unknown> = {}
        if (bungaBaru !== null) dataSiklus.nominalBunga = bungaBaru
        if (tanggalBaru !== null) dataSiklus.tanggalJatuhTempo = tanggalBaru
        await tx.siklus.update({ where: { id: siklusBerjalan.id }, data: dataSiklus })
      }

      // 3. Rincian sumber dana - total harus tetap sama dengan pokok.
      if (pokokBaru !== null) {
        const hasilRescale = rescalePinjamanDana(pinjaman.pendanaan, pinjaman.pokok, pokokBaru)
        for (const row of hasilRescale) {
          await tx.pinjamanDana.update({
            where: { id: row.id },
            data: { nominal: row.nominal }
          })
        }
      }

      // 4. Gadai terkait - samakan supaya semua tampilan konsisten.
      if (pinjaman.gadai) {
        const dataGadai: Record<string, unknown> = {}
        const pokokFinal = pokokBaru ?? pinjaman.pokok
        const bungaFinal = bungaBaru ?? siklusBerjalan?.nominalBunga ?? new Prisma.Decimal(0)

        if (pokokBaru !== null) dataGadai.nominalPinjam = pokokFinal
        if (bungaBaru !== null || pokokBaru !== null) {
          dataGadai.fee = bungaFinal
          dataGadai.bungaPersentase = new Prisma.Decimal(
            hitungPersentaseDariFee(Number(pokokFinal), Number(bungaFinal)).toFixed(2)
          )
        }
        if (tanggalBaru !== null) dataGadai.tanggalKembali = tanggalBaru
        if (namaBaru !== null) dataGadai.namaBarang = namaBaru

        if (Object.keys(dataGadai).length > 0) {
          await tx.gadai.update({ where: { gadaiID: pinjaman.gadai.gadaiID }, data: dataGadai })

          // Bunga yang sudah dibayar jangan melebihi fee baru.
          if (dataGadai.fee !== undefined) {
            const gadai = await tx.gadai.findUnique({
              where: { gadaiID: pinjaman.gadai.gadaiID },
              select: { bungaTerbayar: true }
            })
            if (gadai && gadai.bungaTerbayar.greaterThan(bungaFinal)) {
              await tx.gadai.update({
                where: { gadaiID: pinjaman.gadai.gadaiID },
                data: { bungaTerbayar: bungaFinal }
              })
            }
          }
        }
      }
    })

    const updated = await prisma.pinjaman.findUnique({
      where: { id: pinjamanId },
      include: {
        customer: { select: { id: true, nama: true, noHp: true } },
        gadai: { select: { gadaiID: true, status: true } },
        siklus: { orderBy: { siklusKe: 'desc' } },
        pendanaan: { include: { sumberDana: { select: { id: true, nama: true } } } }
      }
    })

    return NextResponse.json({ success: true, message: 'Pinjaman berhasil diperbarui', data: updated })
  } catch (error) {
    console.error('Error updating pinjaman:', error)
    return NextResponse.json({ success: false, message: 'Failed to update pinjaman' }, { status: 500 })
  }
}
