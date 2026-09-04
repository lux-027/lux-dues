import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/buildings/[id] - Get a single building
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const building = await prisma.building.findUnique({
      where: {
        id,
      },
      include: {
        units: {
          include: {
            residents: true,
          },
        },
        admins: true,
        _count: {
          select: {
            units: true,
            admins: true,
            specialProjects: true,
            complaints: true,
          },
        },
      },
    });

    if (!building) {
      return NextResponse.json(
        { error: 'Building not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(building);
  } catch (error) {
    console.error('Error fetching building:', error);
    return NextResponse.json(
      { error: 'Failed to fetch building' },
      { status: 500 }
    );
  }
}

// PUT /api/buildings/[id] - Update a building
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, type, totalBlocks, address, image, blockImages } = body;

    const building = await prisma.building.update({
      where: {
        id,
      },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(totalBlocks && { totalBlocks: parseInt(totalBlocks) }),
        ...(address && { address }),
        ...(image !== undefined && { image: image || null }),
        ...(blockImages !== undefined && { blockImages: blockImages || null }),
      },
    });

    return NextResponse.json(building);
  } catch (error) {
    console.error('Error updating building:', error);
    return NextResponse.json(
      { error: 'Failed to update building' },
      { status: 500 }
    );
  }
}

// DELETE /api/buildings/[id] - Delete a building
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.building.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting building:', error);
    return NextResponse.json(
      { error: 'Failed to delete building' },
      { status: 500 }
    );
  }
}
