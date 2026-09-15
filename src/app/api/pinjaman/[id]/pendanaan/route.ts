import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'

type PendanaanRow = { sumberDanaId: number; nominal: Prisma.Decimal }

/** Rincian kas asal pencairan wajib terpecah rapi dan totalnya pas dengan pokok. */
function parsePendanaan(raw: unknown, pokok: Prisma.Decimal): { rows: PendanaanRow[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: 'Sumber dana wajib diisi' }
  }

  const rows: PendanaanRow[] = []
  const seen = new Set<number>()

  for (const item of raw) {
    const sumberDanaId = Number((item as Record<string, unknown>)?.sumberDanaId)
    if (!Number.isInteger(sumberDanaId) || sumberDanaId <= 0) {
      return { error: 'Sumber dana tidak valid' }
    }
    if (seen.has(sumberDanaId)) {
      return { error: 'Sumber dana yang sama tidak boleh dipilih dua kali' }
    }
    seen.add(sumberDanaId)

    let nominal: Prisma.Decimal
    try {
      nominal = new Prisma.Decimal((item as Record<string, unknown>)?.nominal as Prisma.Decimal.Value ?? 0)
    } catch {
      return { error: 'Nominal sumber dana tidak valid' }
    }
    if (nominal.lessThanOrEqualTo(0)) {
      return { error: 'Nominal setiap sumber dana harus lebih dari nol' }
    }

    rows.push({ sumberDanaId, nominal })
  }

  const total = rows.reduce((acc, row) => acc.plus(row.nominal), new Prisma.Decimal(0))
  if (!total.equals(pokok)) {
    return { error: `Total sumber dana ${total.toFixed(0)} harus sama dengan pokok pinjaman ${pokok.toFixed(0)}` }
  }

  return { rows }
}

// PUT /api/pinjaman/[id]/pendanaan - Ubah rincian kas asal pencairan pinjaman.
// Sumber dana bersifat dinamis (bisa dipindah antar kas kapan saja), jadi ini
// mengganti seluruh rincian pendanaan, bukan menambah/mengurangi sebagian.
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

    const pinjaman = await prisma.pinjaman.findUnique({ where: { id: pinjamanId } })
    if (!pinjaman) {
      return NextResponse.json({ success: false, message: 'Pinjaman tidak ditemukan' }, { status: 404 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = parsePendanaan(body.sumberDana, pinjaman.pokok)
    if ('error' in parsed) {
      return NextResponse.json({ success: false, message: parsed.error }, { status: 400 })
    }

    const sumberDanaIds = parsed.rows.map((row) => row.sumberDanaId)
    const sumberDanaAktif = await prisma.sumberDana.count({
      where: { id: { in: sumberDanaIds }, aktif: true }
    })
    if (sumberDanaAktif !== sumberDanaIds.length) {
      return NextResponse.json({ success: false, message: 'Sumber dana tidak ditemukan' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await tx.pinjamanDana.deleteMany({ where: { pinjamanId } })
      await tx.pinjamanDana.createMany({
        data: parsed.rows.map((row) => ({ pinjamanId, sumberDanaId: row.sumberDanaId, nominal: row.nominal }))
      })
    })

    const data = await prisma.pinjamanDana.findMany({
      where: { pinjamanId },
      include: { sumberDana: { select: { id: true, nama: true } } }
    })

    return NextResponse.json({ success: true, message: 'Sumber dana berhasil diperbarui', data })
  } catch (error) {
    console.error('Error updating pendanaan:', error)
    return NextResponse.json({ success: false, message: 'Failed to update pendanaan' }, { status: 500 })
  }
}
