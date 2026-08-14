import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';
import { verifyFirebaseIdToken } from '@/lib/verifyFirebaseToken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken, email, password } = body;

    let resolvedEmail: string | undefined;

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

      resolvedEmail = firebaseUser.email;
    } else if (email && password) {
      // Legacy password-based login (for existing users before Firebase migration)
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user || !user.password) {
        return NextResponse.json(
          { error: 'Geçersiz e-posta veya şifre' },
          { status: 401 }
        );
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Geçersiz e-posta veya şifre' },
          { status: 401 }
        );
      }

      resolvedEmail = email;
    } else {
      return NextResponse.json(
        { error: 'idToken veya e-posta/şifre gereklidir' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: resolvedEmail },
      include: {
        building: true,
        unit: true,
      },
    });

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
