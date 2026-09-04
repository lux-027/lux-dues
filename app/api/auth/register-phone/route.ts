import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';
import { generateUniqueAccountNumber } from '@/lib/accountNumber';
import { verifyFirebaseIdToken } from '@/lib/verifyFirebaseToken';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, name, password } = body;

    if (!idToken || !name || !password) {
      return NextResponse.json(
        { error: 'Doğrulama kodu, ad ve şifre gereklidir' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    const firebaseUser = await verifyFirebaseIdToken(idToken);

    if (!firebaseUser.phone_number) {
      return NextResponse.json(
        { error: 'Geçerli bir telefon numarası bulunamadı' },
        { status: 400 }
      );
    }

    const phone = firebaseUser.phone_number;
    const email = `${phone.replace(/[^0-9]/g, '')}@phone.luxdues.local`;

    const existingByPhone = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingByPhone) {
      return NextResponse.json(
        { error: 'Bu telefon numarası ile kayıtlı bir kullanıcı zaten mevcut' },
        { status: 409 }
      );
    }

    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingByEmail) {
      return NextResponse.json(
        { error: 'Bu e-posta ile kayıtlı bir kullanıcı zaten mevcut' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        accountNumber: await generateUniqueAccountNumber(),
        name,
        email,
        phone,
        password: hashedPassword,
        emailVerified: true,
        role: UserRole.RESIDENT,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      buildingId: user.buildingId,
    });

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

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Register phone error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
