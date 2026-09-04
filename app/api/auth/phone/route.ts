import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { verifyFirebaseIdToken } from '@/lib/verifyFirebaseToken';
import { generateUniqueAccountNumber } from '@/lib/accountNumber';
import { UserRole } from '@prisma/client';

// POST /api/auth/phone - Exchange a verified Firebase phone-auth ID token for
// our own session cookie. If no account exists yet for the phone number, a
// new RESIDENT account is auto-provisioned (an admin links it to a unit
// later). Admin roles can never be obtained through this endpoint.
export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json({ error: 'idToken is required' }, { status: 400 });
    }

    let firebaseUser;
    try {
      firebaseUser = await verifyFirebaseIdToken(idToken);
    } catch (err) {
      console.error('Invalid Firebase ID token:', err);
      return NextResponse.json({ error: 'Geçersiz veya süresi dolmuş oturum' }, { status: 401 });
    }

    if (!firebaseUser.phone_number) {
      return NextResponse.json(
        { error: 'Bu oturum bir telefon doğrulaması içermiyor' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({ where: { phone: firebaseUser.phone_number } });

    if (!user) {
      // First time signing in with this phone number — auto-provision a
      // RESIDENT account. The account can only be accessed via phone sign-in
      // going forward.
      user = await prisma.user.create({
        data: {
          accountNumber: await generateUniqueAccountNumber(),
          name: firebaseUser.phone_number,
          email: `${firebaseUser.phone_number.replace(/[^0-9]/g, '')}@phone.luxdues.local`,
          phone: firebaseUser.phone_number,
          emailVerified: true,
          role: UserRole.RESIDENT,
        },
      });
    }

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
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Phone auth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
