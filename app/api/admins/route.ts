import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { hashPassword } from '@/lib/auth';
import { UserRole } from '@prisma/client';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

// GET /api/admins - List all admins (SUPER_ADMIN, BLOCK_ADMIN)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const admins = await prisma.user.findMany({
      where: {
        role: { in: [UserRole.SUPER_ADMIN, UserRole.BLOCK_ADMIN] },
      },
      select: {
        id: true,
        accountNumber: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        buildingId: true,
        blockName: true,
        building: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error('Error fetching admins:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admins' },
      { status: 500 }
    );
  }
}

// POST /api/admins - Create a new Block Admin and assign to a building (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, phone, password, buildingId, blockName } = body;

    if (!name || !email || !phone || !password || !buildingId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta ile kayıtlı bir kullanıcı zaten mevcut' },
        { status: 409 }
      );
    }

    const building = await prisma.building.findUnique({ where: { id: buildingId } });
    if (!building) {
      return NextResponse.json({ error: 'Bina bulunamadı' }, { status: 404 });
    }

    const hashedPassword = await hashPassword(password);

    const admin = await prisma.user.create({
      data: {
        name,
        email,
        phone: normalizedPhone,
        password: hashedPassword,
        emailVerified: true,
        role: UserRole.BLOCK_ADMIN,
        buildingId,
        blockName: blockName || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        buildingId: true,
        blockName: true,
        createdAt: true,
      },
    });

    return NextResponse.json(admin, { status: 201 });
  } catch (error) {
    console.error('Error creating admin:', error);
    return NextResponse.json(
      { error: 'Failed to create admin' },
      { status: 500 }
    );
  }
}
