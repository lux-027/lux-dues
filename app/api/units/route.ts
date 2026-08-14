import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

// GET /api/units?buildingId=... - List units for a building
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    if (!buildingId) {
      return NextResponse.json({ error: 'buildingId is required' }, { status: 400 });
    }

    // Block admins can only view their own building
    if (session.role === 'BLOCK_ADMIN' && session.buildingId !== buildingId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const units = await prisma.unit.findMany({
      where: { buildingId },
      include: {
        residents: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: [{ blockName: 'asc' }, { doorNo: 'asc' }],
    });

    return NextResponse.json(units);
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json(
      { error: 'Failed to fetch units' },
      { status: 500 }
    );
  }
}

// POST /api/units - Create a new unit (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { buildingId, blockName, doorNo, floor, ownerName, residentPhone } = body;

    if (!buildingId || !blockName || !doorNo || !floor || !ownerName || !residentPhone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(residentPhone);
    if (!isValidTurkishPhone(normalizedPhone)) {
      return NextResponse.json(
        { error: 'Geçerli bir Türkiye cep telefonu numarası girin' },
        { status: 400 }
      );
    }

    if (session.role === 'BLOCK_ADMIN' && session.buildingId !== buildingId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const unit = await prisma.unit.create({
      data: {
        buildingId,
        blockName,
        doorNo,
        floor,
        ownerName,
        residentPhone: normalizedPhone,
      },
    });

    return NextResponse.json(unit, { status: 201 });
  } catch (error: any) {
    console.error('Error creating unit:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Bu blok ve daire numarası ile kayıtlı bir daire zaten mevcut' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create unit' },
      { status: 500 }
    );
  }
}
