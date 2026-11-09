/**
 * Seed sumber dana baru + akun admin yang terkunci ke sumber dana.
 *
 * Jalankan dari folder project:
 *   BAGONG_PASSWORD='...' node scripts/seed-sumber-dana.mjs
 *
 * Password diambil dari environment variable supaya tidak ada kredensial yang
 * tersimpan di repo ini. Untuk admin lain, set variabel dengan pola
 * <NAMA>_PASSWORD, mis. LANANG_PASSWORD.
 *
 * Idempoten: aman dijalankan berkali-kali. Sumber dana yang sudah ada tidak
 * diduplikasi, dan akun admin di-update (bukan dibuat ulang).
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Sumber dana baru, urut setelah "Lain-lain" (urutan 6).
const SUMBER_DANA_BARU = ['Bagong', 'Lanang', 'Restu', 'Abdul']

// Akun admin terkunci ke sumber dana. Password dibaca dari env var
// <NAMA_UPPER>_PASSWORD, jadi tidak pernah ditulis di repo.
const ADMIN_TERKUNCI = [
  { email: 'bagong', nama: 'Bagong', sumberDana: 'Bagong' }
]

function passwordDariEnv(nama) {
  const key = `${nama.toUpperCase()}_PASSWORD`
  const value = process.env[key]
  if (!value) {
    throw new Error(
      `Environment variable ${key} belum diisi. Jalankan: ${key}='...' node scripts/seed-sumber-dana.mjs`
    )
  }
  return value
}

async function main() {
  // 1. Sumber dana baru.
  const maxUrutan = await prisma.sumberDana.aggregate({ _max: { urutan: true } })
  let urutan = maxUrutan._max.urutan ?? 0

  const sumberDanaMap = new Map()
  for (const nama of SUMBER_DANA_BARU) {
    const ada = await prisma.sumberDana.findUnique({ where: { nama } })
    if (ada) {
      sumberDanaMap.set(nama, ada)
      console.log(`sumber dana "${nama}" sudah ada (id=${ada.id})`)
      continue
    }
    urutan += 1
    const dibuat = await prisma.sumberDana.create({
      data: { nama, urutan, aktif: true }
    })
    sumberDanaMap.set(nama, dibuat)
    console.log(`sumber dana "${nama}" dibuat (id=${dibuat.id}, urutan=${urutan})`)
  }

  // 2. Akun admin terkunci.
  for (const akun of ADMIN_TERKUNCI) {
    const sumberDana = sumberDanaMap.get(akun.sumberDana)
    if (!sumberDana) {
      console.log(`LEWATI "${akun.email}": sumber dana "${akun.sumberDana}" tidak ada`)
      continue
    }

    const hash = await bcrypt.hash(passwordDariEnv(akun.nama), 10)
    const ada = await prisma.admin.findUnique({ where: { email: akun.email } })

    if (ada) {
      await prisma.admin.update({
        where: { email: akun.email },
        data: { nama: akun.nama, password: hash, sumberDanaId: sumberDana.id }
      })
      console.log(`admin "${akun.email}" di-update -> sumber dana ${sumberDana.nama}`)
    } else {
      await prisma.admin.create({
        data: { email: akun.email, nama: akun.nama, password: hash, sumberDanaId: sumberDana.id }
      })
      console.log(`admin "${akun.email}" dibuat -> sumber dana ${sumberDana.nama}`)
    }
  }

  // 3. Ringkasan.
  console.log('\n--- Admin saat ini ---')
  for (const a of await prisma.admin.findMany({
    include: { sumberDana: { select: { nama: true } } },
    orderBy: { id: 'asc' }
  })) {
    console.log(`  id=${a.id} ${a.email} | ${a.nama} | sumber dana: ${a.sumberDana?.nama ?? '(penuh)'}`)
  }

  console.log('\n--- Semua sumber dana ---')
  for (const s of await prisma.sumberDana.findMany({ orderBy: [{ urutan: 'asc' }, { nama: 'asc' }] })) {
    console.log(`  id=${s.id} ${s.nama} (urutan=${s.urutan}, aktif=${s.aktif})`)
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
