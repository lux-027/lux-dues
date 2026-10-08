import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { verifyFirebaseIdToken } from '@/lib/verifyFirebaseToken';
import { generateUniqueAccountNumber } from '@/lib/accountNumber';
import { UserRole } from '@prisma/client';
import { rateLimit } from '@/lib/rateLimit';

// POST /api/auth/google - Exchange a verified Firebase (Google) ID token for
// our own session cookie. If no account exists yet for the Google email, a
// new account is auto-provisioned with the specified role (admin or resident).
export async function POST(request: NextRequest) {
  try {
    if (rateLimit(request, 'google-auth', 10, 60_000)) {
      return NextResponse.json(
        { error: 'Çok fazla deneme. Lütfen bir dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }
    const { idToken, role } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
    }

    if (!role || (role !== 'admin' && role !== 'resident')) {
      return NextResponse.json({ error: 'role must be admin or resident' }, { status: 400 });
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
      // First time signing in with this Google account — auto-provision an
      // account with the selected role (admin or resident). The phone placeholder
      // is never used/exposed; the account can only be accessed via Google sign-in going forward.
      const userRole = role === 'admin' ? UserRole.SUPER_ADMIN : UserRole.RESIDENT;
      user = await prisma.user.create({
        data: {
          accountNumber: await generateUniqueAccountNumber(),
          name: googleUser.name || email.split('@')[0],
          email,
          phone: `google:${googleUser.uid}`,
          emailVerified: true,
          role: userRole,
        },
      });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      buildingId: user.buildingId,
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
