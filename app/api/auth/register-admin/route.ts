import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

// GET /api/auth/register-admin - Check whether bootstrap admin registration is
// still available (i.e. no SUPER_ADMIN exists yet). Used by the UI to decide
// whether to show the admin "Kayıt Ol" tab.
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
//
// Security note: public admin self-registration is only allowed when the system
// has no SUPER_ADMIN yet (fresh install). Once a SUPER_ADMIN exists, all further
// admin accounts (SUPER_ADMIN or BLOCK_ADMIN) must be created by an existing
// SUPER_ADMIN via /admin/admins — never through this public endpoint.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, password } = body;

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

    const existingAdminCount = await prisma.user.count({
      where: { role: UserRole.SUPER_ADMIN },
    });

    if (existingAdminCount > 0) {
      return NextResponse.json(
        {
          error:
            'Sistemde zaten bir yönetici hesabı mevcut. Yeni yönetici hesapları sadece mevcut yönetici tarafından "Yöneticiler" sayfasından oluşturulabilir.',
        },
        { status: 403 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta ile kayıtlı bir kullanıcı zaten mevcut' },
        { status: 409 }
      );
    }

    const hashedPassword = await hashPassword(password);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone: normalizedPhone,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
      },
    });

    const token = generateToken({
      userId: admin.id,
      email: admin.email,
      role: admin.role,
      buildingId: admin.buildingId,
      unitId: admin.unitId,
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
