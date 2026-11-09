'use client'

/**
 * Helper unggah foto untuk dipakai di halaman publik (create/track/transfer) dan
 * halaman admin.
 *
 * Dua masalah yang bikin upload dari handphone terasa "stuck":
 * 1. Foto HP modern 3-8MB, sedangkan batas server 10MB -> ditolak.
 * 2. `fetch` tidak memberi laporan progres, jadi koneksi lambat terlihat seperti
 *    macet tanpa ada feedback.
 *
 * Solusinya: kompres di sisi browser dulu (resize + re-encode JPEG) lalu
 * upload lewat XHR yang bisa memberi progres dan punya timeout.
 */

const AMBANG_KOMPRES = 800 * 1024 // di bawah ini tidak perlu dikompres
const MAKS_DIMENSI = 2000 // piksel sisi terpanjang
const KUALITAS_JPEG = 0.82
const TIMEOUT_UPLOAD = 120000 // 2 menit

export interface HasilKompresi {
  file: File
  dikompresi: boolean
  ukuranAsli: number
  ukuranAkhir: number
}

function ekstensiJpeg(nama: string): string {
  return nama.replace(/\.[^.]+$/, '') + '.jpg'
}

async function decodeGambar(file: File): Promise<ImageBitmap | HTMLImageElement | null> {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file)
    } catch {
      // Fall through ke <img>, mis. untuk HEIC di browser yang tidak mendukung.
    }
  }

  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(null)
    }
    img.src = url
  })
}

/**
 * Perkecil foto yang terlalu besar supaya aman dikirim lewat jaringan seluler.
 * Hasil tetap terbaca untuk KTP/STNK: sisi terpanjang 2000px dengan kualitas
 * JPEG 0.82. Kalau browser tidak bisa decoding (mis. HEIC yang tidak didukung)
 * file asli dikembalikan apa adanya.
 */
export async function kompresFoto(file: File): Promise<HasilKompresi> {
  const tanpaUbah: HasilKompresi = {
    file,
    dikompresi: false,
    ukuranAsli: file.size,
    ukuranAkhir: file.size
  }

  if (!file.type.startsWith('image/')) return tanpaUbah
  if (file.size <= AMBANG_KOMPRES) return tanpaUbah
  if (typeof document === 'undefined') return tanpaUbah

  try {
    const gambar = await decodeGambar(file)
    if (!gambar) return tanpaUbah

    const width = gambar instanceof HTMLImageElement ? gambar.naturalWidth : gambar.width
    const height = gambar instanceof HTMLImageElement ? gambar.naturalHeight : gambar.height
    if (!width || !height) return tanpaUbah

    const skala = Math.min(1, MAKS_DIMENSI / Math.max(width, height))
    const w = Math.max(1, Math.round(width * skala))
    const h = Math.max(1, Math.round(height * skala))

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return tanpaUbah
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(gambar as CanvasImageSource, 0, 0, w, h)
    if ('close' in gambar && typeof gambar.close === 'function') gambar.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', KUALITAS_JPEG)
    )
    if (!blob || blob.size >= file.size) return tanpaUbah

    return {
      file: new File([blob], ekstensiJpeg(file.name || 'foto'), { type: 'image/jpeg' }),
      dikompresi: true,
      ukuranAsli: file.size,
      ukuranAkhir: blob.size
    }
  } catch {
    return tanpaUbah
  }
}

/**
 * Unggah file ke /api/upload dengan laporan progres dan batas waktu.
 * Pakai XHR karena `fetch` tidak punya event upload progress.
 */
export function uploadFile(
  file: File,
  onProgress?: (persen: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api/upload')
    xhr.timeout = TIMEOUT_UPLOAD

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.min(99, Math.round((e.loaded / e.total) * 100)))
      }
    }

    xhr.onload = () => {
      let data: any = null
      try {
        data = JSON.parse(xhr.responseText)
      } catch {
        reject(new Error('Respons server tidak valid'))
        return
      }
      if (xhr.status >= 200 && xhr.status < 300 && data?.success) {
        onProgress?.(100)
        resolve(data.url as string)
      } else {
        reject(new Error(data?.message || 'Gagal mengunggah file'))
      }
    }

    xhr.onerror = () => reject(new Error('Koneksi terputus saat mengunggah file'))
    xhr.ontimeout = () =>
      reject(new Error('Upload melebihi batas waktu. Coba jaringan yang lebih stabil atau foto yang lebih kecil.'))
    xhr.onabort = () => reject(new Error('Upload dibatalkan'))

    const body = new FormData()
    body.append('file', file)
    xhr.send(body)
  })
}

/**
 * Kompres bila perlu lalu unggah. Menampilkan progres sebagai persen.
 */
export async function kirimFoto(
  file: File,
  onProgress?: (persen: number) => void
): Promise<{ url: string; dikompresi: boolean }> {
  const hasil = await kompresFoto(file)
  const url = await uploadFile(hasil.file, onProgress)
  return { url, dikompresi: hasil.dikompresi }
}
