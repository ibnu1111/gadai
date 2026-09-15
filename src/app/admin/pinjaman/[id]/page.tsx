'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { handleUnauthorized } from '@/lib/adminSession'

interface SumberDanaOption {
  id: number
  nama: string
}

interface PendanaanRow {
  id: number
  nominal: string
  sumberDana: { id: number; nama: string }
}

interface SiklusRow {
  id: number
  siklusKe: number
  tanggalMulai: string
  tanggalJatuhTempo: string
  nominalBunga: string
  status: string
  tanggalBayar: string | null
  nominalDibayar: string | null
  catatan: string | null
}

interface PinjamanDetail {
  id: number
  jenis: string
  namaBarang: string | null
  pokok: string
  status: string
  tanggalCair: string
  tanggalSelesai: string | null
  nominalAkhir: string | null
  catatan: string | null
  customer: { id: number; nama: string; noHp: string }
  gadai: { gadaiID: number; status: string } | null
  siklus: SiklusRow[]
  pendanaan: PendanaanRow[]
}

const STATUS_LABELS: Record<string, string> = {
  AKTIF: 'Aktif',
  LUNAS: 'Lunas',
  LELANG: 'Lelang',
  WRITEOFF: 'Hapus Buku',
  BERJALAN: 'Berjalan',
  PERPANJANG: 'Diperpanjang'
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  AKTIF: { bg: 'bg-green-100', text: 'text-green-800' },
  BERJALAN: { bg: 'bg-green-100', text: 'text-green-800' },
  LUNAS: { bg: 'bg-blue-100', text: 'text-blue-800' },
  PERPANJANG: { bg: 'bg-purple-100', text: 'text-purple-800' },
  LELANG: { bg: 'bg-stone-100', text: 'text-stone-600' },
  WRITEOFF: { bg: 'bg-red-100', text: 'text-red-800' }
}

function formatRupiah(num: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num)
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}

let rowKeySeq = 0
interface EditRow { key: number; sumberDanaId: string; nominal: string }
const newEditRow = (): EditRow => ({ key: ++rowKeySeq, sumberDanaId: '', nominal: '' })

export default function AdminPinjamanDetailPage() {
  const params = useParams()
  const id = params.id as string

  const [pinjaman, setPinjaman] = useState<PinjamanDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [sumberDanaOptions, setSumberDanaOptions] = useState<SumberDanaOption[]>([])
  const [editing, setEditing] = useState(false)
  const [editRows, setEditRows] = useState<EditRow[]>([])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const fetchPinjaman = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/pinjaman/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      if (handleUnauthorized(res.status, `/admin/pinjaman/${id}`)) return
      const data = await res.json()
      if (data.success) {
        setPinjaman(data.data)
      } else {
        setError(data.message || 'Pinjaman tidak ditemukan')
      }
    } catch {
      setError('Gagal memuat data pinjaman')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPinjaman()
    const fetchSumberDana = async () => {
      const token = localStorage.getItem('adminToken')
      const res = await fetch('/api/sumber-dana', { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json()
      if (data.success) setSumberDanaOptions(data.data)
    }
    fetchSumberDana()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const startEdit = () => {
    if (!pinjaman) return
    setEditRows(
      pinjaman.pendanaan.length > 0
        ? pinjaman.pendanaan.map((p) => ({ key: ++rowKeySeq, sumberDanaId: String(p.sumberDana.id), nominal: p.nominal }))
        : [newEditRow()]
    )
    setSaveError('')
    setEditing(true)
  }

  const totalEdit = editRows.reduce((sum, r) => sum + (Number.parseFloat(r.nominal) || 0), 0)
  const pokokNum = pinjaman ? Number(pinjaman.pokok) : 0

  const handleSaveSumberDana = async () => {
    if (!pinjaman) return
    setSaveError('')

    const sumberDana = editRows
      .filter((r) => r.sumberDanaId && r.nominal)
      .map((r) => ({ sumberDanaId: Number.parseInt(r.sumberDanaId), nominal: r.nominal }))

    if (sumberDana.length === 0) {
      setSaveError('Sumber dana wajib diisi')
      return
    }
    if (Math.round(totalEdit) !== Math.round(pokokNum)) {
      setSaveError(`Total sumber dana ${formatRupiah(totalEdit)} harus sama dengan pokok ${formatRupiah(pokokNum)}`)
      return
    }

    setSaving(true)
    try {
      const token = localStorage.getItem('adminToken')
      const res = await fetch(`/api/pinjaman/${id}/pendanaan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sumberDana })
      })
      const data = await res.json()
      if (data.success) {
        setEditing(false)
        fetchPinjaman()
      } else {
        setSaveError(data.message || 'Gagal menyimpan sumber dana')
      }
    } catch {
      setSaveError('Gagal menyimpan sumber dana')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="bg-white rounded-xl p-8 border border-stone-100 text-center text-stone-400">Memuat data...</div>
  }

  if (error || !pinjaman) {
    return (
      <div className="bg-white rounded-xl p-8 border border-stone-100 text-center">
        <p className="text-red-500 mb-4">{error || 'Pinjaman tidak ditemukan'}</p>
        <Link href="/admin/buku/tempo" className="text-amber-600 hover:text-amber-700 font-medium">&larr; Kembali ke daftar pinjaman</Link>
      </div>
    )
  }

  const statusStyle = STATUS_STYLES[pinjaman.status] || STATUS_STYLES.AKTIF

  return (
    <div>
      <Link href="/admin/buku/tempo" className="text-sm text-stone-500 hover:text-stone-700 mb-4 inline-flex items-center gap-1">
        &larr; Kembali ke daftar pinjaman
      </Link>

      <div className="bg-white rounded-xl border border-stone-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-stone-800">
                {pinjaman.jenis} {pinjaman.namaBarang ? `\u2014 ${pinjaman.namaBarang}` : ''}
              </h1>
              <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                {STATUS_LABELS[pinjaman.status] || pinjaman.status}
              </span>
            </div>
            <p className="text-stone-500">Pokok {formatRupiah(Number(pinjaman.pokok))} &bull; Cair {formatDate(pinjaman.tanggalCair)}</p>
            {pinjaman.gadai && (
              <Link href={`/admin/gadai/${pinjaman.gadai.gadaiID}`} className="text-xs text-amber-600 hover:underline mt-1 inline-block">
                Lihat pengajuan online #{pinjaman.gadai.gadaiID} &rarr;
              </Link>
            )}
          </div>
          <Link
            href={`/admin/customer/${pinjaman.customer.id}`}
            className="inline-flex items-start flex-col gap-0.5 bg-stone-50 hover:bg-stone-100 rounded-lg px-4 py-2.5 transition"
          >
            <span className="text-sm font-medium text-stone-800">{pinjaman.customer.nama}</span>
            <span className="text-xs text-stone-500">{pinjaman.customer.noHp}</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-stone-100">
              <h2 className="font-semibold text-stone-800">Riwayat Siklus</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Siklus</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Mulai</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Jatuh Tempo</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Bunga</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {pinjaman.siklus.map((s) => {
                    const style = STATUS_STYLES[s.status] || STATUS_STYLES.BERJALAN
                    return (
                      <tr key={s.id}>
                        <td className="px-4 py-3 text-sm font-medium text-stone-700">ke-{s.siklusKe}</td>
                        <td className="px-4 py-3 text-sm text-stone-500">{formatDate(s.tanggalMulai)}</td>
                        <td className="px-4 py-3 text-sm text-stone-500">{formatDate(s.tanggalJatuhTempo)}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-stone-700">{formatRupiah(Number(s.nominalBunga))}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
                            {STATUS_LABELS[s.status] || s.status}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-stone-800">Sumber Dana</h2>
              {!editing && (
                <button type="button" onClick={startEdit} className="text-xs font-medium text-amber-600 hover:text-amber-700">
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <div className="space-y-2">
                {editRows.map((row) => (
                  <div key={row.key} className="flex gap-2">
                    <select
                      value={row.sumberDanaId}
                      onChange={(e) => setEditRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, sumberDanaId: e.target.value } : r)))}
                      className="flex-1 px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    >
                      <option value="">Pilih sumber dana</option>
                      {sumberDanaOptions.map((s) => (
                        <option key={s.id} value={s.id}>{s.nama}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={row.nominal}
                      onChange={(e) => setEditRows((prev) => prev.map((r) => (r.key === row.key ? { ...r, nominal: e.target.value } : r)))}
                      placeholder="Nominal"
                      className="w-28 px-2 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setEditRows((prev) => prev.filter((r) => r.key !== row.key))}
                      disabled={editRows.length <= 1}
                      className="px-2 text-red-500 disabled:opacity-30"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setEditRows((prev) => [...prev, newEditRow()])}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  + Tambah sumber dana
                </button>
                <p className={`text-xs ${Math.round(totalEdit) === Math.round(pokokNum) ? 'text-stone-500' : 'text-red-500'}`}>
                  Total {formatRupiah(totalEdit)} dari pokok {formatRupiah(pokokNum)}
                </p>
                {saveError && <p className="text-xs text-red-500">{saveError}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveSumberDana}
                    disabled={saving}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 disabled:opacity-50 transition"
                  >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition"
                  >
                    Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {pinjaman.pendanaan.length === 0 ? (
                  <p className="text-sm text-stone-400">Belum ada rincian sumber dana</p>
                ) : (
                  pinjaman.pendanaan.map((p) => (
                    <div key={p.id} className="flex justify-between text-sm">
                      <span className="text-stone-600">{p.sumberDana.nama}</span>
                      <span className="font-medium text-stone-800">{formatRupiah(Number(p.nominal))}</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
