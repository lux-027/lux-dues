import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const roleType = body.role === 'resident' ? 'resident' : 'admin';

    let user;

    if (roleType === 'admin') {
      user = await prisma.user.findFirst({
        where: {
          role: { in: [UserRole.SUPER_ADMIN, UserRole.BLOCK_ADMIN] },
        },
        include: {
          building: true,
        },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            name: 'Sistem Yöneticisi (Demo)',
            email: 'admin@luxdues.com',
            phone: '+905550000000',
            emailVerified: true,
            role: UserRole.SUPER_ADMIN,
          },
          include: {
            building: true,
          },
        });
      }
    } else {
      user = await prisma.user.findFirst({
        where: {
          role: UserRole.RESIDENT,
        },
        include: {
          building: true,
        },
      });

      if (!user) {
        const firstBuilding = await prisma.building.findFirst();
        const firstUnit = await prisma.unit.findFirst();

        user = await prisma.user.create({
          data: {
            name: 'Demo Site Sakini',
            email: 'sakin@luxdues.com',
            phone: '+905551112233',
            emailVerified: true,
            role: UserRole.RESIDENT,
            buildingId: firstBuilding?.id,
            units: firstUnit ? { connect: [{ id: firstUnit.id }] } : undefined,
          },
          include: {
            building: true,
          },
        });
      }
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      buildingId: user.buildingId,
    });

    const redirectUrl = user.role === UserRole.SUPER_ADMIN || user.role === UserRole.BLOCK_ADMIN
      ? '/admin'
      : '/dashboard';

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
      redirectUrl,
    });

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Demo login error:', error);
    return NextResponse.json(
      { error: 'Demo giriş yapılamadı' },
      { status: 500 }
    );
  }
}
