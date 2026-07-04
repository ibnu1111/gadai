import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizePhoneNumber, isDueOrOverdue } from '@/lib/helpers'

// POST /api/public/track/action - Customer submits "Ambil" / "Perpanjang" with
// proof of transfer + nominal from the public track page. This only records
// a pending request; an admin must confirm it before anything changes.
export async function POST(request: NextRequest) {
  try {
    const { phone, gadaiId, aksi, nominal, bukti } = await request.json()

    if (!phone || !gadaiId || !aksi || !nominal || !bukti) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 400 })
    }

    if (!['AMBIL', 'PERPANJANG'].includes(aksi)) {
      return NextResponse.json({ success: false, message: 'aksi harus AMBIL atau PERPANJANG' }, { status: 400 })
    }

    const normalizedPhone = normalizePhoneNumber(phone)
    const customer = await prisma.customer.findUnique({ where: { noHp: normalizedPhone! } })
    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer tidak ditemukan' }, { status: 404 })
    }

    const gadai = await prisma.gadai.findFirst({
      where: { gadaiID: Number.parseInt(gadaiId), customerID: customer.id }
    })

    if (!gadai) {
      return NextResponse.json({ success: false, message: 'Pengajuan tidak ditemukan' }, { status: 404 })
    }

    if (!isDueOrOverdue(gadai.status, gadai.tanggalKembali)) {
      return NextResponse.json({
        success: false,
        message: 'Pengajuan ini belum jatuh tempo'
      }, { status: 400 })
    }

    if (gadai.pendingAksi) {
      return NextResponse.json({
        success: false,
        message: 'Sudah ada permintaan yang menunggu konfirmasi admin'
      }, { status: 400 })
    }

    await prisma.gadai.update({
      where: { gadaiID: gadai.gadaiID },
      data: {
        pendingAksi: aksi,
        pendingAksiNominal: Number.parseFloat(nominal),
        pendingAksiBukti: bukti,
        pendingAksiCreatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Permintaan berhasil dikirim, menunggu konfirmasi admin'
    })
  } catch (error) {
    console.error('Error submitting track action:', error)
    return NextResponse.json({ success: false, message: 'Failed to submit action' }, { status: 500 })
  }
}
