import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { akhirHariWib } from '@/lib/bukuBesar'

// GET /api/pinjaman/tempo?hari=0 - Siklus berjalan yang sudah lewat tempo atau
// jatuh tempo dalam N hari ke depan.
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const hariParam = Number(request.nextUrl.searchParams.get('hari') ?? 0)
    const hari = Number.isFinite(hariParam) ? Math.min(Math.max(Math.trunc(hariParam), 0), 60) : 0

    const data = await prisma.siklus.findMany({
      where: {
        status: 'BERJALAN',
        tanggalJatuhTempo: { lte: akhirHariWib(hari) },
        pinjaman: { status: 'AKTIF' }
      },
      orderBy: [{ tanggalJatuhTempo: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        siklusKe: true,
        tanggalMulai: true,
        tanggalJatuhTempo: true,
        nominalBunga: true,
        pinjaman: {
          select: {
            id: true,
            jenis: true,
            namaBarang: true,
            pokok: true,
            gadaiID: true,
            customer: { select: { id: true, nama: true, noHp: true } }
          }
        }
      }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching jatuh tempo:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch jatuh tempo' }, { status: 500 })
  }
}
