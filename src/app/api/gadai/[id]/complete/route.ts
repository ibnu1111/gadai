import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { getMissingAdminCompletion, getMissingInitialDocs } from '@/lib/helpers'

// PUT /api/gadai/[id]/complete - Admin fills in the on-site "kelengkapan" data
// (foto customer+barang, foto pendukung tambahan, no rekening, nopol) and,
// once everything is filled, submits the gadai for fund disbursement.
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
    const gadaiID = parseInt(id)
    const body = await request.json()
    const {
      fotoKtp, fotoStnk, fotoCustomerBarang, fotoPendukungTambahan,
      noRekening, namaBank, nomorPolisi, submit
    } = body

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID },
      include: { customer: true }
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    if (!['PENDING', 'MENUNGGU_TRANSFER'].includes(existing.status)) {
      return NextResponse.json({
        success: false,
        message: `Tidak bisa mengubah kelengkapan data untuk status ${existing.status}`
      }, { status: 400 })
    }

    if (fotoKtp && fotoKtp !== existing.customer.fotoKtp) {
      await prisma.customer.update({ where: { id: existing.customerID }, data: { fotoKtp } })
    }

    const gadaiUpdate: Record<string, unknown> = {}
    if (fotoStnk !== undefined) gadaiUpdate.fotoPendukung = fotoStnk || existing.fotoPendukung
    if (fotoCustomerBarang !== undefined) gadaiUpdate.fotoCustomerBarang = fotoCustomerBarang
    if (Array.isArray(fotoPendukungTambahan)) gadaiUpdate.fotoPendukungTambahan = fotoPendukungTambahan
    if (noRekening !== undefined) gadaiUpdate.noRekening = noRekening
    if (namaBank !== undefined) gadaiUpdate.namaBank = namaBank
    if (nomorPolisi !== undefined) gadaiUpdate.nomorPolisi = nomorPolisi

    let gadai = existing
    if (Object.keys(gadaiUpdate).length > 0) {
      gadai = await prisma.gadai.update({
        where: { gadaiID },
        data: gadaiUpdate,
        include: { customer: true }
      })
    }

    if (!submit) {
      return NextResponse.json({ success: true, message: 'Kelengkapan data disimpan', data: gadai })
    }

    const missing = [
      ...getMissingInitialDocs(gadai, gadai.customer),
      ...getMissingAdminCompletion(gadai)
    ]

    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Data belum lengkap: ${missing.join(', ')}`
      }, { status: 400 })
    }

    const transferToken = randomBytes(24).toString('hex')
    gadai = await prisma.gadai.update({
      where: { gadaiID },
      data: { status: 'MENUNGGU_TRANSFER', transferToken },
      include: { customer: true }
    })

    const origin = request.headers.get('origin') || `${request.nextUrl.protocol}//${request.nextUrl.host}`

    return NextResponse.json({
      success: true,
      message: 'Data lengkap, gadai siap untuk pencairan dana',
      data: gadai,
      transferUploadLink: `${origin}/transfer/${transferToken}`
    })
  } catch (error) {
    console.error('Error completing gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to update gadai' }, { status: 500 })
  }
}
