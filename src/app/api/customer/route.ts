import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

const ACTIVE_STATUSES = new Set(['AKTIF', 'JATUH_TEMPO', 'OVERDUE'])

// GET /api/customer - List unique customers (by noHp) with aggregated pengajuan stats
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') || '1')
    const limit = Number.parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')

    const where: any = search
      ? {
          OR: [
            { nama: { contains: search, mode: 'insensitive' } },
            { noHp: { contains: search, mode: 'insensitive' } }
          ]
        }
      : {}

    const skip = (page - 1) * limit

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          gadais: {
            select: { gadaiID: true, nominalPinjam: true, status: true, createdAt: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.customer.count({ where })
    ])

    const data = customers.map((c) => {
      const sortedGadais = [...c.gadais].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      const totalNominal = c.gadais.reduce((sum, g) => sum + Number(g.nominalPinjam), 0)
      const activeCount = c.gadais.filter((g) => ACTIVE_STATUSES.has(g.status)).length

      return {
        id: c.id,
        nama: c.nama,
        noHp: c.noHp,
        fotoKtp: c.fotoKtp,
        createdAt: c.createdAt,
        totalPengajuan: c.gadais.length,
        totalNominal,
        activeCount,
        lastStatus: sortedGadais[0]?.status ?? null,
        lastGadaiAt: sortedGadais[0]?.createdAt ?? null
      }
    })

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error listing customers:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch customers' }, { status: 500 })
  }
}
