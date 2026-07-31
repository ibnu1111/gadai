import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { addTenor } from '@/lib/helpers'

type PendanaanRow = { sumberDanaId: number; nominal: Prisma.Decimal }

/** Rincian kas asal pencairan wajib terpecah rapi dan totalnya pas dengan pokok. */
function parsePendanaan(raw: unknown, pokok: Prisma.Decimal): { rows: PendanaanRow[] } | { error: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: 'Sumber dana wajib diisi' }
  }

  const rows: PendanaanRow[] = []
  const seen = new Set<number>()

  for (const item of raw) {
    const sumberDanaId = Number(item?.sumberDanaId)
    if (!Number.isInteger(sumberDanaId) || sumberDanaId <= 0) {
      return { error: 'Sumber dana tidak valid' }
    }
    if (seen.has(sumberDanaId)) {
      return { error: 'Sumber dana yang sama tidak boleh dipilih dua kali' }
    }
    seen.add(sumberDanaId)

    let nominal: Prisma.Decimal
    try {
      nominal = new Prisma.Decimal(item?.nominal ?? 0)
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
    return { error: `Total sumber dana ${total.toFixed(0)} harus sama dengan nominal cair ${pokok.toFixed(0)}` }
  }

  return { rows }
}

// PUT /api/gadai/[id]/confirm-transfer - Confirm the fund disbursement (transfer
// from the shop to the customer). Either confirms proof already uploaded by
// finance via the token link (MENUNGGU_VERIFIKASI_TRANSFER), or lets admin
// upload the proof manually in the same step (MENUNGGU_TRANSFER). Sekaligus
// mencatat pinjaman ini ke buku besar beserta kas asal pencairannya.
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
    const { buktiTransferCair, nominalTransferCair, sumberDana, nominalKembali } = body

    const existing = await prisma.gadai.findUnique({
      where: { gadaiID },
      include: { pinjaman: { select: { id: true } } }
    })
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

    let pokok: Prisma.Decimal
    try {
      pokok = new Prisma.Decimal(nominal)
    } catch {
      return NextResponse.json({ success: false, message: 'Nominal transfer tidak valid' }, { status: 400 })
    }
    if (pokok.lessThanOrEqualTo(0)) {
      return NextResponse.json({ success: false, message: 'Nominal transfer harus lebih dari nol' }, { status: 400 })
    }

    const pendanaan = parsePendanaan(sumberDana, pokok)
    if ('error' in pendanaan) {
      return NextResponse.json({ success: false, message: pendanaan.error }, { status: 400 })
    }

    const sumberDanaIds = pendanaan.rows.map((row) => row.sumberDanaId)
    const sumberDanaAktif = await prisma.sumberDana.count({
      where: { id: { in: sumberDanaIds }, aktif: true }
    })
    if (sumberDanaAktif !== sumberDanaIds.length) {
      return NextResponse.json({ success: false, message: 'Sumber dana tidak ditemukan' }, { status: 400 })
    }

    let kembali: Prisma.Decimal
    try {
      kembali = new Prisma.Decimal(
        nominalKembali ?? pokok.plus(pokok.times(existing.bungaPersentase).dividedBy(100))
      )
    } catch {
      return NextResponse.json({ success: false, message: 'Nominal kembali tidak valid' }, { status: 400 })
    }
    if (kembali.lessThan(pokok)) {
      return NextResponse.json({
        success: false,
        message: 'Nominal kembali tidak boleh lebih kecil dari pokok'
      }, { status: 400 })
    }

    const tanggalCair = new Date()
    const tanggalKembali = addTenor(tanggalCair, Number.parseFloat(existing.bungaPersentase.toString()))

    const gadai = await prisma.$transaction(async (tx) => {
      const updated = await tx.gadai.update({
        where: { gadaiID },
        data: {
          status: 'AKTIF',
          buktiTransferCair: bukti,
          nominalTransferCair: pokok,
          tanggalCair,
          tanggalPinjam: tanggalCair,
          tanggalKembali
        },
        include: { customer: true }
      })

      if (!existing.pinjaman) {
        await tx.pinjaman.create({
          data: {
            customerID: updated.customerID,
            jenis: 'GADAI',
            namaBarang: updated.namaBarang,
            pokok,
            tanggalCair,
            gadaiID,
            dibuatOleh: admin.email,
            siklus: {
              create: {
                siklusKe: 1,
                tanggalMulai: tanggalCair,
                tanggalJatuhTempo: tanggalKembali,
                nominalBunga: kembali.minus(pokok),
                dibuatOleh: admin.email
              }
            },
            pendanaan: { create: pendanaan.rows }
          }
        })
      }

      return updated
    })

    return NextResponse.json({
      success: true,
      message: 'Transfer dikonfirmasi, gadai aktif dan tercatat di buku besar',
      data: gadai
    })
  } catch (error) {
    console.error('Error confirming transfer:', error)
    return NextResponse.json({ success: false, message: 'Failed to confirm transfer' }, { status: 500 })
  }
}
