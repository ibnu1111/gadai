import type { AdminPayload } from '@/lib/auth'

/**
 * Pembatasan akses admin per sumber dana.
 *
 * Admin biasa (elfa, ibnu, wisnu) punya `sumberDanaId = null` dan melihat
 * semuanya. Admin yang dikunci ke satu sumber dana (mis. Bagong) hanya boleh
 * melihat transaksi yang pendanaannya berasal dari sumber dana itu, dan tidak
 * boleh mengubah apa pun.
 */

export interface AdminScope {
  /** null = admin penuh, melihat semua sumber dana. */
  sumberDanaId: number | null
  namaSumberDana: string | null
}

export function scopeDariAdmin(
  admin: AdminPayload & { sumberDanaId?: number | null; namaSumberDana?: string | null }
): AdminScope {
  const id = admin.sumberDanaId ?? null
  return {
    sumberDanaId: id,
    namaSumberDana: id ? (admin.namaSumberDana ?? null) : null
  }
}

/** Admin yang terkunci ke satu sumber dana. */
export function adminTerbatas(scope: AdminScope): boolean {
  return scope.sumberDanaId !== null
}

/**
 * Gabungkan predicate scope dengan where yang sudah ada memakai AND.
 *
 * Dipakai AND (bukan menyisipkan OR) supaya tidak bentrok dengan filter
 * pencarian yang pada beberapa endpoint memakai OR.
 */
export function terapkanScope<T extends object>(
  where: T,
  predicate: object | null
): T {
  if (!predicate) return where
  return { AND: [where, predicate] } as T
}

/**
 * Pinjaman yang pendanaannya berasal dari sumber dana milik admin terbatas.
 *
 * Hanya berlaku untuk query terhadap model `Pinjaman`. Model lain harus pakai
 * predicate-nya sendiri (lihat di bawah) karena nama relasi `pendanaan` hanya
 * ada pada `Pinjaman`.
 */
export function predicatePinjaman(scope: AdminScope): object | null {
  if (!adminTerbatas(scope)) return null
  return { pendanaan: { some: { sumberDanaId: scope.sumberDanaId as number } } }
}

/**
 * Siklus dari pinjaman yang pendanaannya berasal dari sumber dana admin
 * terbatas. `Siklus` tidak punya relasi `pendanaan` sendiri, jadi harus lewat
 * relasi ke `Pinjaman`.
 */
export function predicateSiklus(scope: AdminScope): object | null {
  if (!adminTerbatas(scope)) return null
  return {
    pinjaman: { pendanaan: { some: { sumberDanaId: scope.sumberDanaId as number } } }
  }
}

/**
 * Rincian pendanaan dari sumber dana milik admin terbatas.
 *
 * Dibatasi pada `sumberDanaId` miliknya sendiri, bukan lewat relasi ke
 * pinjaman: satu pinjaman bisa didanai beberapa sumber, dan admin terkunci
 * hanya berhak melihat modal dari sumber miliknya.
 */
export function predicatePinjamanDana(scope: AdminScope): object | null {
  if (!adminTerbatas(scope)) return null
  return { sumberDanaId: scope.sumberDanaId as number }
}

/**
 * Gadai: yang sudah jadi pinjaman mengikuti sumber dana pinjamannya, sedangkan
 * gadai yang belum pernah dicairkan belum punya sumber dana dan tetap terlihat
 * oleh semua admin (funnel pengajuan bersifat bersama).
 */
export function predicateGadai(scope: AdminScope): object | null {
  if (!adminTerbatas(scope)) return null
  return {
    OR: [
      { pinjaman: { is: null } },
      { pinjaman: { is: { pendanaan: { some: { sumberDanaId: scope.sumberDanaId as number } } } } }
    ]
  }
}

/**
 * Customer: punya gadai yang belum/cair atau pinjaman dari sumber dana
 * tersebut.
 */
export function predicateCustomer(scope: AdminScope): object | null {
  if (!adminTerbatas(scope)) return null
  return {
    OR: [
      { gadais: { some: { pinjaman: { is: null } } } },
      { gadais: { some: { pinjaman: { is: { pendanaan: { some: { sumberDanaId: scope.sumberDanaId as number } } } } } } },
      { pinjaman: { some: { pendanaan: { some: { sumberDanaId: scope.sumberDanaId as number } } } } }
    ]
  }
}

/**
 * Guard untuk endpoint mutasi. Admin terkunci hanya boleh membaca, jadi
 * setiap perubahan data harus ditolak di server (bukan hanya disables UI).
 */
export function tolakJikaAdminTerbatas(scope: AdminScope, aksi = 'mengubah data'): string | null {
  if (!adminTerbatas(scope)) return null
  const nama = scope.namaSumberDana ? `sumber dana ${scope.namaSumberDana}` : 'sumber dana Anda'
  return `Akun ini hanya dapat melihat data ${nama}, tidak dapat ${aksi}.`
}
