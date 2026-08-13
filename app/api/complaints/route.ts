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
            name: true,
            phone: true,
          },
        },
        building: {
          select: {
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

// POST /api/complaints - Create a new complaint (resident)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { buildingId, subject, description } = body;

    if (!buildingId || !subject || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('Error creating complaint:', error);
    return NextResponse.json(
      { error: 'Failed to create complaint' },
      { status: 500 }
    );
  }
}
