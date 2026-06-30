import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { nama, email, password } = await request.json()

    if (!nama || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Check if any admin exists
    const adminCount = await prisma.admin.count()
    if (adminCount > 0) {
      return NextResponse.json(
        { success: false, message: 'Registration is only allowed when no admin exists' },
        { status: 403 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const admin = await prisma.admin.create({
      data: {
        nama,
        email,
        password: hashedPassword
      }
    })

    const token = signToken({
      id: admin.id,
      email: admin.email,
      nama: admin.nama
    })

    return NextResponse.json({
      success: true,
      message: 'Admin registered successfully',
      data: {
        token,
        admin: {
          id: admin.id,
          nama: admin.nama,
          email: admin.email
        }
      }
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error during registration:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 500 }
    )
  }
}
