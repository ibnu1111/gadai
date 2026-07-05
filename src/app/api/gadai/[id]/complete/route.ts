import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { getMissingAdminCompletion, getMissingInitialDocs } from '@/lib/helpers'

// PUT /api/gadai/[id]/complete - Admin fills in the on-site "kelengkapan" data
// (foto customer+barang, foto pendukung tambahan, nopol) and, once everything
// is filled, submits the gadai so the customer can self-fill their bank
// account details via the /rekening/[token] public link.
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
      nomorPolisi, submit
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

    const rekeningToken = randomBytes(24).toString('hex')
    gadai = await prisma.gadai.update({
      where: { gadaiID },
      data: { status: 'MENUNGGU_REKENING', rekeningToken },
      include: { customer: true }
    })

    const origin = request.headers.get('origin') || `${request.nextUrl.protocol}//${request.nextUrl.host}`

    return NextResponse.json({
      success: true,
      message: 'Data lengkap, menunggu customer mengisi rekening tujuan',
      data: gadai,
      rekeningLink: `${origin}/rekening/${rekeningToken}`
    })
  } catch (error) {
    console.error('Error completing gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to update gadai' }, { status: 500 })
  }
}
