import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

// DELETE /api/pengeluaran/[id] - Hapus satu catatan pengeluaran.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const pengeluaranId = Number(id)
    if (!Number.isInteger(pengeluaranId) || pengeluaranId <= 0) {
      return NextResponse.json({ success: false, message: 'ID tidak valid' }, { status: 400 })
    }

    await prisma.pengeluaran.delete({ where: { id: pengeluaranId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting pengeluaran:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete pengeluaran' }, { status: 500 })
  }
}
