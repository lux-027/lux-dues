import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getAdminBlockScope } from '@/lib/buildingAccess';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const buildingId = searchParams.get('buildingId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');
    const block = searchParams.get('block');

    if (!buildingId || !year || !month) {
      return NextResponse.json(
        { error: 'Building ID, year, and month are required' },
        { status: 400 }
      );
    }

    const building = await prisma.building.findUnique({
      where: { id: buildingId },
    });

    if (!building) {
      return NextResponse.json({ error: 'Building not found' }, { status: 404 });
    }

    // Check if user has access to this building (owner or assigned admin)
    const isOwner = building.ownerId === session.id;
    if (!isOwner) {
      const assignment = await prisma.buildingAdminAssignment.findFirst({
        where: { userId: session.id, buildingId },
        select: { id: true },
      });
      if (!assignment && session.buildingId !== buildingId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }

      // Block-scoped admins can only report on their assigned blocks
      var scope: string[] | null = await getAdminBlockScope(session, buildingId);
      if (scope && block && !scope.includes(decodeURIComponent(block))) {
        return NextResponse.json({ error: 'Bu blok size atanmış değil' }, { status: 403 });
      }
    } else {
      var scope: string[] | null = null;
    }

    const dues = await prisma.dues.findMany({
      where: {
        unit: {
          buildingId,
          ...(block ? { blockName: decodeURIComponent(block) } : scope ? { blockName: { in: scope } } : {}),
        },
        year: parseInt(year),
        month: parseInt(month),
      },
      include: {
        unit: {
          select: {
            buildingId: true,
            blockName: true,
            doorNo: true,
            ownerName: true,
          },
        },
      },
      orderBy: {
        unit: {
          blockName: 'asc',
        },
      },
    });

    const reportData = dues.map((due) => ({
      buildingId,
      buildingName: building.name,
      blockName: due.unit.blockName,
      doorNo: due.unit.doorNo,
      ownerName: due.unit.ownerName,
      amount: Number(due.amount),
      month: due.month,
      year: due.year,
      status: due.status,
      dueDate: due.dueDate.toISOString(),
      paidDate: due.updatedAt.toISOString(),
    }));

    return NextResponse.json(reportData);
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
