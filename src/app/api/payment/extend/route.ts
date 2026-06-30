import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

// POST /api/payment/extend - Extend gadai
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { gadaiID, extensionPeriod, feePayment, newFee } = await request.json()

    if (!gadaiID || !extensionPeriod || !feePayment) {
      return NextResponse.json({
        success: false,
        message: 'gadaiID, extensionPeriod, and feePayment are required'
      }, { status: 400 })
    }

    const VALID_PERIODS = ['2_WEEKS', '1_MONTH']
    if (!VALID_PERIODS.includes(extensionPeriod)) {
      return NextResponse.json({
        success: false,
        message: `extensionPeriod must be one of: ${VALID_PERIODS.join(', ')}`
      }, { status: 400 })
    }

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(gadaiID) },
      include: { customer: true }
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    const validStatuses = ['AKTIF', 'JATUH_TEMPO', 'OVERDUE']
    if (!validStatuses.includes(existing.status)) {
      return NextResponse.json({
        success: false,
        message: `Cannot extend gadai with status ${existing.status}`
      }, { status: 400 })
    }

    const minFee = parseFloat(existing.fee.toString())
    if (parseFloat(feePayment) < minFee) {
      return NextResponse.json({
        success: false,
        message: `Fee payment must be at least Rp ${minFee.toLocaleString('id-ID')}`
      }, { status: 400 })
    }

    const oldTanggalKembali = new Date(existing.tanggalKembali)
    let newTanggalKembali: Date

    if (extensionPeriod === '2_WEEKS') {
      newTanggalKembali = new Date(oldTanggalKembali)
      newTanggalKembali.setDate(newTanggalKembali.getDate() + 14)
    } else {
      newTanggalKembali = new Date(oldTanggalKembali)
      newTanggalKembali.setMonth(newTanggalKembali.getMonth() + 1)
    }

    const bungaNominal = newFee ? parseFloat(newFee) : parseFloat(existing.fee.toString())

    await prisma.gadai.update({
      where: { gadaiID: parseInt(gadaiID) },
      data: {
        status: 'DIPERPANJANG',
        totalPembayaran: parseFloat(existing.fee.toString())
      }
    })

    await prisma.payment.create({
      data: {
        gadaiID: parseInt(gadaiID),
        jumlahBayar: parseFloat(feePayment),
        tipeBayar: 'PERPANJANG',
        catatan: `Perpanjangan ke ${existing.perpanjanganKe + 1}`,
        createdBy: admin.nama
      }
    })

    const newGadai = await prisma.gadai.create({
      data: {
        customerID: existing.customerID,
        kategoriBarang: existing.kategoriBarang,
        namaBarang: existing.namaBarang,
        nominalPinjam: parseFloat(existing.nominalPinjam.toString()),
        bungaPersentase: parseFloat(existing.bungaPersentase.toString()),
        fee: bungaNominal,
        tanggalPinjam: new Date(),
        tanggalKembali: newTanggalKembali,
        atributTinggal: existing.atributTinggal,
        deskripsi: existing.deskripsi,
        fotoBarang: existing.fotoBarang,
        fotoPendukung: existing.fotoPendukung,
        status: 'AKTIF',
        parentGadaiID: parseInt(gadaiID),
        perpanjanganKe: existing.perpanjanganKe + 1,
        createdBy: admin.nama
      },
      include: { customer: true }
    })

    return NextResponse.json({
      success: true,
      message: `Perpanjangan berhasil. Gadai baru #${newGadai.gadaiID} telah dibuat.`,
      data: {
        oldGadaiId: parseInt(gadaiID),
        newGadaiId: newGadai.gadaiID,
        newTanggalKembali: newGadai.tanggalKembali,
        newFee: bungaNominal
      }
    })
  } catch (error) {
    console.error('Error extending gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to extend gadai' }, { status: 500 })
  }
}
