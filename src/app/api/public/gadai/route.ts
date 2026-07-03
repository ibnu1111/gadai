import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  normalizePhoneNumber,
  mapKategoriBarang,
  calculateTanggalKembali,
} from '@/lib/helpers'

const VALID_KATEGORI = new Set(['Mobil', 'Motor', 'Elektronik', 'HP', 'Laptop', 'Perhiasan', 'Lainnya'])
const VALID_BUNGA: Record<string, number> = {
  '2minggu': 10,
  '1bulan': 20
}

// POST /api/public/gadai - Create public gadai submission
export async function POST(request: NextRequest) {
  let customerName: string, phone: string, kategoriBarang: string, namaBarang: string
  let deskripsi: string | null, atributTinggal: string, fotoBarang: string, fotoPendukung: string | null
  let jangkaWaktu: string, nominalPinjam: string, fotoKtp: string | null

  try {
    const body = await request.json()
    ;({
      customerName, phone, kategoriBarang, namaBarang,
      deskripsi, atributTinggal, fotoBarang, fotoPendukung, jangkaWaktu, nominalPinjam
    } = body)

    fotoBarang = fotoBarang || '-'
    deskripsi = deskripsi || null
    atributTinggal = atributTinggal || '-'
    fotoKtp = body.fotoKtp || null

    if (!customerName || !phone || !kategoriBarang || !namaBarang ||
        !jangkaWaktu || !nominalPinjam) {
      return NextResponse.json({
        success: false,
        message: 'Required fields are missing'
      }, { status: 400 })
    }

    // Foto KTP is optional for now — will become mandatory once the full
    // pengajuan flow (with in-flow document verification step) is built.

    const nominalNum = Number.parseFloat(nominalPinjam)
    if (Number.isNaN(nominalNum) || nominalNum < 100000) {
      return NextResponse.json({
        success: false,
        message: 'Nominal minimum adalah Rp 100.000'
      }, { status: 400 })
    }

    const bungaPersentase = VALID_BUNGA[jangkaWaktu]
    if (!bungaPersentase) {
      return NextResponse.json({
        success: false,
        message: 'Jangka waktu tidak valid'
      }, { status: 400 })
    }

    const normalizedPhone = normalizePhoneNumber(phone)
    if (!normalizedPhone) {
      return NextResponse.json({
        success: false,
        message: 'Nomor HP tidak valid'
      }, { status: 400 })
    }

    const dbKategori = mapKategoriBarang(kategoriBarang)

    if (!VALID_KATEGORI.has(dbKategori)) {
      return NextResponse.json({
        success: false,
        message: 'Kategori barang tidak valid'
      }, { status: 400 })
    }

    if ((dbKategori === 'Motor' || dbKategori === 'Mobil') && !fotoPendukung) {
      return NextResponse.json({
        success: false,
        message: 'Foto STNK wajib diunggah untuk kategori Motor/Mobil'
      }, { status: 400 })
    }

    const feeNum = (nominalNum * bungaPersentase) / 100
    const tanggalPinjam = new Date()
    const tanggalKembali = calculateTanggalKembali(tanggalPinjam, jangkaWaktu)

    let customer = await prisma.customer.findUnique({
      where: { noHp: normalizedPhone }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          nama: customerName,
          noHp: normalizedPhone,
          fotoKtp: fotoKtp
        }
      })
    } else {
      const customerUpdate: { nama?: string; fotoKtp?: string } = {}
      if (customer.nama !== customerName) customerUpdate.nama = customerName
      if (fotoKtp && customer.fotoKtp !== fotoKtp) customerUpdate.fotoKtp = fotoKtp
      if (Object.keys(customerUpdate).length > 0) {
        customer = await prisma.customer.update({
          where: { id: customer.id },
          data: customerUpdate
        })
      }
    }

    const gadai = await prisma.gadai.create({
      data: {
        customerID: customer.id,
        kategoriBarang: dbKategori,
        namaBarang,
        nominalPinjam: new Prisma.Decimal(nominalNum.toFixed(2)),
        bungaPersentase: new Prisma.Decimal(bungaPersentase.toFixed(2)),
        fee: new Prisma.Decimal(feeNum.toFixed(2)),
        tanggalPinjam,
        tanggalKembali,
        atributTinggal,
        deskripsi,
        fotoBarang,
        fotoPendukung,
        status: 'PENDING'
      },
      include: { customer: true }
    })

    const waMessage = encodeURIComponent(
      `📋 *Pengajuan Gadai Baru*\n\n` +
      `👤 Nama: ${customerName}\n` +
      `📱 HP: ${phone}\n` +
      `📦 Barang: ${namaBarang}\n` +
      `💰 Nominal: Rp ${nominalNum.toLocaleString('id-ID')}\n` +
      `📊 Jasa: ${bungaPersentase}%\n` +
      `💵 Fee: Rp ${feeNum.toLocaleString('id-ID')}\n` +
      `🪪 Foto KTP: ${fotoKtp}\n` +
      (fotoPendukung ? `🛵 Foto STNK: ${fotoPendukung}\n` : '') +
      `\nMohon untuk meninjau pengajuan di sistem.`
    )
    const waLink = `https://wa.me/?text=${waMessage}`

    return NextResponse.json({
      success: true,
      message: 'Pengajuan gadai berhasil dikirim. Mohon tunggu konfirmasi dari kami.',
      data: {
        gadaiId: gadai.gadaiID,
        customerId: customer.id,
        status: gadai.status,
        nominalPengajuan: nominalNum,
        bungaPersentase,
        fee: feeNum,
        tanggalKembali: tanggalKembali.toISOString()
      },
      waNotificationLink: waLink
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating public gadai:', error)
    const message = error?.message || error?.code || 'Unknown error'
    return NextResponse.json({ success: false, message: `Failed to submit gadai: ${message}` }, { status: 500 })
  }
}

