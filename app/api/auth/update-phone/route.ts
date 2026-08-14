import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { generateToken } from '@/lib/auth';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

// PATCH /api/auth/update-phone - Update the authenticated user's phone number.
// Used after Google sign-in when the account was created without a real phone.
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone } = await request.json();

    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Telefon numarası gereklidir' },
        { status: 400 }
      );
    }

    const normalized = normalizePhoneNumber(phone);

    if (!isValidTurkishPhone(normalized)) {
      return NextResponse.json(
        { error: 'Geçerli bir Türkiye cep telefonu numarası girin' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        phone: normalized,
        NOT: { id: session.id },
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu telefon numarası başka bir hesaba kayıtlı' },
        { status: 409 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: { phone: normalized },
    });

    const token = generateToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role,
      buildingId: updatedUser.buildingId,
      unitId: updatedUser.unitId,
    });

    const response = NextResponse.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        buildingId: updatedUser.buildingId,
        unitId: updatedUser.unitId,
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
    console.error('Update phone error:', error);
    return NextResponse.json(
      { error: 'Telefon numarası güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
