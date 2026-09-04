import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { PaymentStatus } from '@prisma/client';

// GET /api/dues - List dues (filtered by unitId for residents, or buildingId for admins)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const unitId = searchParams.get('unitId');
    const buildingId = searchParams.get('buildingId');
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    let where: any = {};

    if (session.role === 'RESIDENT') {
      // Residents can only see dues for units they're linked to
      const residentUnitIds = session.units.map((u) => u.id);
      if (residentUnitIds.length === 0) {
        return NextResponse.json([]);
      }
      where.unitId = unitId && residentUnitIds.includes(unitId) ? unitId : { in: residentUnitIds };
    } else {
      // Admins can filter by unitId or buildingId
      if (unitId) {
        where.unitId = unitId;
      } else if (buildingId) {
        where.unit = { buildingId };
      }
    }

    if (year) {
      where.year = parseInt(year);
    }
    if (month) {
      where.month = parseInt(month);
    }

    const dues = await prisma.dues.findMany({
      where,
      include: {
        unit: {
          select: {
            id: true,
            blockName: true,
            doorNo: true,
            floor: true,
            ownerName: true,
            residentPhone: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { unit: { blockName: 'asc' } }, { unit: { doorNo: 'asc' } }],
    });

    return NextResponse.json(dues);
  } catch (error) {
    console.error('Error fetching dues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dues' },
      { status: 500 }
    );
  }
}

// POST /api/dues - Create a new due or bulk dues (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    // Bulk creation support (e.g. assign monthly dues to all units or a specific block)
    if (body.bulk && body.buildingId) {
      const { buildingId, blockName, amount, month, year, dueDate } = body;

      if (!amount || !month || !year || !dueDate) {
        return NextResponse.json(
          { error: 'Tutar, ay, yıl ve son ödeme tarihi zorunludur' },
          { status: 400 }
        );
      }

      const whereUnit: any = { buildingId };
      if (blockName && blockName !== 'ALL') {
        whereUnit.blockName = blockName;
      }

      const units = await prisma.unit.findMany({
        where: whereUnit,
        select: { id: true },
      });

      if (units.length === 0) {
        return NextResponse.json(
          { error: 'Bu filtreye uygun daire bulunamadı' },
          { status: 400 }
        );
      }

      const dueAmount = parseFloat(amount);
      const dueMonth = parseInt(month);
      const dueYear = parseInt(year);
      const dueD = new Date(dueDate);

      const created = [];
      for (const u of units) {
        const item = await prisma.dues.upsert({
          where: {
            unitId_month_year: {
              unitId: u.id,
              month: dueMonth,
              year: dueYear,
            },
          },
          update: {
            amount: dueAmount,
            dueDate: dueD,
          },
          create: {
            unitId: u.id,
            amount: dueAmount,
            month: dueMonth,
            year: dueYear,
            dueDate: dueD,
            status: PaymentStatus.UNPAID,
          },
        });
        created.push(item);
      }

      return NextResponse.json({ count: created.length, dues: created }, { status: 201 });
    }

    // Single due creation
    const { unitId, amount, month, year, dueDate } = body;

    if (!unitId || !amount || !month || !year || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dues = await prisma.dues.upsert({
      where: {
        unitId_month_year: {
          unitId,
          month: parseInt(month),
          year: parseInt(year),
        },
      },
      update: {
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
      },
      create: {
        unitId,
        amount: parseFloat(amount),
        month: parseInt(month),
        year: parseInt(year),
        dueDate: new Date(dueDate),
        status: PaymentStatus.UNPAID,
      },
    });

    return NextResponse.json(dues, { status: 201 });
  } catch (error) {
    console.error('Error creating due:', error);
    return NextResponse.json(
      { error: 'Failed to create due' },
      { status: 500 }
    );
  }
}
