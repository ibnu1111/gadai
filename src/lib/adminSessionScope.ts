'use client'

/**
 * Helper sisi klien untuk admin yang terkunci ke satu sumber dana.
 *
 * Data session admin disimpan di localStorage saat login (lihat
 * /admin/login). `sumberDanaId` terisi berarti akun tersebut hanya boleh
 * melihat data sumber dana itu dan tidak boleh mengubah apa pun.
 *
 * Penegakan sebenarnya ada di server (lib/adminAuth.ts guardMutasi); yang di
 * sini hanya menyembunyikan aksi yang memang tidak akan bisa dijalankan.
 */

export interface SessionAdmin {
  id: number
  nama: string
  email: string
  sumberDanaId?: number | null
  namaSumberDana?: string | null
}

export function ambilSessionAdmin(): SessionAdmin | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('adminData')
  if (!raw) return null
  try {
    return JSON.parse(raw) as SessionAdmin
  } catch {
    return null
  }
}

/** True kalau akun ini hanya boleh melihat satu sumber dana. */
export function adminTerkunci(): boolean {
  const admin = ambilSessionAdmin()
  return Boolean(admin?.sumberDanaId)
}

/** Nama sumber dana milik admin, untuk ditampilkan di header. */
export function namaSumberDanaAdmin(): string | null {
  return ambilSessionAdmin()?.namaSumberDana ?? null
}
