import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { UserRole } from '@prisma/client';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

// PUT /api/admins/[id] - Update an admin's building assignment (SUPER_ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { buildingId, blockName, name, phone } = body;

    const updateData: any = {
      ...(buildingId !== undefined && { buildingId }),
      ...(blockName !== undefined && { blockName }),
      ...(name && { name }),
    };

    if (phone) {
      const normalizedPhone = normalizePhoneNumber(phone);
      if (!isValidTurkishPhone(normalizedPhone)) {
        return NextResponse.json(
          { error: 'Geçerli bir Türkiye cep telefonu numarası girin' },
          { status: 400 }
        );
      }
      updateData.phone = normalizedPhone;
    }

    const admin = await prisma.user.update({
      where: { id, role: UserRole.BLOCK_ADMIN },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        buildingId: true,
        blockName: true,
      },
    });

    return NextResponse.json(admin);
  } catch (error) {
    console.error('Error updating admin:', error);
    return NextResponse.json(
      { error: 'Failed to update admin' },
      { status: 500 }
    );
  }
}

// DELETE /api/admins/[id] - Remove a Block Admin's permissions but keep the user (SUPER_ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent touching the SUPER_ADMIN account through this route
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Bu kullanıcı üzerinde işlem yapılamaz' }, { status: 400 });
    }

    const admin = await prisma.user.update({
      where: { id },
      data: {
        role: UserRole.RESIDENT,
        buildingId: null,
        blockName: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        buildingId: true,
        blockName: true,
      },
    });

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    console.error('Error removing admin permissions:', error);
    return NextResponse.json(
      { error: 'Failed to remove admin permissions' },
      { status: 500 }
    );
  }
}
