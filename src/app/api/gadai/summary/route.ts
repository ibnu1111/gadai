import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

const VALID_STATUS = ['PENDING', 'MENUNGGU_TRANSFER', 'MENUNGGU_VERIFIKASI_TRANSFER', 'AKTIF', 'LUNAS', 'JATUH_TEMPO', 'OVERDUE', 'DITOLAK', 'DIPERPANJANG']

// GET /api/gadai/summary - Get summary statistics
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const [
      totalGadai,
      aktifCount,
      pendingCount,
      jatuhTempoCount,
      overdueCount,
      lunasCount,
      totalNominal
    ] = await Promise.all([
      prisma.gadai.count(),
      prisma.gadai.count({ where: { status: 'AKTIF' } }),
      prisma.gadai.count({ where: { status: 'PENDING' } }),
      prisma.gadai.count({ where: { status: 'JATUH_TEMPO' } }),
      prisma.gadai.count({ where: { status: 'OVERDUE' } }),
      prisma.gadai.count({ where: { status: 'LUNAS' } }),
      prisma.gadai.aggregate({
        _sum: { nominalPinjam: true },
        where: { status: { in: ['AKTIF', 'JATUH_TEMPO', 'OVERDUE'] } }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalGadai,
        aktif: aktifCount,
        pending: pendingCount,
        jatuhTempo: jatuhTempoCount,
        overdue: overdueCount,
        lunas: lunasCount,
        totalNominal: totalNominal._sum.nominalPinjam || 0
      }
    })
  } catch (error) {
    console.error('Error getting summary:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch summary' }, { status: 500 })
  }
}
