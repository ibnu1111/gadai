import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizePhoneNumber, getStatusLabel, getStatusColor, isDueOrOverdue } from '@/lib/helpers'

// GET /api/public/gadai/track - Track gadai by phone
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const phone = searchParams.get('phone')

    if (!phone) {
      return NextResponse.json({ success: false, message: 'Phone number is required' }, { status: 400 })
    }

    const normalizedPhone = normalizePhoneNumber(phone)

    const customer = await prisma.customer.findUnique({
      where: { noHp: normalizedPhone! }
    })

    if (!customer) {
      return NextResponse.json({
        success: true,
        customer: null,
        pengajuan: []
      })
    }

    const gadais = await prisma.gadai.findMany({
      where: { customerID: customer.id },
      orderBy: { createdAt: 'desc' },
      select: {
        gadaiID: true,
        kategoriBarang: true,
        namaBarang: true,
        nominalPinjam: true,
        bungaPersentase: true,
        fee: true,
        tanggalPinjam: true,
        tanggalKembali: true,
        status: true,
        totalPembayaran: true,
        perpanjanganKe: true,
        bungaTerbayar: true,
        pendingAksi: true,
        pendingAksiNominal: true,
        pendingAksiCreatedAt: true
      }
    })

    const pengajuan = gadais.map(g => ({
      gadaiId: g.gadaiID,
      namaBarang: g.namaBarang,
      kategoriBarang: g.kategoriBarang,
      nominalPinjam: parseFloat(g.nominalPinjam.toString()),
      bungaPersentase: parseFloat(g.bungaPersentase.toString()),
      fee: parseFloat(g.fee.toString()),
      nominalPengambilan: parseFloat(g.nominalPinjam.toString()) + parseFloat(g.fee.toString()),
      tanggalPengajuan: g.tanggalPinjam,
      tanggalKembali: g.tanggalKembali,
      status: g.status,
      statusLabel: getStatusLabel(g.status),
      statusColor: getStatusColor(g.status),
      perpanjanganKe: g.perpanjanganKe,
      totalPembayaran: parseFloat(g.totalPembayaran.toString()),
      bungaTerbayar: parseFloat(g.bungaTerbayar.toString()),
      isDue: isDueOrOverdue(g.status, g.tanggalKembali),
      pendingAksi: g.pendingAksi,
      pendingAksiNominal: g.pendingAksiNominal ? parseFloat(g.pendingAksiNominal.toString()) : null,
      pendingAksiCreatedAt: g.pendingAksiCreatedAt
    }))

    return NextResponse.json({
      success: true,
      customer: {
        customerId: customer.id,
        customerName: customer.nama,
        phone: customer.noHp
      },
      pengajuan
    })
  } catch (error) {
    console.error('Error tracking gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to track gadai' }, { status: 500 })
  }
}
