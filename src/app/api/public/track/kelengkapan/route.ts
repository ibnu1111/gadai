import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizePhoneNumber } from '@/lib/helpers'

// POST /api/public/track/kelengkapan - Customer self-completes missing documents
// (Foto KTP, Foto STNK, Foto Customer+Barang, Nomor Polisi) from the public
// track page, as an alternative to admin filling them in in-person.
export async function POST(request: NextRequest) {
  try {
    const { phone, gadaiId, fotoKtp, fotoPendukung, fotoCustomerBarang, nomorPolisi } = await request.json()

    if (!phone || !gadaiId) {
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

    if (gadai.status !== 'PENDING') {
      return NextResponse.json({
        success: false,
        message: 'Pengajuan ini sudah ditinjau admin, kelengkapan data tidak bisa diubah dari sini lagi'
      }, { status: 400 })
    }

    if (fotoKtp && fotoKtp !== customer.fotoKtp) {
      await prisma.customer.update({ where: { id: customer.id }, data: { fotoKtp } })
    }

    const gadaiUpdate: { fotoPendukung?: string; fotoCustomerBarang?: string; nomorPolisi?: string } = {}
    if (fotoPendukung) gadaiUpdate.fotoPendukung = fotoPendukung
    if (fotoCustomerBarang) gadaiUpdate.fotoCustomerBarang = fotoCustomerBarang
    if (nomorPolisi) gadaiUpdate.nomorPolisi = nomorPolisi

    if (Object.keys(gadaiUpdate).length > 0) {
      await prisma.gadai.update({ where: { gadaiID: gadai.gadaiID }, data: gadaiUpdate })
    }

    return NextResponse.json({ success: true, message: 'Kelengkapan data berhasil disimpan' })
  } catch (error) {
    console.error('Error saving track kelengkapan:', error)
    return NextResponse.json({ success: false, message: 'Failed to save kelengkapan' }, { status: 500 })
  }
}
