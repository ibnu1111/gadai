import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { akhirHariWib } from '@/lib/bukuBesar'

// GET /api/pinjaman?status=AKTIF|LUNAS|LELANG|WRITEOFF&hari=&search=&page=&limit=
// Daftar pinjaman terpadu: status=AKTIF menampilkan siklus berjalan (dengan tanggal
// jatuh tempo) sebagai satu list, menggantikan tampilan "jatuh tempo" & "pengajuan"
// yang sebelumnya terpisah.
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const params = request.nextUrl.searchParams
    const status = (params.get('status') ?? 'AKTIF').toUpperCase()
    const search = params.get('search')?.trim() ?? ''
    const hariParam = params.get('hari')
    const page = Math.max(Number(params.get('page') ?? 1) || 1, 1)
    const limit = Math.min(Math.max(Number(params.get('limit') ?? 30) || 30, 1), 200)

    if (status === 'AKTIF') {
      const hari = hariParam !== null ? Math.min(Math.max(Number(hariParam) || 0, 0), 3650) : null
      const where = {
        status: 'BERJALAN',
        pinjaman: {
          status: 'AKTIF',
          ...(search ? { customer: { nama: { contains: search, mode: 'insensitive' as const } } } : {})
        },
        ...(hari !== null ? { tanggalJatuhTempo: { lte: akhirHariWib(hari) } } : {})
      }

      const [data, total] = await Promise.all([
        prisma.siklus.findMany({
          where,
          orderBy: [{ tanggalJatuhTempo: 'asc' }, { id: 'asc' }],
          skip: (page - 1) * limit,
          take: limit,
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
        }),
        prisma.siklus.count({ where })
      ])

      return NextResponse.json({
        success: true,
        data,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      })
    }

    if (!['LUNAS', 'LELANG', 'WRITEOFF'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Status tidak valid' }, { status: 400 })
    }

    const pinjamanWhere = {
      status,
      ...(search ? { customer: { nama: { contains: search, mode: 'insensitive' as const } } } : {})
    }

    const [pinjaman, total] = await Promise.all([
      prisma.pinjaman.findMany({
        where: pinjamanWhere,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          jenis: true,
          namaBarang: true,
          pokok: true,
          gadaiID: true,
          nominalAkhir: true,
          tanggalSelesai: true,
          customer: { select: { id: true, nama: true, noHp: true } },
          siklus: { orderBy: { siklusKe: 'desc' }, take: 1 }
        }
      }),
      prisma.pinjaman.count({ where: pinjamanWhere })
    ])

    const data = pinjaman.map((p) => {
      const siklusTerakhir = p.siklus[0]
      return {
        id: siklusTerakhir?.id ?? p.id,
        siklusKe: siklusTerakhir?.siklusKe ?? 1,
        tanggalMulai: siklusTerakhir?.tanggalMulai ?? p.tanggalSelesai,
        tanggalJatuhTempo: siklusTerakhir?.tanggalJatuhTempo ?? p.tanggalSelesai,
        nominalBunga: siklusTerakhir?.nominalBunga ?? '0',
        pinjaman: {
          id: p.id,
          jenis: p.jenis,
          namaBarang: p.namaBarang,
          pokok: p.pokok,
          gadaiID: p.gadaiID,
          customer: p.customer
        },
        nominalAkhir: p.nominalAkhir,
        tanggalSelesai: p.tanggalSelesai
      }
    })

    return NextResponse.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    })
  } catch (error) {
    console.error('Error fetching pinjaman:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch pinjaman' }, { status: 500 })
  }
}
