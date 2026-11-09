import { NextRequest, NextResponse } from 'next/server'
import { getAdminDenganScope } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const auth = await getAdminDenganScope(request)

    if (!auth) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: auth.admin.id,
        email: auth.admin.email,
        nama: auth.admin.nama,
        sumberDanaId: auth.scope.sumberDanaId,
        namaSumberDana: auth.scope.namaSumberDana
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
