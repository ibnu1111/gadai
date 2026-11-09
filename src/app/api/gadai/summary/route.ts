import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminDenganScope } from '@/lib/adminAuth'
import { predicateGadai, terapkanScope } from '@/lib/adminScope'

const VALID_STATUS = ['PENDING', 'MENUNGGU_REKENING', 'MENUNGGU_TRANSFER', 'MENUNGGU_VERIFIKASI_TRANSFER', 'AKTIF', 'LUNAS', 'JATUH_TEMPO', 'OVERDUE', 'DITOLAK', 'DIPERPANJANG']

// GET /api/gadai/summary - Get summary statistics
export async function GET(request: NextRequest) {
  try {
    const auth = await getAdminDenganScope(request)
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const { scope } = auth
    const scopeGadai = predicateGadai(scope)

    const [
      totalGadai,
      aktifCount,
      pendingCount,
      jatuhTempoCount,
      overdueCount,
      lunasCount,
      totalNominal
    ] = await Promise.all([
      prisma.gadai.count({ where: terapkanScope({}, scopeGadai) }),
      prisma.gadai.count({ where: terapkanScope({ status: 'AKTIF' }, scopeGadai) }),
      prisma.gadai.count({ where: terapkanScope({ status: 'PENDING' }, scopeGadai) }),
      prisma.gadai.count({ where: terapkanScope({ status: 'JATUH_TEMPO' }, scopeGadai) }),
      prisma.gadai.count({ where: terapkanScope({ status: 'OVERDUE' }, scopeGadai) }),
      prisma.gadai.count({ where: terapkanScope({ status: 'LUNAS' }, scopeGadai) }),
      prisma.gadai.aggregate({
        _sum: { nominalPinjam: true },
        where: terapkanScope({ status: { in: ['AKTIF', 'JATUH_TEMPO', 'OVERDUE'] } }, scopeGadai)
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
