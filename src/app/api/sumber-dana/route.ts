import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminDenganScope } from '@/lib/adminAuth'
import { adminTerbatas } from '@/lib/adminScope'

// GET /api/sumber-dana - Daftar kas asal pencairan (MEGA, TAB ANAK, TAB EMAS)
export async function GET(request: NextRequest) {
  try {
    const auth = await getAdminDenganScope(request)
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const { scope } = auth

    const data = await prisma.sumberDana.findMany({
      // Admin terkunci hanya boleh melihat sumber dana miliknya sendiri.
      where: adminTerbatas(scope)
        ? { id: scope.sumberDanaId as number }
        : { aktif: true },
      orderBy: [{ urutan: 'asc' }, { nama: 'asc' }],
      select: { id: true, nama: true }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching sumber dana:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch sumber dana' }, { status: 500 })
  }
}
