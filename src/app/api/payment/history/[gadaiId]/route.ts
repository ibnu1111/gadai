import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminDenganScope } from '@/lib/adminAuth'
import { adminTerbatas } from '@/lib/adminScope'

// GET /api/payment/history/[gadaiId] - Get payment history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gadaiId: string }> }
) {
  try {
    const auth = await getAdminDenganScope(request)
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const { scope } = auth

    const { gadaiId } = await params

    const gadai = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(gadaiId) }
    })

    if (!gadai) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    // Admin terkunci hanya boleh melihat riwayat pembayaran gadai miliknya.
    if (adminTerbatas(scope)) {
      const milikDia = await prisma.pinjaman.count({
        where: {
          gadaiID: gadai.gadaiID,
          pendanaan: { some: { sumberDanaId: scope.sumberDanaId as number } }
        }
      })
      if (milikDia === 0) {
        return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
      }
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
