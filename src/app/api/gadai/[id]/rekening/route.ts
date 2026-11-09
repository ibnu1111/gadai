import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'
import { guardMutasi } from '@/lib/adminAuth'

// PUT /api/gadai/[id]/rekening - Admin fallback: fills in the customer's bank
// account details directly (e.g. customer can't use the self-service link),
// moving the gadai on to MENUNGGU_TRANSFER same as the public route does.
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await guardMutasi(request, 'mengubah rekening gadai')
    if ('response' in guard) return guard.response
    const { admin } = guard

    const { id } = await params
    const gadaiID = parseInt(id)
    const { noRekening, namaBank, namaRekening } = await request.json()

    if (!noRekening || !namaBank || !namaRekening) {
      return NextResponse.json({
        success: false,
        message: 'Nomor rekening, nama bank, dan atas nama rekening wajib diisi'
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
      data: { noRekening, namaBank, namaRekening, status: 'MENUNGGU_TRANSFER', transferToken },
      include: { customer: true }
    })

    return NextResponse.json({ success: true, message: 'Rekening disimpan, gadai siap untuk pencairan dana', data: gadai })
  } catch (error) {
    console.error('Error saving rekening:', error)
    return NextResponse.json({ success: false, message: 'Failed to save rekening' }, { status: 500 })
  }
}
