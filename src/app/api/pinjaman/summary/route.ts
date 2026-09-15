import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { akhirHariWib } from '@/lib/bukuBesar'

// GET /api/pinjaman/summary - statistik ringkas berbasis buku besar (Pinjaman/Siklus),
// dipakai dashboard supaya nyambung dengan data yang sama dengan daftar pinjaman.
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const awalBulan = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const awalBulanDepan = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

    const [
      aktifCount,
      totalPokokAktif,
      jatuhTempoHariIni,
      jatuhTempo7Hari,
      terlambat,
      lunasBulanIni,
      keuntunganBulanIni,
      pengeluaranBulanIni,
      pengajuanBaru
    ] = await Promise.all([
      prisma.pinjaman.count({ where: { status: 'AKTIF' } }),
      prisma.pinjaman.aggregate({ where: { status: 'AKTIF' }, _sum: { pokok: true } }),
      prisma.siklus.count({
        where: { status: 'BERJALAN', pinjaman: { status: 'AKTIF' }, tanggalJatuhTempo: { lte: akhirHariWib(0) } }
      }),
      prisma.siklus.count({
        where: { status: 'BERJALAN', pinjaman: { status: 'AKTIF' }, tanggalJatuhTempo: { lte: akhirHariWib(7) } }
      }),
      prisma.siklus.count({
        where: { status: 'BERJALAN', pinjaman: { status: 'AKTIF' }, tanggalJatuhTempo: { lt: akhirHariWib(-1) } }
      }),
      prisma.pinjaman.count({
        where: { status: 'LUNAS', tanggalSelesai: { gte: awalBulan, lt: awalBulanDepan } }
      }),
      prisma.siklus.aggregate({
        where: { tanggalJatuhTempo: { gte: awalBulan, lt: awalBulanDepan } },
        _sum: { nominalBunga: true }
      }),
      prisma.pengeluaran.aggregate({
        where: { tanggal: { gte: awalBulan, lt: awalBulanDepan } },
        _sum: { nominal: true }
      }),
      prisma.gadai.count({
        where: { status: { in: ['PENDING', 'MENUNGGU_REKENING', 'MENUNGGU_TRANSFER', 'MENUNGGU_VERIFIKASI_TRANSFER'] } }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        aktifCount,
        totalPokokAktif: Number(totalPokokAktif._sum.pokok ?? 0),
        jatuhTempoHariIni,
        jatuhTempo7Hari,
        terlambat,
        lunasBulanIni,
        keuntunganBulanIni: Number(keuntunganBulanIni._sum.nominalBunga ?? 0) - Number(pengeluaranBulanIni._sum.nominal ?? 0),
        pengajuanBaru
      }
    })
  } catch (error) {
    console.error('Error fetching pinjaman summary:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch summary' }, { status: 500 })
  }
}
