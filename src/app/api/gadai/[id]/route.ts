import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { VALID_KATEGORI } from '@/lib/kategoriBarang'
import { PatchGadai, terapkanPatchGadai } from '@/lib/ubahDataGadai'

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
        extensions: true,
        pinjaman: { select: { id: true, status: true } }
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
//
// Body TIDAK boleh di-spread mentah ke Prisma: whitelist field di
// src/lib/ubahDataGadai.ts yang menentukan apa saja yang boleh berubah, supaya
// admin tidak bisa menyetel status/customerID/totalPembayaran lewat body.
// Bila gadai ini sudah punya Pinjaman di buku besar, perubahan financial-nya
// ikut disinkronkan ke Pinjaman/Siklus/PinjamanDana.
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
    const gadaiID = parseInt(id)
    if (!Number.isInteger(gadaiID)) {
      return NextResponse.json({ success: false, message: 'ID gadai tidak valid' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID }
    })

    if (!existing) {
      return NextResponse.json({ success: false, message: 'Gadai not found' }, { status: 404 })
    }

    // --- Bangun patch hanya dari field yang diizinkan -----------------------
    const patch: PatchGadai = {}

    if (body.kategoriBarang !== undefined) {
      if (!VALID_KATEGORI.includes(body.kategoriBarang)) {
        return NextResponse.json({
          success: false,
          message: `Kategori barang harus salah satu dari: ${VALID_KATEGORI.join(', ')}`
        }, { status: 400 })
      }
      patch.kategoriBarang = body.kategoriBarang
    }

    if (body.namaBarang !== undefined) {
      const nama = String(body.namaBarang || '').trim()
      if (!nama) {
        return NextResponse.json({ success: false, message: 'Nama barang wajib diisi' }, { status: 400 })
      }
      patch.namaBarang = nama
    }

    if (body.nominalPinjam !== undefined) {
      const nominal = Number(body.nominalPinjam)
      if (!Number.isFinite(nominal) || nominal <= 0) {
        return NextResponse.json({ success: false, message: 'Nominal pinjaman harus lebih dari nol' }, { status: 400 })
      }
      patch.nominalPinjam = nominal
    }

    if (body.bungaPersentase !== undefined) {
      const bunga = Number(body.bungaPersentase)
      if (!Number.isFinite(bunga) || bunga < 0) {
        return NextResponse.json({ success: false, message: 'Bunga persen tidak valid' }, { status: 400 })
      }
      patch.bungaPersentase = bunga
    }

    if (body.tanggalPinjam !== undefined) {
      const tanggal = new Date(body.tanggalPinjam)
      if (Number.isNaN(tanggal.getTime())) {
        return NextResponse.json({ success: false, message: 'Tanggal pinjam tidak valid' }, { status: 400 })
      }
      patch.tanggalPinjam = tanggal
    }

    if (body.tanggalKembali !== undefined) {
      const tanggal = new Date(body.tanggalKembali)
      if (Number.isNaN(tanggal.getTime())) {
        return NextResponse.json({ success: false, message: 'Tanggal kembali tidak valid' }, { status: 400 })
      }
      patch.tanggalKembali = tanggal
    }

    if (body.atributTinggal !== undefined) {
      patch.atributTinggal = String(body.atributTinggal || '').trim()
    }

    if (body.deskripsi !== undefined) {
      patch.deskripsi = String(body.deskripsi || '').trim() || null
    }

    if (body.nomorPolisi !== undefined) {
      patch.nomorPolisi = String(body.nomorPolisi || '').trim() || null
    }

    // --- Validasi relasi tanggal -------------------------------------------
    const tanggalPinjam = patch.tanggalPinjam ?? existing.tanggalPinjam
    const tanggalKembali = patch.tanggalKembali ?? existing.tanggalKembali
    if (tanggalKembali.getTime() < tanggalPinjam.getTime()) {
      return NextResponse.json({
        success: false,
        message: 'Tanggal kembali tidak boleh lebih awal dari tanggal pinjam'
      }, { status: 400 })
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ success: false, message: 'Tidak ada data yang diubah' }, { status: 400 })
    }

    const hasil = await prisma.$transaction(async (tx) => terapkanPatchGadai(tx, gadaiID, patch))

    if ('error' in hasil) {
      return NextResponse.json({ success: false, message: hasil.error }, { status: hasil.status })
    }

    return NextResponse.json({
      success: true,
      message: hasil.tersinkron
        ? 'Gadai berhasil diperbarui dan buku besar ikut disesuaikan'
        : 'Gadai berhasil diperbarui',
      data: hasil.gadai
    })
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
