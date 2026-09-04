import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { verifyFirebaseIdToken } from '@/lib/verifyFirebaseToken';
import { UserRole } from '@prisma/client';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';
import { generateUniqueAccountNumber } from '@/lib/accountNumber';

// GET /api/auth/register-admin - Check whether bootstrap admin registration is
// still available (i.e. no SUPER_ADMIN exists yet).
export async function GET() {
  try {
    const existingAdminCount = await prisma.user.count({
      where: { role: UserRole.SUPER_ADMIN },
    });

    return NextResponse.json({ available: existingAdminCount === 0 });
  } catch (error) {
    console.error('Error checking admin bootstrap availability:', error);
    return NextResponse.json({ available: false }, { status: 500 });
  }
}

// POST /api/auth/register-admin - Bootstrap registration for the very first admin.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, name, phone } = body;

    if (!idToken || !name || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const normalizedPhone = normalizePhoneNumber(phone);
    if (!isValidTurkishPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Geçerli bir Türkiye cep telefonu numarası girin' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email: firebaseUser.email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta ile kayıtlı bir kullanıcı zaten mevcut' },
        { status: 409 }
      );
    }

    const admin = await prisma.user.create({
      data: {
        accountNumber: await generateUniqueAccountNumber(),
        name,
        email: firebaseUser.email,
        phone: normalizedPhone,
        emailVerified: true,
        role: UserRole.SUPER_ADMIN,
      },
    });

    const token = generateToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role,
      buildingId: admin.buildingId,
    });

    const response = NextResponse.json(
      {
        user: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          phone: admin.phone,
          role: admin.role,
        },
        token,
      },
      { status: 201 }
    );

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Admin bootstrap register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
