import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ProjectStatus, PaymentStatus } from '@prisma/client';

// GET /api/projects - List special projects
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const buildingId = searchParams.get('buildingId');

    let where: any = {};

    const residentUnitIds = session.role === 'RESIDENT' ? session.units.map((u) => u.id) : [];
    const residentBuildingIds = Array.from(new Set(session.units.map((u) => u.buildingId)));

    if (session.role === 'RESIDENT') {
      if (residentUnitIds.length === 0) {
        return NextResponse.json([]);
      }
      where.buildingId = buildingId && residentBuildingIds.includes(buildingId)
        ? buildingId
        : { in: residentBuildingIds };
    } else if (buildingId) {
      where.buildingId = buildingId;
    } else if (session.role === 'BLOCK_ADMIN' && session.buildingId) {
      where.buildingId = session.buildingId;
    }

    const projects = await prisma.specialProject.findMany({
      where,
      include: {
        payments: session.role === 'RESIDENT'
          ? { where: { unitId: { in: residentUnitIds } } }
          : true,
        _count: {
          select: { payments: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new special project and distribute cost across units (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { buildingId, title, totalAmount, description, blockNames } = body;

    if (!buildingId || !title || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Build the unit filter: if specific blocks are selected, include only those.
    const unitWhere: any = { buildingId };
    if (Array.isArray(blockNames) && blockNames.length > 0) {
      unitWhere.blockName = { in: blockNames };
    }

    // Get the relevant units for this building to calculate fair distribution
    const units = await prisma.unit.findMany({
      where: unitWhere,
      select: { id: true },
    });

    if (units.length === 0) {
      return NextResponse.json(
        { error: 'Seçili bloklarda daire bulunamadı' },
        { status: 400 }
      );
    }

    const total = parseFloat(totalAmount);
    const perUnitAmount = Math.round((total / units.length) * 100) / 100;

    // Create the project and payment records in a transaction
    const project = await prisma.$transaction(async (tx) => {
      const newProject = await tx.specialProject.create({
        data: {
          buildingId,
          title,
          totalAmount: total,
          perUnitAmount,
          description: description || null,
          status: ProjectStatus.ACTIVE,
        },
      });

      await tx.projectPayment.createMany({
        data: units.map((unit) => ({
          projectId: newProject.id,
          unitId: unit.id,
          status: PaymentStatus.UNPAID,
        })),
      });

      return newProject;
    });

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
