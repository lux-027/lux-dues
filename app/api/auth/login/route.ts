import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { verifyFirebaseIdToken } from '@/lib/verifyFirebaseToken';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, email, phone, password } = body;

    let user: Awaited<ReturnType<typeof prisma.user.findUnique>> = null;

    if (idToken) {
      // Firebase-based login (Google, Phone, or verified email/password)
      const firebaseUser = await verifyFirebaseIdToken(idToken);

      if (!firebaseUser.email) {
        return NextResponse.json(
          { error: 'E-posta bilgisi bulunamadı' },
          { status: 400 }
        );
      }

      if (!firebaseUser.email_verified) {
        return NextResponse.json(
          { error: 'E-posta adresiniz doğrulanmamış. Lütfen e-postanızdaki bağlantıya tıklayın.' },
          { status: 403 }
        );
      }

      user = await prisma.user.findUnique({
        where: { email: firebaseUser.email },
        include: { building: true },
      });
    } else if (email && password) {
      // Legacy or password-based login by email
      user = await prisma.user.findUnique({
        where: { email },
        include: { building: true },
      });

      if (!user || !user.password || !(await verifyPassword(password, user.password))) {
        return NextResponse.json(
          { error: 'Geçersiz e-posta veya şifre' },
          { status: 401 }
        );
      }
    } else if (phone && password) {
      // Password-based login by phone number
      const normalizedPhone = normalizePhoneNumber(phone);
      if (!isValidTurkishPhone(normalizedPhone)) {
        return NextResponse.json(
          { error: 'Geçerli bir Türkiye telefon numarası girin' },
          { status: 400 }
        );
      }

      user = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
        include: { building: true },
      });

      if (!user || !user.password || !(await verifyPassword(password, user.password))) {
        return NextResponse.json(
          { error: 'Geçersiz telefon numarası veya şifre' },
          { status: 401 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'idToken, e-posta/şifre veya telefon/şifre gereklidir' },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 401 }
      );
    }

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
    });

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
