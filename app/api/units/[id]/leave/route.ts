import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// POST /api/units/[id]/leave - Resident leaves viewing unit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: unitId } = await params;

    // Find the unit with building info and current residents
    const unit = await (prisma as any).unit.findUnique({
      where: { id: unitId },
      include: {
        building: {
          include: {
            admins: {
              select: { id: true, name: true, role: true },
            },
          },
        },
        residents: {
          select: { id: true, name: true, phone: true },
        },
      },
    });

    if (!unit) {
      return NextResponse.json({ error: 'Daire bulunamadı' }, { status: 404 });
    }

    // Verify if current user is indeed linked as a resident to this unit
    const isResident = unit.residents.some((r: any) => r.id === session.id);
    if (!isResident) {
      return NextResponse.json({ error: 'Bu daireye bağlı değilsiniz' }, { status: 403 });
    }

    // Disconnect user from unit
    await (prisma as any).unit.update({
      where: { id: unitId },
      data: {
        residents: {
          disconnect: { id: session.id },
        },
      },
    });

    // Notify all building admins and block admins
    const buildingAdmins = unit.building.admins || [];
    const notificationMessage = `${unit.building.name} ${unit.blockName} No: ${unit.doorNo} dairesi sakin (${session.name}) tarafından LuxDues aidat takip görüntülemesinden ayrılmıştır.`;

    for (const admin of buildingAdmins) {
      try {
        await (prisma as any).notification.create({
          data: {
            userId: admin.id,
            title: 'Daireden Ayrılma Bildirimi',
            message: notificationMessage,
            type: 'warning',
          },
        });
      } catch (notifyErr) {
        console.error('Error creating notification for admin:', notifyErr);
      }
    }

    return NextResponse.json({ success: true, message: 'Daireden başarıyla ayrıldınız.' });
  } catch (error) {
    console.error('Error leaving unit:', error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu' }, { status: 500 });
  }
}
