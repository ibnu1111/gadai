import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { guardMutasi } from '@/lib/adminAuth'

// DELETE /api/pengeluaran/[id] - Hapus satu catatan pengeluaran.
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const guard = await guardMutasi(request, 'mengubah pengeluaran')
    if ('response' in guard) return guard.response
    const { admin } = guard

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
