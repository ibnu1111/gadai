'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { handleUnauthorized } from '@/lib/adminSession'
import ConfirmDialog from '@/components/admin/ConfirmDialog'
import PhotoLightbox from '@/components/admin/PhotoLightbox'

interface Payment {
  id: number
  jumlahBayar: string
  tipeBayar: string
  catatan: string | null
  createdAt: string
  createdBy: string | null
}

interface SumberDanaOption {
  id: number
  nama: string
}

interface PendanaanRow {
  key: number
  sumberDanaId: string
  nominal: string
}

let pendanaanKeySeq = 0
const newPendanaanRow = (): PendanaanRow => ({ key: ++pendanaanKeySeq, sumberDanaId: '', nominal: '' })

interface GadaiDetail {
  gadaiID: number
  customerID: number
  customer: { id: number; nama: string; noHp: string; fotoKtp: string | null }
  kategoriBarang: string
  namaBarang: string
  nominalPinjam: string
  bungaPersentase: string
  fee: string
  tanggalPinjam: string
  tanggalKembali: string
  atributTinggal: string
  deskripsi: string | null
  fotoBarang: string | null
  fotoPendukung: string | null
  status: string
  totalPembayaran: string
  perpanjanganKe: number
  parentGadaiID: number | null
  createdAt: string
  createdBy: string | null
  payments: Payment[]
  fotoCustomerBarang: string | null
  fotoPendukungTambahan: string[]
  noRekening: string | null
  namaBank: string | null
  nomorPolisi: string | null
  rekeningToken: string | null
  transferToken: string | null
  buktiTransferCair: string | null
  nominalTransferCair: string | null
  tanggalCair: string | null
  bungaTerbayar: string
  pendingAksi: string | null
  pendingAksiNominal: string | null
  pendingAksiBukti: string | null
  pendingAksiCreatedAt: string | null
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Menunggu',
  MENUNGGU_REKENING: 'Menunggu Rekening',
  MENUNGGU_TRANSFER: 'Menunggu Transfer',
  MENUNGGU_VERIFIKASI_TRANSFER: 'Verifikasi Transfer',
  AKTIF: 'Aktif',
  LUNAS: 'Lunas',
  JATUH_TEMPO: 'Jatuh Tempo',
  OVERDUE: 'Terlambat',
  DITOLAK: 'Ditolak',
  DIPERPANJANG: 'Diperpanjang'
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  MENUNGGU_REKENING: { bg: 'bg-amber-100', text: 'text-amber-800' },
  MENUNGGU_TRANSFER: { bg: 'bg-amber-100', text: 'text-amber-800' },
  MENUNGGU_VERIFIKASI_TRANSFER: { bg: 'bg-amber-100', text: 'text-amber-800' },
  AKTIF: { bg: 'bg-green-100', text: 'text-green-800' },
  LUNAS: { bg: 'bg-blue-100', text: 'text-blue-800' },
  JATUH_TEMPO: { bg: 'bg-orange-100', text: 'text-orange-800' },
  OVERDUE: { bg: 'bg-red-100', text: 'text-red-800' },
  DITOLAK: { bg: 'bg-stone-100', text: 'text-stone-600' },
  DIPERPANJANG: { bg: 'bg-purple-100', text: 'text-purple-800' }
}

const FINANCE_WA_NUMBER = '62819676216'

function isKendaraan(kategori: string) {
  return kategori === 'Motor' || kategori === 'Mobil'
}

function isDueOrOverdue(status: string, tanggalKembali: string) {
  if (!['AKTIF', 'JATUH_TEMPO', 'OVERDUE'].includes(status)) return false
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const due = new Date(tanggalKembali)
  due.setHours(0, 0, 0, 0)
  return today >= due
}

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(num)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function KelStatusBadge({ complete }: { complete: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${complete ? 'bg-green-100 text-green-700' : 'bg-stone-200 text-stone-500'}`}>
      {complete ? (
        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      ) : null}
      {complete ? 'Lengkap' : 'Belum'}
    </span>
  )
}

function KelPhotoField({
  label,
  value,
  uploading,
  onChange,
  onPreview
}: {
  label: string
  value: string
  uploading: boolean
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onPreview: (url: string) => void
}) {
  const complete = Boolean(value)
  return (
    <div className={`rounded-lg border p-3 transition ${complete ? 'border-green-200 bg-green-50/40' : 'border-amber-200 bg-amber-50/40'}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-stone-600">{label}</span>
        <KelStatusBadge complete={complete} />
      </div>
      <div className="flex items-center gap-3">
        {complete && (
          <button type="button" onClick={() => onPreview(value)} className="shrink-0">
            <img src={value} alt={label} className="w-12 h-12 rounded-lg object-cover border border-stone-200 hover:opacity-80 transition" />
          </button>
        )}
        <label className="flex-1 cursor-pointer">
          <span className="inline-flex items-center justify-center w-full text-xs font-medium text-amber-700 bg-white border border-dashed border-amber-300 rounded-lg px-2 py-2 hover:bg-amber-50 transition">
            {uploading ? 'Mengunggah...' : complete ? 'Ganti foto' : 'Pilih foto'}
          </span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            onChange={onChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}

function KelTextField({
  id,
  label,
  value,
  onChange
}: {
  id: string
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) {
  const complete = Boolean(value.trim())
  return (
    <div className={`rounded-lg border p-3 transition ${complete ? 'border-green-200 bg-green-50/40' : 'border-amber-200 bg-amber-50/40'}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={id} className="text-xs font-medium text-stone-600">{label}</label>
        <KelStatusBadge complete={complete} />
      </div>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-400 outline-none transition"
      />
    </div>
  )
}

export default function AdminGadaiDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [gadai, setGadai] = useState<GadaiDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [statusValue, setStatusValue] = useState('')
  const [savingStatus, setSavingStatus] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNote, setPaymentNote] = useState('')
  const [savingPayment, setSavingPayment] = useState(false)
  const [actionMessage, setActionMessage] = useState('')
  const [showRejectConfirm, setShowRejectConfirm] = useState(false)
  const [rejectError, setRejectError] = useState('')

  // Kelengkapan data (foto customer+barang, foto pendukung tambahan, nopol)
  const [kelFotoKtp, setKelFotoKtp] = useState('')
  const [kelFotoStnk, setKelFotoStnk] = useState('')
  const [kelFotoCustomerBarang, setKelFotoCustomerBarang] = useState('')
  const [kelFotoPendukungTambahan, setKelFotoPendukungTambahan] = useState<string[]>([])
  const [kelNomorPolisi, setKelNomorPolisi] = useState('')
  const [kelUploading, setKelUploading] = useState<string>('')
  const [kelSaving, setKelSaving] = useState(false)
  const [kelMessage, setKelMessage] = useState('')

  // Preview foto (popup)
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null)

  // Fallback: admin isi rekening manual (jika customer tidak bisa akses link)
  const [rekManualNoRekening, setRekManualNoRekening] = useState('')
  const [rekManualNamaBank, setRekManualNamaBank] = useState('')
  const [rekManualSaving, setRekManualSaving] = useState(false)

  // Konfirmasi transfer pencairan
  const [transferNominal, setTransferNominal] = useState('')
  const [transferFile, setTransferFile] = useState<File | null>(null)
  const [transferConfirming, setTransferConfirming] = useState(false)

  // Pencatatan ke buku besar saat pencairan
  const [sumberDanaOptions, setSumberDanaOptions] = useState<SumberDanaOption[]>([])
  const [pendanaan, setPendanaan] = useState<PendanaanRow[]>([newPendanaanRow()])
  const [nominalKembali, setNominalKembali] = useState('')
  const [kembaliDiubah, setKembaliDiubah] = useState(false)

  // Aksi Ambil / Perpanjang
  const [aksiType, setAksiType] = useState<'AMBIL' | 'PERPANJANG'>('AMBIL')
  const [aksiNominal, setAksiNominal] = useState('')
  const [aksiSaving, setAksiSaving] = useState(false)

  useEffect(() => {
    if (!gadai) return
    setKelFotoKtp(gadai.customer.fotoKtp || '')
    setKelFotoStnk(gadai.fotoPendukung || '')
    setKelFotoCustomerBarang(gadai.fotoCustomerBarang || '')
    setKelFotoPendukungTambahan(gadai.fotoPendukungTambahan || [])
    setKelNomorPolisi(gadai.nomorPolisi || '')
  }, [gadai])

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) return
    fetch('/api/sumber-dana', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSumberDanaOptions(data.data)
      })
      .catch(() => setSumberDanaOptions([]))
  }, [])

  const uploadFile = async (file: File): Promise<string> => {
    const body = new FormData()
    body.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body })
    const data = await res.json()
    if (!res.ok || !data.success) throw new Error(data.message || 'Gagal mengunggah file')
    return data.url as string
  }

  const fetchGadai = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/gadai/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (handleUnauthorized(res.status, `/admin/gadai/${id}`)) return
      const data = await res.json()
      if (data.success) {
        setGadai(data.data)
        setStatusValue(data.data.status)
      } else {
        setError(data.message || 'Pengajuan tidak ditemukan')
      }
    } catch {
      setError('Gagal memuat data pengajuan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGadai()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleUpdateStatus = async () => {
    if (!gadai || statusValue === gadai.status) return
    setSavingStatus(true)
    setActionMessage('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/gadai/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: statusValue })
      })
      const data = await res.json()
      if (data.success) {
        setActionMessage('Status berhasil diperbarui')
        fetchGadai()
      } else {
        setActionMessage(data.message || 'Gagal memperbarui status')
      }
    } catch {
      setActionMessage('Gagal memperbarui status')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentAmount) return
    setSavingPayment(true)
    setActionMessage('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ gadaiID: id, jumlahBayar: paymentAmount, catatan: paymentNote || undefined })
      })
      const data = await res.json()
      if (data.success) {
        setActionMessage('Pembayaran berhasil dicatat')
        setPaymentAmount('')
        setPaymentNote('')
        fetchGadai()
      } else {
        setActionMessage(data.message || 'Gagal mencatat pembayaran')
      }
    } catch {
      setActionMessage('Gagal mencatat pembayaran')
    } finally {
      setSavingPayment(false)
    }
  }

  const handleKelFileChange = async (field: 'ktp' | 'stnk' | 'customerBarang', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setKelUploading(field)
    setKelMessage('')
    try {
      const url = await uploadFile(file)
      if (field === 'ktp') setKelFotoKtp(url)
      if (field === 'stnk') setKelFotoStnk(url)
      if (field === 'customerBarang') setKelFotoCustomerBarang(url)
    } catch (err: any) {
      setKelMessage(err.message || 'Gagal mengunggah foto')
    } finally {
      setKelUploading('')
    }
  }

  const handleAddPendukungTambahan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setKelUploading('pendukungTambahan')
    setKelMessage('')
    try {
      const url = await uploadFile(file)
      setKelFotoPendukungTambahan(prev => [...prev, url])
    } catch (err: any) {
      setKelMessage(err.message || 'Gagal mengunggah foto')
    } finally {
      setKelUploading('')
      e.target.value = ''
    }
  }

  const handleRemovePendukungTambahan = (index: number) => {
    setKelFotoPendukungTambahan(prev => prev.filter((_, i) => i !== index))
  }

  const handleSaveKelengkapan = async (submit: boolean) => {
    if (!gadai) return
    setKelSaving(true)
    setKelMessage('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/gadai/${id}/complete`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fotoKtp: kelFotoKtp || undefined,
          fotoStnk: kelFotoStnk || undefined,
          fotoCustomerBarang: kelFotoCustomerBarang || undefined,
          fotoPendukungTambahan: kelFotoPendukungTambahan,
          nomorPolisi: kelNomorPolisi || undefined,
          submit
        })
      })
      const data = await res.json()
      if (data.success) {
        setKelMessage(submit ? 'Data lengkap, menunggu customer mengisi rekening tujuan' : 'Kelengkapan data disimpan')
        fetchGadai()
      } else {
        setKelMessage(data.message || 'Gagal menyimpan data')
      }
    } catch {
      setKelMessage('Gagal menyimpan data')
    } finally {
      setKelSaving(false)
    }
  }

  const handleSaveRekeningManual = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rekManualNoRekening || !rekManualNamaBank) {
      setActionMessage('Nomor rekening dan nama bank wajib diisi')
      return
    }
    setRekManualSaving(true)
    setActionMessage('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/gadai/${id}/rekening`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ noRekening: rekManualNoRekening, namaBank: rekManualNamaBank })
      })
      const data = await res.json()
      if (data.success) {
        setActionMessage('Rekening disimpan, gadai siap untuk pencairan dana')
        setRekManualNoRekening('')
        setRekManualNamaBank('')
        fetchGadai()
      } else {
        setActionMessage(data.message || 'Gagal menyimpan rekening')
      }
    } catch {
      setActionMessage('Gagal menyimpan rekening')
    } finally {
      setRekManualSaving(false)
    }
  }

  const handleConfirmTransfer = async (manual: boolean) => {
    if (!gadai) return
    setTransferConfirming(true)
    setActionMessage('')
    try {
      const token = localStorage.getItem('adminToken')
      let body: Record<string, unknown> = {}
      if (manual) {
        if (!transferFile || !transferNominal) {
          setActionMessage('Nominal dan bukti transfer wajib diisi')
          setTransferConfirming(false)
          return
        }
        const url = await uploadFile(transferFile)
        body = { buktiTransferCair: url, nominalTransferCair: transferNominal }
      }

      const pokok = Number(manual ? transferNominal : gadai.nominalTransferCair) || 0
      body.sumberDana = pendanaan
        .filter((row) => row.sumberDanaId && Number(row.nominal) > 0)
        .map((row) => ({ sumberDanaId: Number(row.sumberDanaId), nominal: row.nominal }))
      body.nominalKembali = kembaliDiubah
        ? nominalKembali
        : Math.round(pokok * (1 + Number(gadai.bungaPersentase) / 100))

      const res = await fetch(`/api/gadai/${id}/confirm-transfer`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.success) {
        setActionMessage('Transfer dikonfirmasi, gadai aktif dan tercatat di buku besar')
        setTransferFile(null)
        setTransferNominal('')
        setPendanaan([newPendanaanRow()])
        setNominalKembali('')
        setKembaliDiubah(false)
        fetchGadai()
      } else {
        setActionMessage(data.message || 'Gagal konfirmasi transfer')
      }
    } catch (err: any) {
      setActionMessage(err.message || 'Gagal konfirmasi transfer')
    } finally {
      setTransferConfirming(false)
    }
  }

  const handleReject = async () => {
    if (!gadai) return
    setSavingStatus(true)
    setRejectError('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/gadai/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'DITOLAK' })
      })
      const data = await res.json()
      if (data.success) {
        setShowRejectConfirm(false)
        setActionMessage('Pengajuan berhasil ditolak')
        fetchGadai()
      } else {
        setRejectError(data.message || 'Gagal menolak pengajuan')
      }
    } catch {
      setRejectError('Gagal menolak pengajuan')
    } finally {
      setSavingStatus(false)
    }
  }

  const handleAksi = async (body: Record<string, unknown>) => {
    setAksiSaving(true)
    setActionMessage('')
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/gadai/${id}/aksi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      setActionMessage(data.message || (data.success ? 'Berhasil' : 'Gagal memproses aksi'))
      if (data.success) {
        setAksiNominal('')
        fetchGadai()
      }
    } catch {
      setActionMessage('Gagal memproses aksi')
    } finally {
      setAksiSaving(false)
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl p-8 border border-stone-100 text-center text-stone-400">Memuat data...</div>
  }

  if (error || !gadai) {
    return (
      <div className="bg-white rounded-xl p-8 border border-stone-100 text-center">
        <p className="text-red-500 mb-4">{error || 'Pengajuan tidak ditemukan'}</p>
        <Link href="/admin/gadai" className="text-amber-600 hover:text-amber-700 font-medium">&larr; Kembali ke daftar pengajuan</Link>
      </div>
    )
  }

  const nominal = Number(gadai.nominalPinjam)
  const fee = Number(gadai.fee)
  const totalTagihan = nominal + fee
  const totalDibayar = Number(gadai.totalPembayaran)
  const sisaTagihan = Math.max(0, totalTagihan - totalDibayar)
  const style = STATUS_STYLES[gadai.status] || STATUS_STYLES.PENDING
  const isOverdue = gadai.status === 'OVERDUE'
  const needsKendaraan = isKendaraan(gadai.kategoriBarang)
  const showKelengkapan = gadai.status === 'PENDING'
  const showRekeningMenunggu = gadai.status === 'MENUNGGU_REKENING'
  const showTransferConfirm = ['MENUNGGU_TRANSFER', 'MENUNGGU_VERIFIKASI_TRANSFER'].includes(gadai.status)
  const pokokCair = Number(transferNominal || gadai.nominalTransferCair || 0)
  const totalPendanaan = pendanaan.reduce((sum, row) => sum + (Number(row.nominal) || 0), 0)
  const sisaPendanaan = pokokCair - totalPendanaan
  const pendanaanSiap =
    pokokCair > 0 &&
    sisaPendanaan === 0 &&
    pendanaan.every((row) => row.sumberDanaId && Number(row.nominal) > 0)
  const kembaliOtomatis = pokokCair
    ? String(Math.round(pokokCair * (1 + Number(gadai.bungaPersentase) / 100)))
    : ''
  const nominalKembaliView = kembaliDiubah ? nominalKembali : kembaliOtomatis
  const isDue = isDueOrOverdue(gadai.status, gadai.tanggalKembali)
  const bungaTerbayar = Number(gadai.bungaTerbayar)
  const sisaBunga = Math.max(0, fee - bungaTerbayar)
  const origin = globalThis.window === undefined ? '' : globalThis.location.origin
  const financeWaMessage = gadai.transferToken
    ? `Mohon upload bukti transfer pencairan gadai #${gadai.gadaiID} (${gadai.namaBarang}) sebesar ${formatRupiah(nominal)} ke rekening ${gadai.namaBank || '-'} ${gadai.noRekening || '-'}.` +
      `\n\nLink upload: ${origin}/transfer/${gadai.transferToken}`
    : ''
  const financeWaLink = `https://wa.me/${FINANCE_WA_NUMBER}?text=${encodeURIComponent(financeWaMessage)}`
  const customerRekeningWaMessage = gadai.rekeningToken
    ? `Halo ${gadai.customer.nama}, pengajuan gadai #${gadai.gadaiID} (${gadai.namaBarang}) sebesar ${formatRupiah(nominal)} sudah disetujui. ` +
      `Mohon isi nomor rekening tujuan pencairan dana melalui link berikut:\n\n${origin}/rekening/${gadai.rekeningToken}`
    : ''
  const customerRekeningWaLink = `https://wa.me/${gadai.customer.noHp}?text=${encodeURIComponent(customerRekeningWaMessage)}`

  const updatePendanaan = (index: number, patch: Partial<PendanaanRow>) => {
    setPendanaan((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)))
  }

  const bukuBesarForm = (
    <div className="border border-stone-200 rounded-lg bg-white p-4 my-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-stone-800">Catat ke Buku Besar</h3>
        <span className="text-xs text-stone-500">Pokok {formatRupiah(pokokCair)}</span>
      </div>

      {sumberDanaOptions.length === 0 ? (
        <p className="text-xs text-red-500">Master sumber dana belum tersedia.</p>
      ) : (
        <div className="space-y-2">
          {pendanaan.map((row, index) => (
            <div key={row.key} className="flex gap-2">
              <select
                value={row.sumberDanaId}
                onChange={(e) => {
                  const sisa = pokokCair - totalPendanaan + (Number(row.nominal) || 0)
                  updatePendanaan(index, {
                    sumberDanaId: e.target.value,
                    nominal: row.nominal || (sisa > 0 ? String(sisa) : '')
                  })
                }}
                aria-label="Sumber dana"
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
              >
                <option value="">Pilih sumber dana</option>
                {sumberDanaOptions
                  .filter((opt) => String(opt.id) === row.sumberDanaId || !pendanaan.some((r) => r.sumberDanaId === String(opt.id)))
                  .map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.nama}</option>
                  ))}
              </select>
              <input
                type="number"
                value={row.nominal}
                onChange={(e) => updatePendanaan(index, { nominal: e.target.value })}
                placeholder="Nominal"
                aria-label="Nominal sumber dana"
                className="w-36 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
              />
              {pendanaan.length > 1 && (
                <button
                  type="button"
                  onClick={() => setPendanaan((rows) => rows.filter((_, i) => i !== index))}
                  aria-label="Hapus sumber dana"
                  className="px-3 text-stone-400 hover:text-red-600 transition"
                >
                  &times;
                </button>
              )}
            </div>
          ))}

          {pendanaan.length < sumberDanaOptions.length && (
            <button
              type="button"
              onClick={() => setPendanaan((rows) => [...rows, newPendanaanRow()])}
              className="text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              + Tambah sumber dana
            </button>
          )}

          <div className="flex items-center justify-between text-xs pt-2 border-t border-stone-100">
            <span className="text-stone-500">Total dialokasikan</span>
            <span className={sisaPendanaan === 0 && totalPendanaan > 0 ? 'font-semibold text-green-600' : 'font-semibold text-amber-600'}>
              {formatRupiah(totalPendanaan)}
              {sisaPendanaan > 0 && ` · kurang ${formatRupiah(sisaPendanaan)}`}
              {sisaPendanaan < 0 && ` · lebih ${formatRupiah(-sisaPendanaan)}`}
            </span>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="nominal-kembali" className="block text-xs text-stone-500 mb-1">Nominal kembali (hasil nego)</label>
        <input
          id="nominal-kembali"
          type="number"
          value={nominalKembaliView}
          onChange={(e) => {
            setKembaliDiubah(true)
            setNominalKembali(e.target.value)
          }}
          className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
        />
      </div>
    </div>
  )

  const kelFields = [
    { key: 'ktp', label: 'Foto KTP', complete: Boolean(kelFotoKtp) },
    ...(needsKendaraan ? [{ key: 'stnk', label: 'Foto STNK', complete: Boolean(kelFotoStnk) }] : []),
    { key: 'customerBarang', label: 'Foto Customer + Barang', complete: Boolean(kelFotoCustomerBarang) },
    ...(needsKendaraan ? [{ key: 'polisi', label: 'Nomor Polisi', complete: Boolean(kelNomorPolisi.trim()) }] : [])
  ]
  const kelCompletedCount = kelFields.filter(f => f.complete).length
  const kelMissingLabels = kelFields.filter(f => !f.complete).map(f => f.label)
  const kelAllComplete = kelMissingLabels.length === 0

  return (
    <div>
      <Link href="/admin/gadai" className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-flex items-center gap-1">
        &larr; Kembali ke daftar pengajuan
      </Link>

      <div className="bg-white rounded-xl border border-stone-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-stone-800">#{gadai.gadaiID} &mdash; {gadai.namaBarang}</h1>
              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
                {STATUS_LABELS[gadai.status] || gadai.status}
              </span>
            </div>
            <p className="text-stone-500">{gadai.kategoriBarang} &bull; Diajukan {formatDate(gadai.createdAt)}</p>
            {gadai.parentGadaiID !== null && (
              <p className="text-xs text-stone-400 mt-1">
                Perpanjangan dari{' '}
                <Link href={`/admin/gadai/${gadai.parentGadaiID}`} className="text-amber-600 hover:underline">#{gadai.parentGadaiID}</Link>
                {' '}(ke-{gadai.perpanjanganKe})
              </p>
            )}
          </div>
          <Link
            href={`/admin/customer/${gadai.customer.id}`}
            className="inline-flex items-start flex-col gap-0.5 bg-stone-50 hover:bg-stone-100 rounded-lg px-4 py-2.5 transition"
          >
            <span className="text-sm font-medium text-stone-800">{gadai.customer.nama}</span>
            <span className="text-xs text-stone-500">{gadai.customer.noHp}</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Loan info */}
          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Detail Pinjaman</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Nominal</p>
                <p className="text-sm font-semibold text-stone-800">{formatRupiah(nominal)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Jasa</p>
                <p className="text-sm font-semibold text-stone-800">{formatRupiah(fee)} ({Number(gadai.bungaPersentase)}%)</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Total Tagihan</p>
                <p className="text-sm font-semibold text-stone-800">{formatRupiah(totalTagihan)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Sudah Dibayar</p>
                <p className="text-sm font-semibold text-blue-600">{formatRupiah(totalDibayar)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Sisa Tagihan</p>
                <p className={`text-sm font-semibold ${sisaTagihan > 0 ? 'text-red-600' : 'text-green-600'}`}>{formatRupiah(sisaTagihan)}</p>
              </div>
              <div>
                <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Tanggal Kembali</p>
                <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600' : 'text-stone-800'}`}>{formatDate(gadai.tanggalKembali)}</p>
              </div>
            </div>
            <div className="border-t border-stone-100 pt-4">
              <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Atribut Kelengkapan</p>
              <p className="text-sm text-stone-700">{gadai.atributTinggal}</p>
              {gadai.deskripsi && (
                <>
                  <p className="text-xs text-stone-500 uppercase tracking-wide mb-1 mt-3">Deskripsi</p>
                  <p className="text-sm text-stone-700">{gadai.deskripsi}</p>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {gadai.customer.fotoKtp && (
                <button type="button" onClick={() => setPreviewPhoto(gadai.customer.fotoKtp)} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                  🪪 Foto KTP
                </button>
              )}
              {gadai.fotoBarang && gadai.fotoBarang !== '-' && (
                <button type="button" onClick={() => setPreviewPhoto(gadai.fotoBarang)} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                  📦 Foto Barang
                </button>
              )}
              {gadai.fotoPendukung && (
                <button type="button" onClick={() => setPreviewPhoto(gadai.fotoPendukung)} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                  🛵 Foto STNK
                </button>
              )}
              {gadai.fotoCustomerBarang && (
                <button type="button" onClick={() => setPreviewPhoto(gadai.fotoCustomerBarang)} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                  🤝 Foto Customer+Barang
                </button>
              )}
              {gadai.fotoPendukungTambahan?.map((url, i) => (
                <button key={url} type="button" onClick={() => setPreviewPhoto(url)} className="inline-flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium bg-amber-50 px-3 py-1.5 rounded-lg">
                  📎 Pendukung {i + 1}
                </button>
              ))}
            </div>
            {(gadai.noRekening || gadai.namaBank || gadai.nomorPolisi) && (
              <div className="border-t border-stone-100 mt-4 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {(gadai.noRekening || gadai.namaBank) && (
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Rekening Tujuan</p>
                    <p className="text-sm font-semibold text-stone-800">{gadai.namaBank || '-'} &mdash; {gadai.noRekening || '-'}</p>
                  </div>
                )}
                {gadai.nomorPolisi && (
                  <div>
                    <p className="text-xs text-stone-500 uppercase tracking-wide mb-1">Nomor Polisi</p>
                    <p className="text-sm font-semibold text-stone-800">{gadai.nomorPolisi}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {showKelengkapan && (
            <div className="bg-white rounded-xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-800 mb-1">Kelengkapan Data</h2>
              <p className="text-xs text-stone-500 mb-4">Diisi admin saat customer datang membawa barang jaminan.</p>

              <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-stone-600">{kelCompletedCount} dari {kelFields.length} lengkap</span>
                  {!kelAllComplete && (
                    <span className="text-amber-600">Kurang: {kelMissingLabels.join(', ')}</span>
                  )}
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${kelAllComplete ? 'bg-green-500' : 'bg-amber-400'}`}
                    style={{ width: `${(kelCompletedCount / kelFields.length) * 100}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <KelPhotoField label="Foto KTP" value={kelFotoKtp} uploading={kelUploading === 'ktp'} onChange={(e) => handleKelFileChange('ktp', e)} onPreview={setPreviewPhoto} />
                {needsKendaraan && (
                  <KelPhotoField label="Foto STNK" value={kelFotoStnk} uploading={kelUploading === 'stnk'} onChange={(e) => handleKelFileChange('stnk', e)} onPreview={setPreviewPhoto} />
                )}
                <KelPhotoField label="Foto Customer dengan Barang" value={kelFotoCustomerBarang} uploading={kelUploading === 'customerBarang'} onChange={(e) => handleKelFileChange('customerBarang', e)} onPreview={setPreviewPhoto} />
                <div className="rounded-lg border border-stone-200 bg-stone-50/40 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="kel-pendukung-tambahan" className="text-xs font-medium text-stone-600">Foto Pendukung (KK/Nikah/BPKB, opsional)</label>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-stone-200 text-stone-500">{kelFotoPendukungTambahan.length} foto</span>
                  </div>
                  <label className="block cursor-pointer">
                    <span className="inline-flex items-center justify-center w-full text-xs font-medium text-stone-600 bg-white border border-dashed border-stone-300 rounded-lg px-2 py-2 hover:bg-stone-100 transition">
                      {kelUploading === 'pendukungTambahan' ? 'Mengunggah...' : 'Tambah foto'}
                    </span>
                    <input id="kel-pendukung-tambahan" type="file" accept="image/jpeg,image/png,image/webp,image/heic" onChange={handleAddPendukungTambahan} disabled={kelUploading === 'pendukungTambahan'} className="hidden" />
                  </label>
                  {kelFotoPendukungTambahan.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {kelFotoPendukungTambahan.map((url, i) => (
                        <li key={url} className="flex items-center justify-between text-xs bg-white border border-stone-100 rounded px-2 py-1">
                          <button type="button" onClick={() => setPreviewPhoto(url)} className="text-amber-600 hover:underline truncate">Foto {i + 1}</button>
                          <button type="button" onClick={() => handleRemovePendukungTambahan(i)} className="text-red-500 ml-2">Hapus</button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                {needsKendaraan && (
                  <KelTextField id="kel-nomor-polisi" label="Nomor Polisi" value={kelNomorPolisi} onChange={(e) => setKelNomorPolisi(e.target.value)} />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => handleSaveKelengkapan(false)} disabled={kelSaving} className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 disabled:opacity-50 transition">
                  {kelSaving ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  onClick={() => handleSaveKelengkapan(true)}
                  disabled={kelSaving || !kelAllComplete}
                  title={kelAllComplete ? undefined : `Lengkapi dulu: ${kelMissingLabels.join(', ')}`}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 disabled:hover:bg-amber-600 transition"
                >
                  {kelSaving ? 'Menyimpan...' : 'Setujui & Minta Rekening ke Customer'}
                </button>
                <button
                  onClick={() => { setRejectError(''); setShowRejectConfirm(true) }}
                  disabled={savingStatus}
                  className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 disabled:opacity-50 transition sm:ml-auto"
                >
                  Tolak Pengajuan
                </button>
              </div>
              {kelMessage && <p className="text-xs text-stone-500 mt-3">{kelMessage}</p>}
            </div>
          )}

          {showRekeningMenunggu && (
            <div className="bg-white rounded-xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-800 mb-1">Menunggu Rekening Customer</h2>
              <p className="text-xs text-stone-500 mb-4">Data sudah disetujui. Customer diminta mengisi nomor rekening &amp; nama bank tujuan pencairan dana sendiri.</p>

              {gadai.rekeningToken && (
                <a
                  href={customerRekeningWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition mb-4"
                >
                  Kirim Link ke Customer (WA)
                </a>
              )}

              <div className="border-t border-stone-100 pt-4">
                <p className="text-xs text-stone-500 mb-3">Atau isi manual jika customer tidak bisa mengakses link (mis. lewat telepon):</p>
                <form onSubmit={handleSaveRekeningManual} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={rekManualNamaBank}
                    onChange={(e) => setRekManualNamaBank(e.target.value)}
                    placeholder="Nama Bank"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={rekManualNoRekening}
                    onChange={(e) => setRekManualNoRekening(e.target.value)}
                    placeholder="Nomor Rekening"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                  <button
                    type="submit"
                    disabled={rekManualSaving}
                    className="sm:col-span-2 px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
                  >
                    {rekManualSaving ? 'Menyimpan...' : 'Simpan Rekening & Lanjutkan'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {showTransferConfirm && (
            <div className="bg-white rounded-xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-800 mb-1">Konfirmasi Transfer Pencairan</h2>
              <p className="text-xs text-stone-500 mb-4">Dana pinjaman ditransfer ke rekening customer, lalu diverifikasi disini.</p>

              {gadai.transferToken && gadai.status === 'MENUNGGU_TRANSFER' && (
                <a
                  href={financeWaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg text-xs font-medium transition mb-4"
                >
                  Kirim Link ke Bagian Keuangan (WA)
                </a>
              )}

              {gadai.status === 'MENUNGGU_VERIFIKASI_TRANSFER' && gadai.buktiTransferCair ? (
                <div className="bg-stone-50 rounded-lg p-4 mb-4 text-sm space-y-1">
                  <p>Nominal ditransfer: <span className="font-semibold">{formatRupiah(Number(gadai.nominalTransferCair))}</span></p>
                  <button type="button" onClick={() => setPreviewPhoto(gadai.buktiTransferCair)} className="text-amber-600 hover:underline">Lihat bukti transfer</button>
                  {bukuBesarForm}
                  <div className="pt-2">
                    <button onClick={() => handleConfirmTransfer(false)} disabled={transferConfirming || !pendanaanSiap} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition">
                      {transferConfirming ? 'Memproses...' : 'Konfirmasi & Aktifkan Gadai'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-stone-500">Atau upload manual bukti transfer (jika tidak lewat link):</p>
                  <input
                    type="number"
                    value={transferNominal}
                    onChange={(e) => setTransferNominal(e.target.value)}
                    placeholder="Nominal ditransfer (Rp)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/heic"
                    onChange={(e) => setTransferFile(e.target.files?.[0] || null)}
                    className="w-full text-xs"
                  />
                  {bukuBesarForm}
                  <button onClick={() => handleConfirmTransfer(true)} disabled={transferConfirming || !pendanaanSiap} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition">
                    {transferConfirming ? 'Memproses...' : 'Upload & Konfirmasi Manual'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Payment history */}
          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Riwayat Pembayaran</h2>
            {gadai.payments.length === 0 ? (
              <p className="text-stone-400 text-sm text-center py-6">Belum ada pembayaran tercatat</p>
            ) : (
              <div className="divide-y divide-stone-100">
                {gadai.payments.map((p) => (
                  <div key={p.id} className="flex justify-between items-center py-3">
                    <div>
                      <p className="text-sm font-medium text-stone-800">{p.tipeBayar}</p>
                      <p className="text-xs text-stone-400">{formatDate(p.createdAt)} {p.createdBy ? `\u2022 oleh ${p.createdBy}` : ''}</p>
                      {p.catatan && <p className="text-xs text-stone-500 mt-0.5">{p.catatan}</p>}
                    </div>
                    <p className="text-sm font-semibold text-green-600">{formatRupiah(Number(p.jumlahBayar))}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAddPayment} className="border-t border-stone-100 mt-4 pt-4 flex flex-col sm:flex-row gap-3">
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Jumlah bayar (Rp)"
                min="1"
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
                required
              />
              <input
                type="text"
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                placeholder="Catatan (opsional)"
                className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm"
              />
              <button
                type="submit"
                disabled={savingPayment}
                className="px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-900 disabled:opacity-50 transition"
              >
                {savingPayment ? 'Menyimpan...' : 'Catat Bayar'}
              </button>
            </form>
          </div>
        </div>

        {/* Status panel */}
        <div className="space-y-6">
          {isDue && (
            <div className="bg-white rounded-xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-800 mb-1">Ambil / Perpanjang</h2>
              <p className="text-xs text-stone-500 mb-4">
                Sisa tagihan {formatRupiah(sisaTagihan)} &bull; Bunga siklus ini {formatRupiah(sisaBunga)} lagi dari {formatRupiah(fee)}
              </p>

              {gadai.pendingAksi ? (
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-4 text-sm space-y-2">
                  <p className="font-medium text-amber-800">
                    Permintaan customer: {gadai.pendingAksi === 'AMBIL' ? 'Ambil Barang' : 'Perpanjang'} sebesar {formatRupiah(Number(gadai.pendingAksiNominal))}
                  </p>
                  {gadai.pendingAksiBukti && (
                    <button type="button" onClick={() => setPreviewPhoto(gadai.pendingAksiBukti)} className="text-amber-700 hover:underline text-xs">Lihat bukti transfer</button>
                  )}
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleAksi({})}
                      disabled={aksiSaving}
                      className="px-3 py-2 bg-amber-600 text-white rounded-lg text-xs font-medium hover:bg-amber-700 disabled:opacity-50 transition"
                    >
                      {aksiSaving ? 'Memproses...' : 'Konfirmasi'}
                    </button>
                    <button
                      onClick={() => handleAksi({ reject: true })}
                      disabled={aksiSaving}
                      className="px-3 py-2 bg-stone-100 text-stone-700 rounded-lg text-xs font-medium hover:bg-stone-200 disabled:opacity-50 transition"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <select
                    value={aksiType}
                    onChange={(e) => setAksiType(e.target.value as 'AMBIL' | 'PERPANJANG')}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  >
                    <option value="AMBIL">Ambil Barang (lunasi sisa tagihan)</option>
                    <option value="PERPANJANG">Perpanjang (bayar bunga)</option>
                  </select>
                  <input
                    type="number"
                    value={aksiNominal}
                    onChange={(e) => setAksiNominal(e.target.value)}
                    placeholder="Nominal dibayar (Rp)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => handleAksi({ aksi: aksiType, nominal: aksiNominal })}
                    disabled={aksiSaving || !aksiNominal}
                    className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
                  >
                    {aksiSaving ? 'Memproses...' : 'Proses'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 mb-4">Ubah Status</h2>
            <select
              value={statusValue}
              onChange={(e) => setStatusValue(e.target.value)}
              className="w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none text-sm mb-3"
            >
              {Object.keys(STATUS_LABELS).map((s) => (
                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
              ))}
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={savingStatus || statusValue === gadai.status}
              className="w-full px-4 py-2.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
            >
              {savingStatus ? 'Menyimpan...' : 'Simpan Status'}
            </button>
            {actionMessage && <p className="text-xs text-stone-500 mt-3">{actionMessage}</p>}
          </div>

          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 mb-3">Kontak Customer</h2>
            <a
              href={`https://wa.me/${gadai.customer.noHp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition"
            >
              Chat WhatsApp
            </a>
          </div>
        </div>
      </div>

      {previewPhoto && <PhotoLightbox src={previewPhoto} onClose={() => setPreviewPhoto(null)} />}

      <ConfirmDialog
        open={showRejectConfirm}
        variant="danger"
        title="Tolak pengajuan ini?"
        description={`Pengajuan #${gadai.gadaiID} (${gadai.namaBarang}) akan ditolak. Customer akan melihat status "Ditolak" pada halaman lacak pengajuan.`}
        confirmLabel="Ya, Tolak"
        loadingLabel="Menolak..."
        loading={savingStatus}
        errorMessage={rejectError}
        onConfirm={handleReject}
        onCancel={() => { if (!savingStatus) setShowRejectConfirm(false) }}
      />
    </div>
  )
}
