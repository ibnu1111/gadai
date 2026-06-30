import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

// GET /api/payment/history/[gadaiId] - Get payment history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gadaiId: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { gadaiId } = await params

    const gadai = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(gadaiId) }
    })

    if (!gadai) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    const payments = await prisma.payment.findMany({
      where: { gadaiID: parseInt(gadaiId) },
      orderBy: { createdAt: 'desc' }
    })

    const totalKembali = parseFloat(gadai.nominalPinjam.toString()) + parseFloat(gadai.fee.toString())

    return NextResponse.json({
      success: true,
      data: {
        gadai: {
          gadaiID: gadai.gadaiID,
          nominalPinjam: parseFloat(gadai.nominalPinjam.toString()),
          fee: parseFloat(gadai.fee.toString()),
          totalKembali,
          totalPembayaran: parseFloat(gadai.totalPembayaran.toString()),
          sisa: Math.max(0, totalKembali - parseFloat(gadai.totalPembayaran.toString())),
          status: gadai.status
        },
        payments
      }
    })
  } catch (error) {
    console.error('Error getting payment history:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch payment history' }, { status: 500 })
  }
}
