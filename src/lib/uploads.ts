import path from 'node:path'

// Only allow known image mime types, mapped to a safe extension.
// (Never trust the client-provided filename/extension directly.)
export const ALLOWED_MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
}

export const EXT_TO_MIME: Record<string, string> = Object.fromEntries(
  Object.entries(ALLOWED_MIME_TO_EXT).map(([mime, ext]) => [ext, mime])
)

// Batas 10MB: foto HP modern bisa 5-8MB, dan nginx (client_max_body_size
// 20m) masih aman di atas angka ini. Sisi klien sudah mengompres foto lebih
// dulu, jadi file yang besar biasanya sudah dikecilkan sebelum dikirim.
export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

// Directory used to persist uploaded photos (KTP/STNK).
// Kept outside of `public/` so Next.js's static file server never scans it
// (avoids crashing on volume filesystem artifacts like `lost+found`).
// In production this should point at a mounted Railway Volume, e.g. /data/uploads.
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads')
