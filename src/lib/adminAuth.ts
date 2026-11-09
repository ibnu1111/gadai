import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminFromRequest, type AdminPayload } from '@/lib/auth'
import { adminTerbatas, tolakJikaAdminTerbatas, type AdminScope } from '@/lib/adminScope'

export interface AdminDenganScope {
  admin: AdminPayload
  scope: AdminScope
}

/**
 * Ambil admin dari token BESERTA scope sumber dana yang fresh dari database.
 *
 * Scope sengaja dibaca ulang dari DB (bukan dari isi JWT) supaya perubahan
 * cakupan admin langsung berlaku, tanpa harus menunggu token 90 hari
 * kedaluwarsa. Token tetap membawa scope supaya UI bisa langsung
 * menyembunyikan aksi yang tidak diizinkan.
 */
export async function getAdminDenganScope(
  request: Request
): Promise<AdminDenganScope | null> {
  const admin = getAdminFromRequest(request)
  if (!admin) return null

  const row = await prisma.admin.findUnique({
    where: { id: admin.id },
    select: {
      nama: true,
      email: true,
      sumberDanaId: true,
      sumberDana: { select: { nama: true } }
    }
  })

  // Admin sudah dihapus -> perlakukan tidak terautentikasi.
  if (!row) return null

  return {
    admin: { ...admin, nama: row.nama, email: row.email },
    scope: {
      sumberDanaId: row.sumberDanaId ?? null,
      namaSumberDana: row.sumberDana?.nama ?? null
    }
  }
}

/**
 * Versi ringkas untuk endpoint yang hanya butuh tahu "apakah admin ini
 * terkunci ke satu sumber dana".
 */
export async function adminTerkunci(request: Request): Promise<{
  terkunci: boolean
  scope: AdminScope
  admin: AdminPayload
} | null> {
  const hasil = await getAdminDenganScope(request)
  if (!hasil) return null
  return {
    terkunci: adminTerbatas(hasil.scope),
    scope: hasil.scope,
    admin: hasil.admin
  }
}

/**
 * Guard untuk endpoint mutasi.
 *
 * Admin terkunci ke satu sumber dana hanya boleh membaca, jadi setiap
 * perubahan data harus ditolak di server. Penolakan ini TIDAK boleh
 * digantungkan pada UI saja.
 *
 * Balikan:
 * - `{ admin, scope }` -> lanjut tangani request.
 * - Response JSON langsung -> kirim response itu apa adanya (401 atau 403).
 */
export async function guardMutasi(
  request: Request,
  aksi = 'mengubah data'
): Promise<
  { admin: AdminPayload; scope: AdminScope } | { response: NextResponse }
> {
  const auth = await getAdminDenganScope(request)
  if (!auth) {
    return {
      response: NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }
  }

  const tolak = tolakJikaAdminTerbatas(auth.scope, aksi)
  if (tolak) {
    return {
      response: NextResponse.json({ success: false, message: tolak }, { status: 403 })
    }
  }

  return { admin: auth.admin, scope: auth.scope }
}
