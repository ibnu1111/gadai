import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guardMutasi } from '@/lib/adminAuth'

const VALID_STATUS = ['PENDING', 'MENUNGGU_REKENING', 'MENUNGGU_TRANSFER', 'MENUNGGU_VERIFIKASI_TRANSFER', 'AKTIF', 'LUNAS', 'JATUH_TEMPO', 'OVERDUE', 'DITOLAK', 'DIPERPANJANG']

// PUT /api/gadai/[id]/status - Update gadai status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await guardMutasi(request, 'mengubah status gadai')
    if ('response' in guard) return guard.response
    const { admin } = guard

    const { id } = await params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json({ success: false, message: 'Status is required' }, { status: 400 })
    }

    const upperStatus = status.toUpperCase()
    if (!VALID_STATUS.includes(upperStatus)) {
      return NextResponse.json({
        success: false,
        message: `Status must be one of: ${VALID_STATUS.join(', ')}`
      }, { status: 400 })
    }

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(id) }
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    const gadai = await prisma.gadai.update({
      where: { gadaiID: parseInt(id) },
      data: { status: upperStatus },
      include: { customer: true }
    })

    return NextResponse.json({ success: true, message: 'Status updated successfully', data: gadai })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json({ success: false, message: 'Failed to update status' }, { status: 500 })
  }
}
