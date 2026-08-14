import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { generateToken, hashPassword } from '@/lib/auth';
import { verifyFirebaseIdToken } from '@/lib/verifyFirebaseToken';
import { UserRole } from '@prisma/client';

// POST /api/auth/google - Exchange a verified Firebase (Google) ID token for
// our own session cookie. If no account exists yet for the Google email, a
// new RESIDENT account is auto-provisioned (an admin links it to a unit
// later). Admin roles can never be obtained through this endpoint.
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
    }

    let googleUser;
    try {
      googleUser = await verifyFirebaseIdToken(idToken);
    } catch (err) {
      console.error('Invalid Firebase ID token:', err);
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş Google oturumu' }, { status: 401 });
    }

    if (!googleUser.email) {
      return NextResponse.json(
        { error: 'Google hesabınızda bir e-posta bulunamadı' },
        { status: 400 }
      );
    }

    if (!googleUser.email_verified) {
      return NextResponse.json(
        { error: 'Google hesabınızın e-postası doğrulanmamış' },
        { status: 403 }
      );
    }

    const email = googleUser.email;
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // First time signing in with this Google account — auto-provision a
      // RESIDENT account. The random password/phone placeholder are never
      // used/exposed; the account can only be accessed via Google sign-in
      // going forward (an admin can later attach a real phone/unit).
      const randomPassword = await hashPassword(randomUUID());
      user = await prisma.user.create({
        data: {
          name: googleUser.name || email.split('@')[0],
          email,
          phone: `google:${googleUser.uid}`,
          password: randomPassword,
          role: UserRole.RESIDENT,
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      buildingId: user.buildingId,
      unitId: user.unitId,
    });

    const requiresPhone = !user.phone || user.phone.startsWith('google:');

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
      requiresPhone,
      token,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Google auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
