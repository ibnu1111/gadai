import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

const VALID_KATEGORI = ['Mobil', 'Motor', 'Elektronik', 'HP', 'Laptop', 'Perhiasan', 'Lainnya']

// GET /api/gadai - Get all gadai with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const tanggalMulai = searchParams.get('tanggalMulai')
    const tanggalAkhir = searchParams.get('tanggalAkhir')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit
    const where: any = {}

    if (status) {
      where.status = status
    }

    if (tanggalMulai || tanggalAkhir) {
      where.tanggalPinjam = {}
      if (tanggalMulai) where.tanggalPinjam.gte = new Date(tanggalMulai)
      if (tanggalAkhir) where.tanggalPinjam.lte = new Date(tanggalAkhir + 'T23:59:59')
    }

    if (search) {
      where.OR = [
        { namaBarang: { contains: search, mode: 'insensitive' } },
        { customer: { nama: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const [gadais, total] = await Promise.all([
      prisma.gadai.findMany({
        where,
        include: { customer: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.gadai.count({ where })
    ])

    return NextResponse.json({
      success: true,
      data: gadais,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error getting gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch gadai' }, { status: 500 })
  }
}

// POST /api/gadai - Create new gadai
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      customerID, kategoriBarang, namaBarang, nominalPinjam,
      bungaPersentase, tanggalPinjam, tanggalKembali, atributTinggal,
      deskripsi, fotoBarang, fotoPendukung
    } = body

    if (!customerID || !kategoriBarang || !namaBarang || !nominalPinjam ||
        !tanggalPinjam || !tanggalKembali || !atributTinggal || !fotoBarang) {
      return NextResponse.json({ success: false, message: 'Required fields are missing' }, { status: 400 })
    }

    if (!VALID_KATEGORI.includes(kategoriBarang)) {
      return NextResponse.json({
        success: false,
        message: `Kategori barang must be one of: ${VALID_KATEGORI.join(', ')}`
      }, { status: 400 })
    }

    const bunga = parseFloat(bungaPersentase) || 20
    const fee = (parseFloat(nominalPinjam) * bunga) / 100

    const gadai = await prisma.gadai.create({
      data: {
        customerID: parseInt(customerID),
        kategoriBarang,
        namaBarang,
        nominalPinjam: parseFloat(nominalPinjam),
        bungaPersentase: bunga,
        fee,
        tanggalPinjam: new Date(tanggalPinjam),
        tanggalKembali: new Date(tanggalKembali),
        atributTinggal,
        deskripsi,
        fotoBarang,
        fotoPendukung,
        status: 'AKTIF',
        createdBy: admin.nama
      },
      include: { customer: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Gadai created successfully',
      data: gadai
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to create gadai' }, { status: 500 })
  }
}
