import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

// GET /api/gadai/[id] - Get single gadai
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const gadai = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(id) },
      include: {
        customer: true,
        payments: { orderBy: { createdAt: 'desc' } },
        parentGadai: true,
        extensions: true
      }
    })

    if (!gadai) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: gadai })
  } catch (error) {
    console.error('Error getting gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch gadai' }, { status: 500 })
  }
}

// PUT /api/gadai/[id] - Update gadai
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
    const updateData = await request.json()

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(id) }
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    if (updateData.nominalPinjam || updateData.bungaPersentase) {
      const nominal = parseFloat(updateData.nominalPinjam) || parseFloat(existing.nominalPinjam.toString())
      const bunga = parseFloat(updateData.bungaPersentase) || parseFloat(existing.bungaPersentase.toString())
      updateData.fee = (nominal * bunga) / 100
      updateData.nominalPinjam = nominal
    }

    if (updateData.tanggalPinjam) updateData.tanggalPinjam = new Date(updateData.tanggalPinjam)
    if (updateData.tanggalKembali) updateData.tanggalKembali = new Date(updateData.tanggalKembali)

    const gadai = await prisma.gadai.update({
      where: { gadaiID: parseInt(id) },
      data: updateData,
      include: { customer: true }
    })

    return NextResponse.json({ success: true, message: 'Gadai updated successfully', data: gadai })
  } catch (error) {
    console.error('Error updating gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to update gadai' }, { status: 500 })
  }
}

// DELETE /api/gadai/[id] - Delete gadai
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.gadai.findUnique({
      where: { gadaiID: parseInt(id) }
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    await prisma.gadai.delete({
      where: { gadaiID: parseInt(id) }
    })

    return NextResponse.json({ success: true, message: 'Gadai deleted successfully' })
  } catch (error) {
    console.error('Error deleting gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to delete gadai' }, { status: 500 })
  }
}
