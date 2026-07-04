import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { addTenor } from '@/lib/helpers'

// PUT /api/gadai/[id]/confirm-transfer - Confirm the fund disbursement (transfer
// from the shop to the customer). Either confirms proof already uploaded by
// finance via the token link (MENUNGGU_VERIFIKASI_TRANSFER), or lets admin
// upload the proof manually in the same step (MENUNGGU_TRANSFER).
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const gadaiID = Number.parseInt(id)
    const body = await request.json().catch(() => ({}))
    const { buktiTransferCair, nominalTransferCair } = body

    const existing = await prisma.gadai.findUnique({ where: { gadaiID } })
    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    if (!['MENUNGGU_TRANSFER', 'MENUNGGU_VERIFIKASI_TRANSFER'].includes(existing.status)) {
      return NextResponse.json({
        success: false,
        message: `Tidak bisa konfirmasi transfer untuk status ${existing.status}`
      }, { status: 400 })
    }

    const bukti = buktiTransferCair || existing.buktiTransferCair
    const nominal = nominalTransferCair ?? existing.nominalTransferCair

    if (!bukti || !nominal) {
      return NextResponse.json({
        success: false,
        message: 'Bukti transfer dan nominal wajib diisi'
      }, { status: 400 })
    }

    const tanggalCair = new Date()
    const tanggalKembali = addTenor(tanggalCair, Number.parseFloat(existing.bungaPersentase.toString()))

    const gadai = await prisma.gadai.update({
      where: { gadaiID },
      data: {
        status: 'AKTIF',
        buktiTransferCair: bukti,
        nominalTransferCair: nominal,
        tanggalCair,
        tanggalPinjam: tanggalCair,
        tanggalKembali
      },
      include: { customer: true }
    })

    return NextResponse.json({
      success: true,
      message: 'Transfer dikonfirmasi, gadai aktif',
      data: gadai
    })
  } catch (error) {
    console.error('Error confirming transfer:', error)
    return NextResponse.json({ success: false, message: 'Failed to confirm transfer' }, { status: 500 })
  }
}
