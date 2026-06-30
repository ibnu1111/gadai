import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { updateStatusBasedOnDueDate } from '@/lib/helpers'

// POST /api/payment - Process payment
export async function POST(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { gadaiID, jumlahBayar, catatan } = await request.json()

    if (!gadaiID || !jumlahBayar) {
      return NextResponse.json({ success: false, message: 'gadaiID and jumlahBayar are required' }, { status: 400 })
    }

    const gadai = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(gadaiID) }
    })

    if (!gadai) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    if (gadai.status === 'LUNAS' || gadai.status === 'DITOLAK' || gadai.status === 'DIPERPANJANG') {
      return NextResponse.json({
        success: false,
        message: `Cannot process payment for gadai with status ${gadai.status}`
      }, { status: 400 })
    }

    const nominalBayar = parseFloat(jumlahBayar)
    const totalKembali = parseFloat(gadai.nominalPinjam.toString()) + parseFloat(gadai.fee.toString())
    const newTotalPembayaran = parseFloat(gadai.totalPembayaran.toString()) + nominalBayar

    let newStatus = gadai.status
    if (newTotalPembayaran >= totalKembali) {
      newStatus = 'LUNAS'
    } else {
      newStatus = updateStatusBasedOnDueDate(gadai.status, gadai.tanggalKembali)
    }

    await prisma.gadai.update({
      where: { gadaiID: parseInt(gadaiID) },
      data: {
        totalPembayaran: newTotalPembayaran,
        status: newStatus
      }
    })

    const payment = await prisma.payment.create({
      data: {
        gadaiID: parseInt(gadaiID),
        jumlahBayar: nominalBayar,
        tipeBayar: 'BAYAR',
        catatan: catatan || null,
        createdBy: admin.nama
      }
    })

    return NextResponse.json({
      success: true,
      message: newStatus === 'LUNAS' ? 'Gadai telah lunas!' : 'Pembayaran berhasil diproses',
      data: {
        paymentId: payment.id,
        jumlahBayar: nominalBayar,
        totalPembayaran: newTotalPembayaran,
        totalKembali,
        sisa: Math.max(0, totalKembali - newTotalPembayaran),
        status: newStatus
      }
    })
  } catch (error) {
    console.error('Error processing payment:', error)
    return NextResponse.json({ success: false, message: 'Failed to process payment' }, { status: 500 })
  }
}
