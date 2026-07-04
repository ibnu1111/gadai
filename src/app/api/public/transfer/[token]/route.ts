import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/public/transfer/[token] - Fetch minimal gadai info for the finance
// upload page (no auth, the random token itself is the secret).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const gadai = await prisma.gadai.findUnique({
      where: { transferToken: token },
      include: { customer: true }
    })

    if (!gadai) {
      return NextResponse.json({ success: false, message: 'Link tidak ditemukan' }, { status: 404 })
    }

    if (gadai.status !== 'MENUNGGU_TRANSFER') {
      return NextResponse.json({
        success: false,
        message: 'Link ini sudah tidak berlaku (bukti transfer sudah diunggah atau gadai sudah diproses)'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        gadaiID: gadai.gadaiID,
        namaBarang: gadai.namaBarang,
        customerNama: gadai.customer.nama,
        noRekening: gadai.noRekening,
        namaBank: gadai.namaBank,
        nominalPinjam: gadai.nominalPinjam
      }
    })
  } catch (error) {
    console.error('Error fetching transfer link:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch data' }, { status: 500 })
  }
}

// POST /api/public/transfer/[token] - Finance uploads proof of disbursement
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { nominal, bukti } = await request.json()

    if (!nominal || !bukti) {
      return NextResponse.json({
        success: false,
        message: 'Nominal dan bukti transfer wajib diisi'
      }, { status: 400 })
    }

    const gadai = await prisma.gadai.findUnique({ where: { transferToken: token } })
    if (!gadai) {
      return NextResponse.json({ success: false, message: 'Link tidak ditemukan' }, { status: 404 })
    }

    if (gadai.status !== 'MENUNGGU_TRANSFER') {
      return NextResponse.json({
        success: false,
        message: 'Link ini sudah tidak berlaku'
      }, { status: 400 })
    }

    await prisma.gadai.update({
      where: { gadaiID: gadai.gadaiID },
      data: {
        status: 'MENUNGGU_VERIFIKASI_TRANSFER',
        buktiTransferCair: bukti,
        nominalTransferCair: parseFloat(nominal)
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Bukti transfer berhasil diunggah, menunggu verifikasi admin'
    })
  } catch (error) {
    console.error('Error uploading transfer proof:', error)
    return NextResponse.json({ success: false, message: 'Failed to upload transfer proof' }, { status: 500 })
  }
}
