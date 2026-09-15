import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizePhoneNumber } from '@/lib/helpers'

// GET /api/public/riwayat?phone=xxx - Cek apakah nomor HP ini pernah mengajukan
// gadai sebelumnya, untuk menyarankan autofill data barang & rekening di form
// pengajuan baru. Tidak butuh auth (nomor HP sendiri yang jadi kuncinya, sama
// seperti /track).
export async function GET(request: NextRequest) {
  try {
    const phoneRaw = request.nextUrl.searchParams.get('phone')
    const phone = normalizePhoneNumber(phoneRaw)
    if (!phone) {
      return NextResponse.json({ success: false, message: 'Nomor HP wajib diisi' }, { status: 400 })
    }

    const customer = await prisma.customer.findUnique({
      where: { noHp: phone },
      include: {
        gadais: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            gadaiID: true,
            kategoriBarang: true,
            namaBarang: true,
            deskripsi: true,
            atributTinggal: true,
            nomorPolisi: true,
            fotoPendukung: true,
            noRekening: true,
            namaBank: true,
            namaRekening: true,
            createdAt: true
          }
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ success: true, data: { ditemukan: false } })
    }

    const rekeningTerakhir = customer.gadais.find((g) => g.noRekening && g.namaBank && g.namaRekening)

    return NextResponse.json({
      success: true,
      data: {
        ditemukan: true,
        nama: customer.nama,
        fotoKtp: customer.fotoKtp,
        pengajuan: customer.gadais.map((g) => ({
          gadaiID: g.gadaiID,
          kategoriBarang: g.kategoriBarang,
          namaBarang: g.namaBarang,
          deskripsi: g.deskripsi,
          atributTinggal: g.atributTinggal,
          nomorPolisi: g.nomorPolisi,
          fotoPendukung: g.fotoPendukung,
          createdAt: g.createdAt
        })),
        rekeningTerakhir: rekeningTerakhir
          ? { noRekening: rekeningTerakhir.noRekening, namaBank: rekeningTerakhir.namaBank, namaRekening: rekeningTerakhir.namaRekening }
          : null
      }
    })
  } catch (error) {
    console.error('Error fetching riwayat:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch riwayat' }, { status: 500 })
  }
}
