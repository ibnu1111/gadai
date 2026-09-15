import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { normalizePhoneNumber } from '@/lib/helpers'

// POST /api/public/track/rekening - Customer submits bank account details for
// disbursement directly from the public track page, as an alternative to the
// one-off /rekening/[token] link. Moves the gadai on to MENUNGGU_TRANSFER.
export async function POST(request: NextRequest) {
  try {
    const { phone, gadaiId, noRekening, namaBank, namaRekening } = await request.json()

    if (!phone || !gadaiId || !noRekening || !namaBank || !namaRekening) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap' }, { status: 400 })
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

    if (gadai.status !== 'MENUNGGU_REKENING') {
      return NextResponse.json({
        success: false,
        message: 'Pengajuan ini belum disetujui admin atau rekening sudah diisi'
      }, { status: 400 })
    }

    const transferToken = randomBytes(24).toString('hex')
    await prisma.gadai.update({
      where: { gadaiID: gadai.gadaiID },
      data: { noRekening, namaBank, namaRekening, status: 'MENUNGGU_TRANSFER', transferToken }
    })

    return NextResponse.json({
      success: true,
      message: 'Rekening berhasil disimpan, menunggu proses pencairan dana',
      data: { gadaiID: gadai.gadaiID, namaBarang: gadai.namaBarang, nominalPinjam: gadai.nominalPinjam.toString() }
    })
  } catch (error) {
    console.error('Error saving track rekening:', error)
    return NextResponse.json({ success: false, message: 'Failed to save rekening' }, { status: 500 })
  }
}
