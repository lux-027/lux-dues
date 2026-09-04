import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ComplaintStatus } from '@prisma/client';

// GET /api/complaints - List complaints
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    let where: any = {};

    if (session.role === 'RESIDENT') {
      where.userId = session.id;
    } else if (buildingId) {
      where.buildingId = buildingId;
    } else if (session.role === 'BLOCK_ADMIN' && session.buildingId) {
      where.buildingId = session.buildingId;
    }

    const complaints = await prisma.complaint.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            units: {
              select: {
                blockName: true,
                doorNo: true,
                floor: true,
              },
            },
          },
        },
        building: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Error fetching complaints:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

// POST /api/complaints - Create a new complaint / comment (resident)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    let { buildingId, subject, description } = body;

    // If resident didn't send buildingId, use their assigned buildingId
    if (!buildingId && session.buildingId) {
      buildingId = session.buildingId;
    }

    if (!buildingId || !subject || !description) {
      return NextResponse.json(
        { error: 'Bina, konu ve açıklama alanları zorunludur' },
        { status: 400 }
      );
    }

    const complaint = await prisma.complaint.create({
      data: {
        buildingId,
        userId: session.id,
        subject,
        description,
        status: ComplaintStatus.PENDING,
      },
      include: {
        user: {
          select: {
            name: true,
            units: {
              select: {
                blockName: true,
                doorNo: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { error: 'Talep oluşturulurken bir hata oluştu' },
      { status: 500 }
    );
  }
}
