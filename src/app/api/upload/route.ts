import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { ALLOWED_MIME_TO_EXT, MAX_FILE_SIZE, UPLOAD_DIR } from '@/lib/uploads'

// POST /api/upload - Upload a photo (KTP, STNK, etc.) and get back a public link
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 400 })
    }

    const mimeType = file.type
    const extension = ALLOWED_MIME_TO_EXT[mimeType]

    if (!extension) {
      return NextResponse.json({
        success: false,
        message: 'Format file tidak didukung. Gunakan JPG, PNG, WEBP, atau HEIC'
      }, { status: 400 })
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        success: false,
        message: 'Ukuran file maksimal 5MB'
      }, { status: 400 })
    }

    await mkdir(UPLOAD_DIR, { recursive: true })

    const filename = `${randomUUID()}.${extension}`
    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(path.join(UPLOAD_DIR, filename), buffer)

    const origin = request.headers.get('origin') || `${request.nextUrl.protocol}//${request.nextUrl.host}`
    const url = `${origin}/api/uploads/${filename}`

    return NextResponse.json({ success: true, url }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ success: false, message: 'Gagal mengunggah file' }, { status: 500 })
  }
}
