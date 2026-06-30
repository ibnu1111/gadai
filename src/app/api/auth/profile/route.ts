import { NextRequest, NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const admin = getAdminFromRequest(request)

    if (!admin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: admin.id,
        email: admin.email,
        nama: admin.nama
      }
    })
  } catch (error) {
    console.error('Error getting profile:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to get profile' },
      { status: 500 }
    )
  }
}
