import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

const VALID_STATUS = ['PENDING', 'MENUNGGU_TRANSFER', 'MENUNGGU_VERIFIKASI_TRANSFER', 'AKTIF', 'LUNAS', 'JATUH_TEMPO', 'OVERDUE', 'DITOLAK', 'DIPERPANJANG']

// PUT /api/gadai/[id]/status - Update gadai status
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
