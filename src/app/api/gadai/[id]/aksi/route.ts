import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { addTenor } from '@/lib/helpers'

// POST /api/gadai/[id]/aksi - Process (or reject) the "Ambil" / "Perpanjang"
// action at due date. Can be called by admin directly (walk-in customer,
// body has aksi+nominal), or to confirm/reject a pendingAksi previously
// submitted by the customer via the public track page.
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const gadaiID = parseInt(id)
    const body = await request.json().catch(() => ({}))
    const { reject, catatan } = body

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID },
      include: { customer: true }
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    if (reject) {
      const gadai = await prisma.gadai.update({
        where: { gadaiID },
        data: { pendingAksi: null, pendingAksiNominal: null, pendingAksiBukti: null, pendingAksiCreatedAt: null },
        include: { customer: true }
      })
      return NextResponse.json({ success: true, message: 'Permintaan customer ditolak', data: gadai })
    }

    if (!['AKTIF', 'JATUH_TEMPO', 'OVERDUE'].includes(existing.status)) {
      return NextResponse.json({
        success: false,
        message: `Tidak bisa memproses ambil/perpanjang untuk status ${existing.status}`
      }, { status: 400 })
    }

    const aksi = body.aksi || existing.pendingAksi
    const nominal = body.nominal !== undefined ? parseFloat(body.nominal) : existing.pendingAksiNominal ? parseFloat(existing.pendingAksiNominal.toString()) : undefined

    if (!aksi || !['AMBIL', 'PERPANJANG'].includes(aksi)) {
      return NextResponse.json({ success: false, message: 'aksi harus AMBIL atau PERPANJANG' }, { status: 400 })
    }
    if (!nominal || nominal <= 0) {
      return NextResponse.json({ success: false, message: 'Nominal tidak valid' }, { status: 400 })
    }

    const nominalPinjam = parseFloat(existing.nominalPinjam.toString())
    const fee = parseFloat(existing.fee.toString())
    const totalPembayaran = parseFloat(existing.totalPembayaran.toString())
    const totalTagihan = nominalPinjam + fee
    const sisaTagihan = Math.max(0, totalTagihan - totalPembayaran)

    if (aksi === 'AMBIL') {
      if (nominal < sisaTagihan) {
        return NextResponse.json({
          success: false,
          message: `Nominal kurang untuk menebus. Sisa tagihan Rp ${sisaTagihan.toLocaleString('id-ID')}`
        }, { status: 400 })
      }

      await prisma.payment.create({
        data: {
          gadaiID,
          jumlahBayar: nominal,
          tipeBayar: 'TEBUS',
          catatan: catatan || 'Pelunasan (ambil barang)',
          createdBy: admin.nama
        }
      })

      const gadai = await prisma.gadai.update({
        where: { gadaiID },
        data: {
          totalPembayaran: totalPembayaran + nominal,
          status: 'LUNAS',
          pendingAksi: null,
          pendingAksiNominal: null,
          pendingAksiBukti: null,
          pendingAksiCreatedAt: null
        },
        include: { customer: true }
      })

      return NextResponse.json({ success: true, message: 'Barang berhasil ditebus, gadai lunas', data: gadai })
    }

    // PERPANJANG
    const bungaTerbayar = parseFloat(existing.bungaTerbayar.toString()) + nominal

    if (bungaTerbayar < fee) {
      await prisma.payment.create({
        data: {
          gadaiID,
          jumlahBayar: nominal,
          tipeBayar: 'CICIL_BUNGA',
          catatan: catatan || `Cicilan bunga (${bungaTerbayar}/${fee})`,
          createdBy: admin.nama
        }
      })

      const gadai = await prisma.gadai.update({
        where: { gadaiID },
        data: {
          bungaTerbayar,
          pendingAksi: null,
          pendingAksiNominal: null,
          pendingAksiBukti: null,
          pendingAksiCreatedAt: null
        },
        include: { customer: true }
      })

      return NextResponse.json({
        success: true,
        message: `Bunga sebagian tercatat. Kurang Rp ${(fee - bungaTerbayar).toLocaleString('id-ID')} untuk perpanjangan penuh, tanggal jatuh tempo belum berubah.`,
        data: gadai
      })
    }

    // Bunga lunas 100% -> perpanjang penuh, buat siklus gadai baru
    await prisma.payment.create({
      data: {
        gadaiID,
        jumlahBayar: nominal,
        tipeBayar: 'PERPANJANG',
        catatan: catatan || `Perpanjangan ke ${existing.perpanjanganKe + 1}`,
        createdBy: admin.nama
      }
    })

    await prisma.gadai.update({
      where: { gadaiID },
      data: {
        status: 'DIPERPANJANG',
        pendingAksi: null,
        pendingAksiNominal: null,
        pendingAksiBukti: null,
        pendingAksiCreatedAt: null
      }
    })

    const newTanggalKembali = addTenor(new Date(existing.tanggalKembali), parseFloat(existing.bungaPersentase.toString()))

    const newGadai = await prisma.gadai.create({
      data: {
        customerID: existing.customerID,
        kategoriBarang: existing.kategoriBarang,
        namaBarang: existing.namaBarang,
        nominalPinjam,
        bungaPersentase: existing.bungaPersentase,
        fee,
        tanggalPinjam: new Date(),
        tanggalKembali: newTanggalKembali,
        atributTinggal: existing.atributTinggal,
        deskripsi: existing.deskripsi,
        fotoBarang: existing.fotoBarang,
        fotoPendukung: existing.fotoPendukung,
        fotoCustomerBarang: existing.fotoCustomerBarang,
        fotoPendukungTambahan: existing.fotoPendukungTambahan,
        noRekening: existing.noRekening,
        namaBank: existing.namaBank,
        nomorPolisi: existing.nomorPolisi,
        status: 'AKTIF',
        parentGadaiID: gadaiID,
        perpanjanganKe: existing.perpanjanganKe + 1,
        createdBy: admin.nama
      },
      include: { customer: true }
    })

    return NextResponse.json({
      success: true,
      message: `Perpanjangan berhasil. Gadai baru #${newGadai.gadaiID} dibuat dengan jatuh tempo baru.`,
      data: newGadai
    })
  } catch (error) {
    console.error('Error processing aksi:', error)
    return NextResponse.json({ success: false, message: 'Failed to process aksi' }, { status: 500 })
  }
}
