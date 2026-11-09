import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminDenganScope } from '@/lib/adminAuth'
import { akhirHariWib } from '@/lib/bukuBesar'
import { predicateGadai, predicatePinjaman, terapkanScope } from '@/lib/adminScope'

// GET /api/pinjaman/summary - statistik ringkas berbasis buku besar (Pinjaman/Siklus),
// dipakai dashboard supaya nyambung dengan data yang sama dengan daftar pinjaman.
export async function GET(request: NextRequest) {
  try {
    const auth = await getAdminDenganScope(request)
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const { scope } = auth

    const now = new Date()
    const awalBulan = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
    const awalBulanDepan = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

    const scopePinjaman = predicatePinjaman(scope)
    const scopeGadai = predicateGadai(scope)

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
      prisma.pinjaman.count({ where: terapkanScope({ status: 'AKTIF' }, scopePinjaman) }),
      prisma.pinjaman.aggregate({
        where: terapkanScope({ status: 'AKTIF' }, scopePinjaman),
        _sum: { pokok: true }
      }),
      prisma.siklus.count({
        where: terapkanScope(
          { status: 'BERJALAN', pinjaman: { status: 'AKTIF' }, tanggalJatuhTempo: { lte: akhirHariWib(0) } },
          scopePinjaman
        )
      }),
      prisma.siklus.count({
        where: terapkanScope(
          { status: 'BERJALAN', pinjaman: { status: 'AKTIF' }, tanggalJatuhTempo: { lte: akhirHariWib(7) } },
          scopePinjaman
        )
      }),
      prisma.siklus.count({
        where: terapkanScope(
          { status: 'BERJALAN', pinjaman: { status: 'AKTIF' }, tanggalJatuhTempo: { lt: akhirHariWib(-1) } },
          scopePinjaman
        )
      }),
      prisma.pinjaman.count({
        where: terapkanScope(
          { status: 'LUNAS', tanggalSelesai: { gte: awalBulan, lt: awalBulanDepan } },
          scopePinjaman
        )
      }),
      prisma.siklus.aggregate({
        where: terapkanScope(
          { tanggalJatuhTempo: { gte: awalBulan, lt: awalBulanDepan } },
          scopePinjaman
        ),
        _sum: { nominalBunga: true }
      }),
      prisma.pengeluaran.aggregate({
        where: { tanggal: { gte: awalBulan, lt: awalBulanDepan } },
        _sum: { nominal: true }
      }),
      prisma.gadai.count({
        where: terapkanScope(
          { status: { in: ['PENDING', 'MENUNGGU_REKENING', 'MENUNGGU_TRANSFER', 'MENUNGGU_VERIFIKASI_TRANSFER'] } },
          scopeGadai
        )
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
