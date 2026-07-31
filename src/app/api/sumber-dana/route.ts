import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

// GET /api/sumber-dana - Daftar kas asal pencairan (MEGA, TAB ANAK, TAB EMAS)
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const data = await prisma.sumberDana.findMany({
      where: { aktif: true },
      orderBy: [{ urutan: 'asc' }, { nama: 'asc' }],
      select: { id: true, nama: true }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching sumber dana:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch sumber dana' }, { status: 500 })
  }
}
