import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { verifyFirebaseIdToken } from '@/lib/verifyFirebaseToken';
import { UserRole } from '@prisma/client';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, name, phone } = body;

    if (!idToken || !name || !phone) {
      return NextResponse.json(
        { error: 'Doğrulama, ad ve telefon numarası gereklidir' },
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

    const firebaseUser = await verifyFirebaseIdToken(idToken);

    if (!firebaseUser.email) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta bulunamadı' },
        { status: 400 }
      );
    }

    if (!firebaseUser.email_verified) {
      return NextResponse.json(
        { error: 'E-posta adresiniz doğrulanmamış. Lütfen e-postanızdaki bağlantıya tıklayın.' },
        { status: 403 }
      );
    }

    const email = firebaseUser.email;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta ile kayıtlı bir kullanıcı zaten mevcut' },
        { status: 409 }
      );
    }

    // Public self-registration always creates a RESIDENT account.
    // Admin accounts (SUPER_ADMIN / BLOCK_ADMIN) can only be created via /admin/admins
    // by an existing SUPER_ADMIN, and unit assignment is handled separately by an admin.
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: normalizedPhone,
        emailVerified: true,
        role: UserRole.RESIDENT,
      },
    });

    // Generate token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      buildingId: user.buildingId,
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
