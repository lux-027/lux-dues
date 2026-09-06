import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

// PUT /api/units/[id] - Update a unit (admin only)
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
    const { blockName, doorNo, floor, ownerName, residentPhone, defaultDueAmount, residentUserId, residentAccountNumber, isVacant } = body;

    const existingUnit = await (prisma as any).unit.findUnique({
      where: { id },
      include: {
        building: { select: { name: true } },
        residents: { select: { id: true, name: true } },
      },
    });

    if (!existingUnit) {
      return NextResponse.json({ error: 'Daire bulunamadı' }, { status: 404 });
    }

    const updateData: any = {
      ...(blockName !== undefined && { blockName }),
      ...(doorNo !== undefined && { doorNo }),
      ...(floor !== undefined && { floor }),
      ...(ownerName !== undefined && { ownerName }),
      ...(isVacant !== undefined && { isVacant: Boolean(isVacant) }),
    };

    if (defaultDueAmount !== undefined) {
      updateData.defaultDueAmount = defaultDueAmount === '' || defaultDueAmount === null ? null : parseFloat(String(defaultDueAmount));
    }

    if (residentPhone !== undefined) {
      if (residentPhone && residentPhone.trim() !== '') {
        const normalizedPhone = normalizePhoneNumber(residentPhone);
        if (!isValidTurkishPhone(normalizedPhone) && !isVacant) {
          return NextResponse.json(
            { error: 'Geçerli bir Türkiye cep telefonu numarası girin' },
            { status: 400 }
          );
        }
        updateData.residentPhone = normalizedPhone;
      } else {
        updateData.residentPhone = '';
      }
    }

    if (isVacant) {
      updateData.isVacant = true;
      if (!residentPhone) {
        updateData.residentPhone = '';
      }
    }

    const unit = await (prisma as any).unit.update({
      where: { id },
      data: updateData,
    });

    if (isVacant && residentUserId === undefined && residentAccountNumber === undefined) {
      await (prisma as any).unit.update({
        where: { id },
        data: { residents: { set: [] } },
      });
    }

    const notifyRemovedResident = async (userId: string) => {
      try {
        await (prisma as any).notification.create({
          data: {
            userId,
            title: 'Daire Görüntüleme Yetkisi Kaldırıldı',
            message: `${existingUnit.building.name} ${existingUnit.blockName} No: ${existingUnit.doorNo} dairesi görüntüleme yetkiniz bina yönetimi tarafından kaldırılmıştır.`,
            type: 'info',
          },
        });
      } catch (notifyErr) {
        console.error('Error notifying removed resident:', notifyErr);
      }
    };

    if (residentUserId !== undefined) {
      if (residentUserId === 'remove') {
        for (const prevRes of existingUnit.residents) {
          await notifyRemovedResident(prevRes.id);
        }
        await (prisma as any).unit.update({
          where: { id },
          data: { residents: { set: [] } },
        });
      } else if (residentUserId) {
        await (prisma as any).unit.update({
          where: { id },
          data: { residents: { connect: { id: residentUserId } } },
        });
      }
    }

    if (residentAccountNumber !== undefined) {
      if (residentAccountNumber === 'remove') {
        for (const prevRes of existingUnit.residents) {
          await notifyRemovedResident(prevRes.id);
        }
        await (prisma as any).unit.update({
          where: { id },
          data: { residents: { set: [] } },
        });
      } else if (residentAccountNumber) {
        const targetNum = Number(residentAccountNumber);
        const targetUser = await (prisma as any).user.findFirst({
          where: {
            OR: [
              { residentAccountNumber: targetNum },
              { accountNumber: targetNum },
              { adminAccountNumber: targetNum },
            ],
          },
        });
        if (!targetUser) {
          return NextResponse.json({ error: 'Bu ID ile eşleşen bir kullanıcı bulunamadı' }, { status: 404 });
        }
        await (prisma as any).unit.update({
          where: { id },
          data: { residents: { connect: { id: targetUser.id } } },
        });
      }
    }

    return NextResponse.json(unit);
  } catch (error) {
    console.error('Error updating unit:', error);
    return NextResponse.json(
      { error: 'Failed to update unit' },
      { status: 500 }
    );
  }
}

// DELETE /api/units/[id] - Delete a unit (admin only)
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
    await prisma.unit.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting unit:', error);
    return NextResponse.json(
      { error: 'Failed to delete unit' },
      { status: 500 }
    );
  }
}
