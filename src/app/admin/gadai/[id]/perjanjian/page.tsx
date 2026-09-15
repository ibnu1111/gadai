'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { handleUnauthorized } from '@/lib/adminSession'
import { formatRupiah, getKategoriLabel, isKendaraan } from '@/lib/helpers'
import { BUSINESS, ADDRESS_LINES } from '@/lib/business'

interface GadaiPerjanjian {
  gadaiID: number
  customer: { nama: string; noHp: string }
  kategoriBarang: string
  namaBarang: string
  deskripsi: string | null
  nominalPinjam: string
  bungaPersentase: string
  fee: string
  tanggalPinjam: string
  tanggalKembali: string
  nomorPolisi: string | null
}

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII']
const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function formatTanggalPanjang(date: Date) {
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

function addDays(date: Date, days: number) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export default function SuratPerjanjianPage() {
  const params = useParams()
  const id = params.id as string
  const [gadai, setGadai] = useState<GadaiPerjanjian | null>(null)
  const [adminNama, setAdminNama] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem('adminToken')
        const headers = { Authorization: `Bearer ${token}` }
        const [gadaiRes, profileRes] = await Promise.all([
          fetch(`/api/gadai/${id}`, { headers }),
          fetch('/api/auth/profile', { headers })
        ])
        if (handleUnauthorized(gadaiRes.status, `/admin/gadai/${id}/perjanjian`)) return
        const gadaiData = await gadaiRes.json()
        if (!gadaiData.success) {
          setError(gadaiData.message || 'Data pengajuan tidak ditemukan')
          return
        }
        setGadai(gadaiData.data)

        const profileData = await profileRes.json()
        if (profileData.success) setAdminNama(profileData.data.nama)
      } catch {
        setError('Gagal memuat data surat perjanjian')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div className="p-8 text-center text-stone-400">Memuat surat perjanjian...</div>
  if (error || !gadai) return <div className="p-8 text-center text-red-500">{error || 'Data tidak ditemukan'}</div>

  const kendaraan = isKendaraan(gadai.kategoriBarang)
  const nominalPinjam = Number(gadai.nominalPinjam)
  const fee = Number(gadai.fee)
  const totalKewajiban = nominalPinjam + fee
  const tanggalPinjam = new Date(gadai.tanggalPinjam)
  const tanggalTempo = new Date(gadai.tanggalKembali)
  const tanggalLelang = addDays(tanggalTempo, 3)
  const hariIni = new Date()
  const nomorSurat = `${gadai.gadaiID}/SPG/GDJ/${ROMAN_MONTHS[hariIni.getMonth()]}/${hariIni.getFullYear()}`

  return (
    <div className="min-h-screen bg-stone-100 py-8 print:bg-white print:py-0">
      <div className="max-w-3xl mx-auto mb-4 px-4 print:hidden">
        <button
          onClick={() => window.print()}
          className="px-4 py-2.5 bg-stone-800 hover:bg-stone-900 text-white rounded-lg text-sm font-medium transition"
        >
          🖨 Cetak / Simpan sebagai PDF
        </button>
      </div>

      <div className="max-w-3xl mx-auto bg-white shadow-lg print:shadow-none px-10 py-12 text-sm leading-relaxed text-stone-800">
        <div className="text-center mb-8">
          <h1 className="text-lg font-bold uppercase tracking-wide">Surat Perjanjian Gadai</h1>
          <p className="text-stone-500">Nomor: {nomorSurat}</p>
        </div>

        <p className="mb-4 text-justify">
          Pada hari ini, {HARI[hariIni.getDay()]}, tanggal {formatTanggalPanjang(hariIni)}, bertempat di{' '}
          {BUSINESS.addressLocality}, yang bertanda tangan di bawah ini:
        </p>

        <div className="mb-4">
          <p className="font-semibold">I. PIHAK PERTAMA</p>
          <div className="ml-4">
            <div className="flex gap-3"><span className="w-36 shrink-0">Nama</span><span>: {adminNama || '_________________________'}</span></div>
            <div className="flex gap-3"><span className="w-36 shrink-0">Jabatan</span><span>: Pengelola / Perwakilan sah {BUSINESS.name}</span></div>
            <div className="flex gap-3"><span className="w-36 shrink-0">Alamat</span><span>: {ADDRESS_LINES.join(', ')}</span></div>
          </div>
          <p className="ml-4 mt-1 text-justify">
            Bertindak untuk dan atas nama {BUSINESS.name}, selanjutnya disebut sebagai <strong>PIHAK PERTAMA</strong>.
          </p>
        </div>

        <div className="mb-4">
          <p className="font-semibold">II. PIHAK KEDUA</p>
          <div className="ml-4">
            <div className="flex gap-3"><span className="w-36 shrink-0">Nama</span><span>: {gadai.customer.nama}</span></div>
            <div className="flex gap-3"><span className="w-36 shrink-0">No. HP / WhatsApp</span><span>: {gadai.customer.noHp}</span></div>
            <div className="flex gap-3"><span className="w-36 shrink-0">Alamat</span><span>: sebagaimana tercantum dalam KTP terlampir</span></div>
          </div>
          <p className="ml-4 mt-1 text-justify">
            Bertindak untuk dan atas nama diri sendiri, selanjutnya disebut sebagai <strong>PIHAK KEDUA</strong>.
          </p>
        </div>

        <p className="mb-4 text-justify">
          PIHAK PERTAMA dan PIHAK KEDUA selanjutnya secara bersama-sama disebut <strong>PARA PIHAK</strong>, dengan ini
          menerangkan terlebih dahulu bahwa PIHAK KEDUA telah mengajukan pinjaman dana dengan jaminan barang bergerak
          kepada PIHAK PERTAMA, dan PARA PIHAK telah sepakat untuk mengikatkan diri dalam Perjanjian Gadai
          (&quot;Perjanjian&quot;) dengan ketentuan-ketentuan sebagai berikut:
        </p>

        <p className="font-semibold mt-6 mb-1">PASAL 1 &mdash; OBJEK GADAI</p>
        <ol className="list-decimal ml-6 space-y-1 text-justify">
          <li>
            PIHAK KEDUA dengan ini menyerahkan barang jaminan berupa {getKategoriLabel(gadai.kategoriBarang)} dengan
            uraian: <strong>{gadai.namaBarang}</strong>{gadai.deskripsi ? ` (${gadai.deskripsi})` : ''} kepada PIHAK
            PERTAMA sebagai jaminan atas pinjaman sebagaimana diatur dalam Pasal 2 Perjanjian ini.
          </li>
          {kendaraan && (
            <li>
              Barang jaminan tersebut merupakan kendaraan bermotor dengan Nomor Polisi{' '}
              <strong>{gadai.nomorPolisi || '_______________'}</strong>, beserta Surat Tanda Nomor Kendaraan (STNK)
              asli yang diserahkan dan disimpan oleh PIHAK PERTAMA selama masa berlakunya Perjanjian ini.
            </li>
          )}
          <li>
            PIHAK KEDUA menjamin bahwa barang jaminan tersebut adalah benar milik sah PIHAK KEDUA, bebas dari
            sengketa, tidak sedang dijadikan jaminan/agunan pada pihak lain, dan tidak berasal dari hasil tindak
            pidana. Apabila di kemudian hari pernyataan ini terbukti tidak benar, maka segala akibat hukum yang
            timbul menjadi tanggung jawab penuh PIHAK KEDUA.
          </li>
        </ol>

        <p className="font-semibold mt-6 mb-1">PASAL 2 &mdash; NOMINAL PINJAMAN DAN BIAYA JASA</p>
        <ol className="list-decimal ml-6 space-y-1 text-justify">
          <li>PIHAK PERTAMA memberikan pinjaman dana kepada PIHAK KEDUA sebesar {formatRupiah(nominalPinjam)}.</li>
          <li>
            Atas pinjaman tersebut, PIHAK KEDUA dikenakan biaya jasa/bunga sebesar {gadai.bungaPersentase}% yaitu
            senilai {formatRupiah(fee)}.
          </li>
          <li>
            Dengan demikian, total kewajiban pembayaran PIHAK KEDUA kepada PIHAK PERTAMA pada Tanggal Jatuh Tempo
            adalah sebesar <strong>{formatRupiah(totalKewajiban)}</strong>.
          </li>
        </ol>

        <p className="font-semibold mt-6 mb-1">PASAL 3 &mdash; JANGKA WAKTU</p>
        <ol className="list-decimal ml-6 space-y-1 text-justify">
          <li>
            Perjanjian ini berlaku sejak tanggal {formatTanggalPanjang(tanggalPinjam)} sampai dengan tanggal{' '}
            <strong>{formatTanggalPanjang(tanggalTempo)}</strong> (&quot;Tanggal Jatuh Tempo&quot;).
          </li>
          <li>
            PIHAK KEDUA wajib melunasi seluruh kewajiban pembayaran sebagaimana dimaksud Pasal 2 selambat-lambatnya
            pada Tanggal Jatuh Tempo.
          </li>
          <li>
            PIHAK KEDUA dapat memperpanjang jangka waktu Perjanjian dengan membayar biaya jasa yang berlaku,
            sebelum atau pada Tanggal Jatuh Tempo, atas persetujuan PIHAK PERTAMA.
          </li>
        </ol>

        <p className="font-semibold mt-6 mb-1">PASAL 4 &mdash; HAK DAN KEWAJIBAN PARA PIHAK</p>
        <ol className="list-decimal ml-6 space-y-1 text-justify">
          <li>PIHAK PERTAMA berhak menahan dan menguasai barang jaminan sampai PIHAK KEDUA melunasi seluruh kewajibannya.</li>
          <li>PIHAK PERTAMA wajib menjaga dan merawat barang jaminan dengan itikad baik selama berada dalam penguasaannya.</li>
          <li>PIHAK KEDUA berhak menerima kembali barang jaminan setelah melunasi seluruh kewajiban pembayaran secara penuh.</li>
        </ol>

        <p className="font-semibold mt-6 mb-1">PASAL 5 &mdash; WANPRESTASI DAN PELELANGAN BARANG JAMINAN</p>
        <ol className="list-decimal ml-6 space-y-1 text-justify">
          <li>
            Apabila hingga Tanggal Jatuh Tempo ({formatTanggalPanjang(tanggalTempo)}) PIHAK KEDUA tidak melakukan
            pelunasan maupun perpanjangan, maka PIHAK KEDUA dinyatakan wanprestasi (cidera janji) tanpa perlu
            adanya somasi atau peringatan tertulis lebih lanjut.
          </li>
          <li>
            Apabila dalam waktu 3 (tiga) hari kalender setelah Tanggal Jatuh Tempo, yaitu terhitung sampai dengan
            tanggal <strong>{formatTanggalPanjang(tanggalLelang)}</strong> (&quot;H+3&quot;), PIHAK KEDUA tetap tidak
            melakukan pembayaran maupun perpanjangan, maka PIHAK PERTAMA berhak sepenuhnya untuk menjual dan/atau
            melelang barang jaminan kepada pihak mana pun tanpa memerlukan persetujuan maupun pemberitahuan tertulis
            lebih lanjut kepada PIHAK KEDUA.
          </li>
          <li>
            Hasil penjualan/pelelangan barang jaminan akan diperhitungkan terlebih dahulu untuk melunasi seluruh
            kewajiban PIHAK KEDUA kepada PIHAK PERTAMA (pokok pinjaman, biaya jasa, dan biaya-biaya lain yang timbul
            sehubungan dengan pelelangan). Apabila terdapat kelebihan hasil lelang, kelebihan tersebut menjadi hak
            PIHAK KEDUA.
          </li>
          <li>
            Apabila hasil penjualan/pelelangan tidak mencukupi untuk melunasi seluruh kewajiban PIHAK KEDUA, maka
            PIHAK KEDUA tetap bertanggung jawab untuk melunasi kekurangannya kepada PIHAK PERTAMA.
          </li>
          <li>
            Dengan menandatangani Perjanjian ini, PIHAK KEDUA menyatakan telah membaca, memahami, dan menyetujui
            sepenuhnya ketentuan pelelangan sebagaimana diatur dalam pasal ini, serta tidak akan mengajukan
            keberatan, gugatan, maupun tuntutan dalam bentuk apa pun terkait pelaksanaan pelelangan yang dilakukan
            sesuai dengan ketentuan Perjanjian ini.
          </li>
        </ol>

        <p className="font-semibold mt-6 mb-1">PASAL 6 &mdash; PENYELESAIAN PERSELISIHAN</p>
        <ol className="list-decimal ml-6 space-y-1 text-justify">
          <li>Segala perselisihan yang timbul dari pelaksanaan Perjanjian ini akan diselesaikan terlebih dahulu secara musyawarah untuk mufakat oleh PARA PIHAK.</li>
          <li>Apabila musyawarah tidak mencapai kesepakatan, PARA PIHAK sepakat menyelesaikannya melalui jalur hukum yang berlaku di wilayah Republik Indonesia.</li>
        </ol>

        <p className="font-semibold mt-6 mb-1">PASAL 7 &mdash; PENUTUP</p>
        <ol className="list-decimal ml-6 space-y-1 text-justify">
          <li>Perjanjian ini dibuat dalam keadaan sadar dan sehat jasmani maupun rohani, tanpa paksaan dari pihak mana pun, serta berlaku sah dan mengikat PARA PIHAK sejak ditandatangani.</li>
          <li>Perjanjian ini dibuat rangkap 2 (dua) yang masing-masing memiliki kekuatan hukum yang sama, satu untuk PIHAK PERTAMA dan satu untuk PIHAK KEDUA.</li>
        </ol>

        <p className="mt-6 text-justify">
          Demikian Surat Perjanjian Gadai ini dibuat untuk dipergunakan sebagaimana mestinya.
        </p>

        <div className="grid grid-cols-2 gap-8 mt-16">
          <div className="text-center">
            <p>PIHAK PERTAMA,</p>
            <div className="h-24" />
            <p className="font-semibold underline">{adminNama || '_________________________'}</p>
            <p>{BUSINESS.name}</p>
          </div>
          <div className="text-center">
            <p>PIHAK KEDUA,</p>
            <div className="h-24" />
            <p className="font-semibold underline">{gadai.customer.nama}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
