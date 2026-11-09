import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminDenganScope } from '@/lib/adminAuth'
import { adminTerbatas, predicateCustomer } from '@/lib/adminScope'

// GET /api/customer/[id] - Get single customer with full pengajuan history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAdminDenganScope(request)
    if (!auth) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const { scope } = auth

    const { id } = await params
    const sumberDanaId = scope.sumberDanaId
    const terbatas = adminTerbatas(scope)

    const customer = await prisma.customer.findUnique({
      where: { id: Number.parseInt(id) },
      include: {
        // Admin terkunci hanya melihat gadai miliknya sendiri. Gadai yang belum
        // pernah dicairkan belum punya sumber dana dan tetap terlihat karena
        // funnel pengajuan bersifat bersama.
        gadais: {
          orderBy: { createdAt: 'desc' },
          ...(terbatas
            ? {
                where: {
                  OR: [
                    { pinjaman: { is: null } },
                    {
                      pinjaman: {
                        is: { pendanaan: { some: { sumberDanaId: sumberDanaId as number } } }
                      }
                    }
                  ]
                }
              }
            : {})
        },
        // Riwayat pinjaman buku besar (transaksi walk-in nyata), terpisah dari
        // funnel pengajuan online di atas.
        pinjaman: {
          orderBy: { tanggalCair: 'desc' },
          include: {
            siklus: { orderBy: { siklusKe: 'desc' }, take: 1 }
          },
          ...(terbatas
            ? { where: { pendanaan: { some: { sumberDanaId: sumberDanaId as number } } } }
            : {})
        }
      }
    })

    if (!customer) {
      return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 })
    }

    // Admin terkunci hanya boleh membuka customer yang relevan baginya.
    if (terbatas) {
      const relevan = await prisma.customer.count({
        where: { AND: [{ id: customer.id }, predicateCustomer(scope)] } as Prisma.CustomerWhereInput
      })
      if (relevan === 0) {
        return NextResponse.json({ success: false, message: 'Customer not found' }, { status: 404 })
      }
    }

    return NextResponse.json({ success: true, data: customer })
  } catch (error) {
    console.error('Error getting customer:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch customer' }, { status: 500 })
  }
}
