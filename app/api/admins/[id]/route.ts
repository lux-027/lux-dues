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
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { buildingId, blockName, name, phone } = body;

    // Managers can only reassign admins inside buildings they own
    if (buildingId !== undefined && buildingId !== null) {
      const building = await prisma.building.findUnique({ where: { id: buildingId }, select: { ownerId: true } });
      if (!building || building.ownerId !== session.id) {
        return NextResponse.json({ error: 'Yalnızca kendi binalarınıza atama yapabilirsiniz' }, { status: 403 });
      }
    }

    const targetUser = await prisma.user.findUnique({ where: { id }, select: { buildingId: true } });
    if (targetUser?.buildingId) {
      const currentBuilding = await prisma.building.findUnique({ where: { id: targetUser.buildingId }, select: { ownerId: true } });
      if (currentBuilding && currentBuilding.ownerId !== session.id) {
        return NextResponse.json({ error: 'Bu yönetici üzerinde işlem yapamazsınız' }, { status: 403 });
      }
    }

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

    // Keep the multi-building assignment table in sync with the reassignment
    if (buildingId !== undefined) {
      if (targetUser?.buildingId && targetUser.buildingId !== buildingId) {
        await prisma.buildingAdminAssignment.deleteMany({
          where: { userId: id, buildingId: targetUser.buildingId },
        });
      }
      if (buildingId) {
        const existing = await prisma.buildingAdminAssignment.findFirst({
          where: { userId: id, buildingId, blockName: blockName ?? null },
        });
        if (!existing) {
          await prisma.buildingAdminAssignment.create({
            data: { userId: id, buildingId, blockName: blockName ?? null },
          });
        }
      }
    } else if (blockName !== undefined && targetUser?.buildingId) {
      const existing = await prisma.buildingAdminAssignment.findFirst({
        where: { userId: id, buildingId: targetUser.buildingId, blockName: blockName ?? null },
      });
      if (!existing) {
        await prisma.buildingAdminAssignment.create({
          data: { userId: id, buildingId: targetUser.buildingId, blockName: blockName ?? null },
        });
      }
    }

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
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Prevent touching the SUPER_ADMIN account through this route
    const target = await prisma.user.findUnique({ where: { id } });
    if (!target || target.role === UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Bu kullanıcı üzerinde işlem yapılamaz' }, { status: 400 });
    }

    // Managers can only remove admins from buildings they own
    if (target.buildingId) {
      const building = await prisma.building.findUnique({ where: { id: target.buildingId }, select: { ownerId: true } });
      if (!building || building.ownerId !== session.id) {
        return NextResponse.json({ error: 'Bu yönetici üzerinde işlem yapamazsınız' }, { status: 403 });
      }
    }

    // Remove the assignment in this building; the user keeps any other
    // assignments they may hold in other managers' buildings.
    if (target.buildingId) {
      await prisma.buildingAdminAssignment.deleteMany({
        where: { userId: id, buildingId: target.buildingId },
      });
    }

    const remainingAssignments = await prisma.buildingAdminAssignment.count({
      where: { userId: id },
    });

    const admin = await prisma.user.update({
      where: { id },
      data: {
        role: remainingAssignments > 0 ? UserRole.BLOCK_ADMIN : UserRole.RESIDENT,
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
