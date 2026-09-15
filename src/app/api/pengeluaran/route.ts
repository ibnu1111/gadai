import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

// GET /api/pengeluaran?bulan=YYYY-MM - Daftar pengeluaran bulan tsb (default bulan berjalan).
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const bulanParam = request.nextUrl.searchParams.get('bulan')
    const cocok = bulanParam ? /^(\d{4})-(\d{2})$/.exec(bulanParam) : null
    const now = new Date()
    const tahun = cocok ? Number(cocok[1]) : now.getUTCFullYear()
    const bulan = cocok ? Number(cocok[2]) : now.getUTCMonth() + 1
    const awal = new Date(Date.UTC(tahun, bulan - 1, 1))
    const akhir = new Date(Date.UTC(tahun, bulan, 1))

    const data = await prisma.pengeluaran.findMany({
      where: { tanggal: { gte: awal, lt: akhir } },
      orderBy: [{ tanggal: 'asc' }, { id: 'asc' }]
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error fetching pengeluaran:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch pengeluaran' }, { status: 500 })
  }
}

// POST /api/pengeluaran - Catat pengeluaran baru.
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const keterangan = String(body?.keterangan ?? '').trim()
    const tanggalRaw = String(body?.tanggal ?? '').trim()

    if (!keterangan) {
      return NextResponse.json({ success: false, message: 'Keterangan wajib diisi' }, { status: 400 })
    }
    const tanggal = tanggalRaw ? new Date(`${tanggalRaw}T12:00:00.000Z`) : new Date()
    if (Number.isNaN(tanggal.getTime())) {
      return NextResponse.json({ success: false, message: 'Tanggal tidak valid' }, { status: 400 })
    }

    let nominal: Prisma.Decimal
    try {
      nominal = new Prisma.Decimal(body?.nominal ?? 0)
    } catch {
      return NextResponse.json({ success: false, message: 'Nominal tidak valid' }, { status: 400 })
    }
    if (nominal.lessThanOrEqualTo(0)) {
      return NextResponse.json({ success: false, message: 'Nominal harus lebih dari nol' }, { status: 400 })
    }

    const data = await prisma.pengeluaran.create({
      data: { tanggal, keterangan, nominal, dibuatOleh: admin.nama }
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error creating pengeluaran:', error)
    return NextResponse.json({ success: false, message: 'Failed to create pengeluaran' }, { status: 500 })
  }
}
