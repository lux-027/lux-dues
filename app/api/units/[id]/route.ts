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
    const { blockName, doorNo, floor, ownerName, residentPhone, defaultDueAmount, residentUserId, residentAccountNumber } = body;

    const updateData: any = {
      ...(blockName !== undefined && { blockName }),
      ...(doorNo !== undefined && { doorNo }),
      ...(floor !== undefined && { floor }),
      ...(ownerName !== undefined && { ownerName }),
    };

    if (defaultDueAmount !== undefined) {
      updateData.defaultDueAmount = defaultDueAmount === '' || defaultDueAmount === null ? null : parseFloat(String(defaultDueAmount));
    }

    if (residentPhone !== undefined) {
      if (residentPhone) {
        const normalizedPhone = normalizePhoneNumber(residentPhone);
        if (!isValidTurkishPhone(normalizedPhone)) {
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

    const unit = await prisma.unit.update({
      where: { id },
      data: updateData,
    });

    if (residentUserId !== undefined) {
      if (residentUserId === 'remove') {
        await prisma.unit.update({
          where: { id },
          data: { residents: { set: [] } },
        });
      } else if (residentUserId) {
        await prisma.unit.update({
          where: { id },
          data: { residents: { connect: { id: residentUserId } } },
        });
      }
    }

    if (residentAccountNumber !== undefined) {
      if (residentAccountNumber === 'remove') {
        await prisma.unit.update({
          where: { id },
          data: { residents: { set: [] } },
        });
      } else if (residentAccountNumber) {
        const targetUser = await prisma.user.findUnique({
          where: { accountNumber: Number(residentAccountNumber) },
        });
        if (!targetUser) {
          return NextResponse.json({ error: 'Bu ID ile eşleşen bir kullanıcı bulunamadı' }, { status: 404 });
        }
        await prisma.unit.update({
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
