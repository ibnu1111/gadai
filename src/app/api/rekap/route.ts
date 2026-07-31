import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest } from '@/lib/auth'
import { formatAngka, isoWib, tanggalRekap, bulanPanjang, bulanSingkat, nomorBaris } from '@/lib/rekap'

const TIPE_VALID = new Set(['harian', 'modal', 'closing'])

type BarisHarian = {
  nomorUrut: number | null
  tanggalMulai: Date
  tanggalJatuhTempo: Date
  nominalBunga: unknown
  pinjaman: {
    pokok: unknown
    namaBarang: string | null
    customer: { nama: string }
  }
}

/** "nadjwa BEAT" untuk gadai, "aisyah jogja" untuk dapin tanpa jaminan. */
function labelPinjaman(nama: string, namaBarang: string | null): string {
  const barang = namaBarang?.trim()
  return barang ? `${nama} ${barang.toUpperCase()}` : nama
}

async function rekapHarian(): Promise<string> {
  const data = await prisma.siklus.findMany({
    where: { status: 'BERJALAN', pinjaman: { status: 'AKTIF' } },
    orderBy: [{ tanggalMulai: 'asc' }, { nomorUrut: 'asc' }, { id: 'asc' }],
    select: {
      nomorUrut: true,
      tanggalMulai: true,
      tanggalJatuhTempo: true,
      nominalBunga: true,
      pinjaman: {
        select: {
          pokok: true,
          namaBarang: true,
          customer: { select: { nama: true } }
        }
      }
    }
  })

  if (data.length === 0) return ''

  const grup = new Map<string, BarisHarian[]>()
  for (const baris of data) {
    const kunci = isoWib(baris.tanggalMulai)
    const isi = grup.get(kunci)
    if (isi) isi.push(baris)
    else grup.set(kunci, [baris])
  }

  const blok: string[] = []
  for (const [, isi] of grup) {
    const nomor = nomorBaris(isi.map((b) => b.nomorUrut))
    const baris = isi.map((b, i) => {
      const pokok = Number(b.pinjaman.pokok)
      const kembali = pokok + Number(b.nominalBunga)
      const label = labelPinjaman(b.pinjaman.customer.nama, b.pinjaman.namaBarang)
      return `${nomor[i]}. ${label} : ${formatAngka(pokok)} back ${tanggalRekap(b.tanggalJatuhTempo)} ${formatAngka(kembali)}`
    })
    blok.push(`💵💵💵 DAPIN TGL ${tanggalRekap(isi[0].tanggalMulai)} : \n\n${baris.join('\n\n')}`)
  }

  return blok.join('\n\n')
}

async function rekapModal(): Promise<string> {
  const data = await prisma.pinjamanDana.findMany({
    where: { pinjaman: { status: 'AKTIF', jenis: 'GADAI' } },
    orderBy: [{ sumberDana: { urutan: 'asc' } }, { sumberDanaId: 'asc' }, { id: 'asc' }],
    select: {
      nominal: true,
      sumberDana: { select: { nama: true } },
      pinjaman: {
        select: {
          namaBarang: true,
          customer: { select: { nama: true } }
        }
      }
    }
  })

  if (data.length === 0) return ''

  const baris: string[] = []
  const totalSumber = new Map<string, number>()
  let total = 0

  for (const d of data) {
    const nominal = Number(d.nominal)
    const label = labelPinjaman(d.pinjaman.customer.nama, d.pinjaman.namaBarang).toUpperCase()
    baris.push(`- ${d.sumberDana.nama} : ${formatAngka(nominal)} : ${label}`)
    totalSumber.set(d.sumberDana.nama, (totalSumber.get(d.sumberDana.nama) ?? 0) + nominal)
    total += nominal
  }

  const ringkas = [...totalSumber].map(([nama, nilai]) => `${nama} : ${formatAngka(nilai)}`)

  return [
    '🌷MODAL :',
    '',
    baris.join('\n'),
    '',
    'modal ;',
    '',
    ringkas.join('\n'),
    '',
    `total : *${formatAngka(total)}*`
  ].join('\n')
}

async function rekapClosing(tahun: number, bulan: number): Promise<string> {
  const awal = new Date(Date.UTC(tahun, bulan - 1, 1))
  const akhir = new Date(Date.UTC(tahun, bulan, 1))

  const [terputar, perSumber, keuntungan, sumberDana] = await Promise.all([
    prisma.pinjaman.aggregate({ where: { status: 'AKTIF' }, _sum: { pokok: true } }),
    prisma.pinjamanDana.groupBy({
      by: ['sumberDanaId'],
      where: { pinjaman: { status: 'AKTIF' } },
      _sum: { nominal: true }
    }),
    prisma.siklus.aggregate({
      where: { tanggalJatuhTempo: { gte: awal, lt: akhir } },
      _sum: { nominalBunga: true }
    }),
    prisma.sumberDana.findMany({ orderBy: [{ urutan: 'asc' }, { nama: 'asc' }], select: { id: true, nama: true } })
  ])

  const totalTerputar = Number(terputar._sum.pokok ?? 0)
  const totalKeuntungan = Number(keuntungan._sum.nominalBunga ?? 0)
  const nominalSumber = new Map(perSumber.map((p) => [p.sumberDanaId, Number(p._sum.nominal ?? 0)]))

  const ringkas = sumberDana
    .filter((s) => nominalSumber.has(s.id))
    .map((s) => `${s.nama} : ${formatAngka(nominalSumber.get(s.id) ?? 0)}`)

  return [
    `MODAL+ KEUNTUNGAN TERPUTAR DI BULAN ${bulanPanjang(bulan)} : `,
    '',
    `*RP. ${formatAngka(totalTerputar)}`,
    '',
    'IDLE : 0',
    '',
    `total : *${formatAngka(totalTerputar)}*`,
    '',
    '',
    'modal ;',
    '',
    ringkas.join('\n'),
    '',
    '',
    `*KEUNTUNGAN ${bulanSingkat(bulan)} :*`,
    '',
    `Rp. ${formatAngka(totalKeuntungan)}`
  ].join('\n')
}

function baca(bulanParam: string | null): { tahun: number; bulan: number } | null {
  if (!bulanParam) {
    const sekarang = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
    const [t, b] = sekarang.split('-').map(Number)
    return { tahun: t, bulan: b }
  }
  const cocok = /^(\d{4})-(\d{2})$/.exec(bulanParam)
  if (!cocok) return null
  const tahun = Number(cocok[1])
  const bulan = Number(cocok[2])
  if (bulan < 1 || bulan > 12) return null
  return { tahun, bulan }
}

// GET /api/rekap?tipe=harian|modal|closing&bulan=YYYY-MM
export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)
    if (!admin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const tipe = request.nextUrl.searchParams.get('tipe') ?? 'harian'
    if (!TIPE_VALID.has(tipe)) {
      return NextResponse.json({ success: false, message: 'Tipe rekap tidak dikenal' }, { status: 400 })
    }

    const periode = baca(request.nextUrl.searchParams.get('bulan'))
    if (!periode) {
      return NextResponse.json({ success: false, message: 'Format bulan harus YYYY-MM' }, { status: 400 })
    }

    let teks: string
    if (tipe === 'harian') teks = await rekapHarian()
    else if (tipe === 'modal') teks = await rekapModal()
    else teks = await rekapClosing(periode.tahun, periode.bulan)

    return NextResponse.json({ success: true, data: { tipe, teks } })
  } catch (error) {
    console.error('Gagal menyusun rekap:', error)
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
