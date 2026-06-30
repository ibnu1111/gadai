import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  normalizePhoneNumber,
  mapKategoriBarang,
  calculateTanggalKembali,
  getStatusLabel,
  getStatusColor
} from '@/lib/helpers'

const VALID_KATEGORI = ['Mobil', 'Motor', 'Elektronik', 'HP', 'Laptop', 'Perhiasan', 'Lainnya']
const VALID_BUNGA: Record<string, number> = {
  '2minggu': 10,
  '1bulan': 20
}

// POST /api/public/gadai - Create public gadai submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      customerName, phone, fotoKtp, kategoriBarang, namaBarang,
      deskripsi, atributTinggal, fotoBarang, fotoPendukung, jangkaWaktu, nominalPinjam
    } = body

    if (!customerName || !phone || !kategoriBarang || !namaBarang ||
        !fotoBarang || !jangkaWaktu || !nominalPinjam) {
      return NextResponse.json({
        success: false,
        message: 'Required fields are missing'
      }, { status: 400 })
    }

    if (parseFloat(nominalPinjam) < 100000) {
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
    const dbKategori = mapKategoriBarang(kategoriBarang)

    if (!VALID_KATEGORI.includes(dbKategori)) {
      return NextResponse.json({
        success: false,
        message: 'Kategori barang tidak valid'
      }, { status: 400 })
    }

    const fee = (parseFloat(nominalPinjam) * bungaPersentase) / 100
    const tanggalPinjam = new Date()
    const tanggalKembali = calculateTanggalKembali(tanggalPinjam, jangkaWaktu)

    let customer = await prisma.customer.findUnique({
      where: { noHp: normalizedPhone! }
    })

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          nama: customerName,
          noHp: normalizedPhone!,
          fotoKtp: fotoKtp || null
        }
      })
    } else if (customer.nama !== customerName) {
      customer = await prisma.customer.update({
        where: { id: customer.id },
        data: { nama: customerName }
      })
    }

    const gadai = await prisma.gadai.create({
      data: {
        customerID: customer.id,
        kategoriBarang: dbKategori,
        namaBarang,
        nominalPinjam: parseFloat(nominalPinjam),
        bungaPersentase,
        fee,
        tanggalPinjam,
        tanggalKembali,
        atributTinggal: atributTinggal || '-',
        deskripsi: deskripsi || null,
        fotoBarang,
        fotoPendukung: fotoPendukung || null,
        status: 'PENDING'
      },
      include: { customer: true }
    })

    const waMessage = encodeURIComponent(
      `📋 *Pengajuan Gadai Baru*\n\n` +
      `👤 Nama: ${customerName}\n` +
      `📱 HP: ${phone}\n` +
      `📦 Barang: ${namaBarang}\n` +
      `💰 Nominal: Rp ${parseFloat(nominalPinjam).toLocaleString('id-ID')}\n` +
      `📊 Bunga: ${bungaPersentase}%\n` +
      `💵 Fee: Rp ${fee.toLocaleString('id-ID')}\n\n` +
      `Mohon untuk meninjau pengajuan di sistem.`
    )
    const waLink = `https://wa.me/?text=${waMessage}`

    return NextResponse.json({
      success: true,
      message: 'Pengajuan gadai berhasil dikirim. Mohon tunggu konfirmasi dari kami.',
      data: {
        gadaiId: gadai.gadaiID,
        customerId: customer.id,
        status: gadai.status,
        nominalPengajuan: parseFloat(nominalPinjam),
        bungaPersentase,
        fee,
        tanggalKembali: tanggalKembali.toISOString()
      },
      waNotificationLink: waLink
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating public gadai:', error)
    return NextResponse.json({ success: false, message: 'Failed to submit gadai' }, { status: 500 })
  }
}
