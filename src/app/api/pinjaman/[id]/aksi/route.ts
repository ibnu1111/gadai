import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { parseTanggalWib, hariIniWib } from '@/lib/bukuBesar'

const AKSI_VALID = new Set(['PERPANJANG', 'LUNAS', 'LELANG', 'WRITEOFF'])
const GADAI_BISA_DIUBAH = new Set(['AKTIF', 'JATUH_TEMPO', 'OVERDUE', 'DIPERPANJANG'])

type GadaiRingkas = { gadaiID: number; status: string } | null

interface Konteks {
  pinjamanId: number
  pokok: Prisma.Decimal
  siklusAktif: { id: number; siklusKe: number; nominalBunga: Prisma.Decimal }
  gadai: GadaiRingkas
  tanggalBayar: Date
  catatan: string | null
  adminEmail: string
  adminNama: string
  body: Record<string, unknown>
}

function toDecimal(value: unknown, fallback: Prisma.Decimal): Prisma.Decimal | null {
  if (value === undefined || value === null || value === '') return fallback
  try {
    const hasil = new Prisma.Decimal(value as Prisma.Decimal.Value)
    return hasil.isNegative() ? null : hasil
  } catch {
    return null
  }
}

function gagal(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status })
}

async function perpanjang(ctx: Konteks) {
  const { pinjamanId, siklusAktif, gadai, tanggalBayar, catatan, body } = ctx

  const jatuhTempoBaru = parseTanggalWib(body.tanggalJatuhTempo)
  if (!jatuhTempoBaru) return gagal('Tanggal jatuh tempo baru wajib diisi')
  if (jatuhTempoBaru <= tanggalBayar) return gagal('Jatuh tempo baru harus setelah tanggal bayar')

  const bungaBaru = toDecimal(body.nominalBunga, siklusAktif.nominalBunga)
  const dibayar = toDecimal(body.nominalDibayar, siklusAktif.nominalBunga)
  if (!bungaBaru || !dibayar) return gagal('Nominal tidak valid')

  await prisma.$transaction(async (tx) => {
    await tx.siklus.update({
      where: { id: siklusAktif.id },
      data: { status: 'PERPANJANG', tanggalBayar, nominalDibayar: dibayar, catatan }
    })
    await tx.siklus.create({
      data: {
        pinjamanId,
        siklusKe: siklusAktif.siklusKe + 1,
        tanggalMulai: tanggalBayar,
        tanggalJatuhTempo: jatuhTempoBaru,
        nominalBunga: bungaBaru,
        dibuatOleh: ctx.adminEmail
      }
    })

    if (gadai) {
      await tx.gadai.update({
        where: { gadaiID: gadai.gadaiID },
        data: { status: 'AKTIF', tanggalKembali: jatuhTempoBaru, fee: bungaBaru, bungaTerbayar: 0 }
      })
      await tx.payment.create({
        data: {
          gadaiID: gadai.gadaiID,
          jumlahBayar: dibayar,
          tipeBayar: 'PERPANJANG',
          catatan: catatan || `Perpanjangan siklus ke-${siklusAktif.siklusKe + 1}`,
          createdBy: ctx.adminNama
        }
      })
    }
  })

  return NextResponse.json({ success: true, message: 'Pinjaman diperpanjang, siklus baru dibuka' })
}

async function lunasi(ctx: Konteks) {
  const { pinjamanId, pokok, siklusAktif, gadai, tanggalBayar, catatan, body } = ctx

  const dibayar = toDecimal(body.nominalDibayar, pokok.plus(siklusAktif.nominalBunga))
  if (!dibayar) return gagal('Nominal tidak valid')

  await prisma.$transaction(async (tx) => {
    await tx.siklus.update({
      where: { id: siklusAktif.id },
      data: { status: 'LUNAS', tanggalBayar, nominalDibayar: dibayar, catatan }
    })
    await tx.pinjaman.update({
      where: { id: pinjamanId },
      data: { status: 'LUNAS', tanggalSelesai: tanggalBayar, nominalAkhir: dibayar }
    })

    if (gadai) {
      await tx.gadai.update({
        where: { gadaiID: gadai.gadaiID },
        data: { status: 'LUNAS', totalPembayaran: { increment: dibayar } }
      })
      await tx.payment.create({
        data: {
          gadaiID: gadai.gadaiID,
          jumlahBayar: dibayar,
          tipeBayar: 'TEBUS',
          catatan: catatan || 'Pelunasan (ambil barang)',
          createdBy: ctx.adminNama
        }
      })
    }
  })

  return NextResponse.json({ success: true, message: 'Pinjaman lunas, modal kembali ke sumber dana' })
}

/** Lelang maupun hapus buku sama-sama menutup pinjaman tanpa pelunasan penuh. */
async function tutupTanpaPelunasan(ctx: Konteks, statusAkhir: 'LELANG' | 'WRITEOFF') {
  const { pinjamanId, siklusAktif, tanggalBayar, catatan, body } = ctx

  const nominalAkhir = toDecimal(body.nominalAkhir, new Prisma.Decimal(0))
  if (!nominalAkhir) return gagal('Nominal akhir tidak valid')

  await prisma.$transaction(async (tx) => {
    await tx.siklus.update({
      where: { id: siklusAktif.id },
      data: { status: statusAkhir, tanggalBayar, nominalDibayar: nominalAkhir, catatan }
    })
    await tx.pinjaman.update({
      where: { id: pinjamanId },
      data: { status: statusAkhir, tanggalSelesai: tanggalBayar, nominalAkhir }
    })
  })

  return NextResponse.json({
    success: true,
    message: statusAkhir === 'LELANG' ? 'Barang ditandai lelang' : 'Pinjaman dihapus buku'
  })
}

// POST /api/pinjaman/[id]/aksi - Tutup siklus berjalan di buku besar:
// perpanjang (buka siklus baru), lunas, lelang, atau hapus buku.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) return gagal('Unauthorized', 401)

    const { id } = await params
    const pinjamanId = Number.parseInt(id)
    if (!Number.isInteger(pinjamanId)) return gagal('ID pinjaman tidak valid')

    const body = await request.json().catch(() => ({}))
    const aksi = body.aksi
    if (!AKSI_VALID.has(aksi)) {
      return gagal(`aksi harus salah satu dari: ${[...AKSI_VALID].join(', ')}`)
    }

    const pinjaman = await prisma.pinjaman.findUnique({
      where: { id: pinjamanId },
      include: {
        gadai: { select: { gadaiID: true, status: true } },
        siklus: { where: { status: 'BERJALAN' }, orderBy: { siklusKe: 'desc' }, take: 1 }
      }
    })

    if (!pinjaman) return gagal('Pinjaman tidak ditemukan', 404)
    if (pinjaman.status !== 'AKTIF') return gagal(`Pinjaman sudah berstatus ${pinjaman.status}`)

    const siklusAktif = pinjaman.siklus[0]
    if (!siklusAktif) return gagal('Tidak ada siklus berjalan')
    if (aksi === 'LELANG' && pinjaman.jenis !== 'GADAI') {
      return gagal('Lelang hanya untuk pinjaman gadai')
    }

    const ctx: Konteks = {
      pinjamanId,
      pokok: pinjaman.pokok,
      siklusAktif,
      gadai: pinjaman.gadai && GADAI_BISA_DIUBAH.has(pinjaman.gadai.status) ? pinjaman.gadai : null,
      tanggalBayar: parseTanggalWib(body.tanggalBayar) ?? hariIniWib(),
      catatan: body.catatan || null,
      adminEmail: admin.email,
      adminNama: admin.nama,
      body
    }

    if (aksi === 'PERPANJANG') return await perpanjang(ctx)
    if (aksi === 'LUNAS') return await lunasi(ctx)
    return await tutupTanpaPelunasan(ctx, aksi === 'LELANG' ? 'LELANG' : 'WRITEOFF')
  } catch (error) {
    console.error('Error processing aksi pinjaman:', error)
    return gagal('Gagal memproses aksi', 500)
  }
}
