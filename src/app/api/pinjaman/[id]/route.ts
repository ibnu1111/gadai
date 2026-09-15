import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

// GET /api/pinjaman/[id] - Detail satu pinjaman: data pokok, riwayat siklus, dan
// rincian sumber dana pencairan.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const pinjamanId = Number.parseInt(id)
    if (!Number.isInteger(pinjamanId)) {
      return NextResponse.json({ success: false, message: 'ID pinjaman tidak valid' }, { status: 400 })
    }

    const pinjaman = await prisma.pinjaman.findUnique({
      where: { id: pinjamanId },
      include: {
        customer: { select: { id: true, nama: true, noHp: true } },
        gadai: { select: { gadaiID: true, status: true } },
        siklus: { orderBy: { siklusKe: 'desc' } },
        pendanaan: { include: { sumberDana: { select: { id: true, nama: true } } } }
      }
    })

    if (!pinjaman) {
      return NextResponse.json({ success: false, message: 'Pinjaman tidak ditemukan' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: pinjaman })
  } catch (error) {
    console.error('Error fetching pinjaman detail:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch pinjaman' }, { status: 500 })
  }
}
