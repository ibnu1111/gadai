import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { EXT_TO_MIME, UPLOAD_DIR } from '@/lib/uploads'

// GET /api/uploads/[filename] - Serve a previously uploaded photo (KTP/STNK)
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // Only allow a bare filename (uuid + known extension) - never trust path
  // segments from the URL, to prevent path traversal outside UPLOAD_DIR.
  const safeFilename = path.basename(filename)
  if (safeFilename !== filename) {
    return NextResponse.json({ success: false, message: 'Nama file tidak valid' }, { status: 400 })
  }

  const extension = safeFilename.split('.').pop()?.toLowerCase()
  const mimeType = extension ? EXT_TO_MIME[extension] : undefined
  if (!mimeType) {
    return NextResponse.json({ success: false, message: 'Format file tidak didukung' }, { status: 400 })
  }

  try {
    const filePath = path.join(UPLOAD_DIR, safeFilename)
    const fileStat = await stat(filePath)
    if (!fileStat.isFile()) {
      return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 404 })
    }

    const buffer = await readFile(filePath)
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(fileStat.size),
        'Cache-Control': 'private, max-age=31536000, immutable'
      }
    })
  } catch {
    return NextResponse.json({ success: false, message: 'File tidak ditemukan' }, { status: 404 })
  }
}
