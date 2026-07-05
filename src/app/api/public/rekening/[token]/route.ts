import { NextRequest, NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { prisma } from '@/lib/prisma'

// GET /api/public/rekening/[token] - Fetch minimal gadai info for the
// customer's self-service "isi rekening" page (no auth, the random token
// itself is the secret).
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const gadai = await prisma.gadai.findUnique({
      where: { rekeningToken: token },
      include: { customer: true }
    })

    if (!gadai) {
      return NextResponse.json({ success: false, message: 'Link tidak ditemukan' }, { status: 404 })
    }

    if (gadai.status !== 'MENUNGGU_REKENING') {
      return NextResponse.json({
        success: false,
        message: 'Link ini sudah tidak berlaku (rekening sudah diisi atau gadai sudah diproses)'
      }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: {
        gadaiID: gadai.gadaiID,
        namaBarang: gadai.namaBarang,
        customerNama: gadai.customer.nama,
        nominalPinjam: gadai.nominalPinjam
      }
    })
  } catch (error) {
    console.error('Error fetching rekening link:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch data' }, { status: 500 })
  }
}

// POST /api/public/rekening/[token] - Customer submits their bank account
// details, moving the gadai on to MENUNGGU_TRANSFER (admin then sends the
// finance disbursement link).
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params
    const { noRekening, namaBank } = await request.json()

    if (!noRekening || !namaBank) {
      return NextResponse.json({
        success: false,
        message: 'Nomor rekening dan nama bank wajib diisi'
      }, { status: 400 })
    }

    const gadai = await prisma.gadai.findUnique({ where: { rekeningToken: token } })
    if (!gadai) {
      return NextResponse.json({ success: false, message: 'Link tidak ditemukan' }, { status: 404 })
    }

    if (gadai.status !== 'MENUNGGU_REKENING') {
      return NextResponse.json({
        success: false,
        message: 'Link ini sudah tidak berlaku'
      }, { status: 400 })
    }

    const transferToken = randomBytes(24).toString('hex')
    await prisma.gadai.update({
      where: { gadaiID: gadai.gadaiID },
      data: { noRekening, namaBank, status: 'MENUNGGU_TRANSFER', transferToken }
    })

    return NextResponse.json({
      success: true,
      message: 'Rekening berhasil disimpan, menunggu proses pencairan dana'
    })
  } catch (error) {
    console.error('Error saving rekening:', error)
    return NextResponse.json({ success: false, message: 'Failed to save rekening' }, { status: 500 })
  }
}
