import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

// PUT /api/gadai/[id]/rekening - Admin fallback: fills in the customer's bank
// account details directly (e.g. customer can't use the self-service link),
// moving the gadai on to MENUNGGU_TRANSFER same as the public route does.
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
    const { noRekening, namaBank } = await request.json()

    if (!noRekening || !namaBank) {
      return NextResponse.json({
        success: false,
        message: 'Nomor rekening dan nama bank wajib diisi'
      }, { status: 400 })
    }

    const existing = await prisma.gadai.findUnique({ where: { gadaiID } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    if (existing.status !== 'MENUNGGU_REKENING') {
      return NextResponse.json({
        success: false,
        message: `Tidak bisa mengisi rekening untuk status ${existing.status}`
      }, { status: 400 })
    }

    const transferToken = randomBytes(24).toString('hex')
    const gadai = await prisma.gadai.update({
      where: { gadaiID },
      data: { noRekening, namaBank, status: 'MENUNGGU_TRANSFER', transferToken },
      include: { customer: true }
    })

    return NextResponse.json({ success: true, message: 'Rekening disimpan, gadai siap untuk pencairan dana', data: gadai })
  } catch (error) {
    console.error('Error saving rekening:', error)
    return NextResponse.json({ success: false, message: 'Failed to save rekening' }, { status: 500 })
  }
}
