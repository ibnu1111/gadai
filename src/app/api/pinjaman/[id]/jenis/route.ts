import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { migrasiJenisPinjaman, JenisPinjaman } from '@/lib/migrasiJenisPinjaman'

const JENIS_VALID = new Set<string>(['GADAI', 'DAPIN'])

// PUT /api/pinjaman/[id]/jenis - Geser klasifikasi pinjaman antara gadai dan
// pinjaman biasa (dapin), dengan memindahkan datanya mengikuti pergeseran itu.
//
// DAPIN -> GADAI: record Gadai dibuat dari data pinjaman lalu ditautkan.
// GADAI -> DAPIN: data Gadai disalin ke pinjaman, record Gadai dihapus.
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
    const pinjamanId = Number.parseInt(id)
    if (!Number.isInteger(pinjamanId)) {
      return NextResponse.json({ success: false, message: 'ID pinjaman tidak valid' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))
    const jenis = String(body.jenis ?? '').toUpperCase()
    if (!JENIS_VALID.has(jenis)) {
      return NextResponse.json({
        success: false,
        message: `jenis harus salah satu dari: ${[...JENIS_VALID].join(', ')}`
      }, { status: 400 })
    }

    const hasil = await prisma.$transaction(async (tx) =>
      migrasiJenisPinjaman(tx, pinjamanId, jenis as JenisPinjaman)
    )

    if ('error' in hasil) {
      return NextResponse.json({ success: false, message: hasil.error }, { status: hasil.status })
    }

    return NextResponse.json({
      success: true,
      message: hasil.pesan,
      data: { jenis: hasil.jenis, gadaiID: hasil.gadaiID }
    })
  } catch (error) {
    console.error('Error switching jenis pinjaman:', error)
    return NextResponse.json({ success: false, message: 'Gagal memindahkan jenis pinjaman' }, { status: 500 })
  }
}
