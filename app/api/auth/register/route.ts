import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

    // Validation
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!isValidTurkishPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Geçerli bir Türkiye cep telefonu numarası girin' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Public self-registration always creates a RESIDENT account.
    // Admin accounts (SUPER_ADMIN / BLOCK_ADMIN) can only be created via /admin/admins
    // by an existing SUPER_ADMIN, and unit assignment is handled separately by an admin.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: normalizedPhone,
        password: hashedPassword,
        role: UserRole.RESIDENT,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      buildingId: user.buildingId,
      unitId: user.unitId,
    });

    // Create response
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        buildingId: user.buildingId,
        unitId: user.unitId,
      },
      token,
    }, { status: 201 });

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
