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

    let where: any = {};

    if (session.role === 'RESIDENT') {
      // Residents can only see their own unit's dues
      if (!session.unitId) {
        return NextResponse.json([]);
      }
      where.unitId = session.unitId;
    } else {
      // Admins can filter by unitId or buildingId
      if (unitId) {
        where.unitId = unitId;
      } else if (buildingId) {
        where.unit = { buildingId };
      }
    }

    const dues = await prisma.dues.findMany({
      where,
      include: {
        unit: {
          select: {
            blockName: true,
            doorNo: true,
            ownerName: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
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

// POST /api/dues - Create a new due (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { unitId, amount, month, year, dueDate } = body;

    if (!unitId || !amount || !month || !year || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const dues = await prisma.dues.create({
      data: {
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
