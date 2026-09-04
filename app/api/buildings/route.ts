import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BuildingType } from '@prisma/client';
import { BUILDING_ARCHIVE_IMAGES } from '@/lib/buildingImages';

// GET /api/buildings - List all buildings
export async function GET(request: NextRequest) {
  try {
    const buildings = await prisma.building.findMany({
      include: {
        _count: {
          select: {
            units: true,
            admins: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(buildings);
  } catch (error) {
    console.error('Error fetching buildings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch buildings' },
      { status: 500 }
    );
  }
}

// POST /api/buildings - Create a new building
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, totalBlocks, address, image, blockImages, blocks, unitsPerBlock, defaultDueAmount, blockDues } = body;

    // Validation
    if (!name || !type || !address) {
      return NextResponse.json(
        { error: 'Bina adı, türü ve adres alanları gereklidir' },
        { status: 400 }
      );
    }

    if (!Object.values(BuildingType).includes(type)) {
      return NextResponse.json(
        { error: 'Geçersiz bina türü' },
        { status: 400 }
      );
    }

    const isSite = type === BuildingType.SITE;
    const blocksList: string[] = (isSite && Array.isArray(blocks) && blocks.length > 0)
      ? blocks.map((b: string) => b.trim()).filter(Boolean)
      : Array.from({ length: isSite ? Math.max(1, parseInt(totalBlocks) || 1) : 1 }, (_, i) => String.fromCharCode(65 + i));

    const standardDue = defaultDueAmount ? parseFloat(defaultDueAmount) : null;

    const randomImage = BUILDING_ARCHIVE_IMAGES[Math.floor(Math.random() * BUILDING_ARCHIVE_IMAGES.length)]?.src;

    const building = await prisma.building.create({
      data: {
        name,
        type: type as BuildingType,
        totalBlocks: blocksList.length,
        address,
        image: image || randomImage || null,
        blockImages: blockImages || null,
        defaultDueAmount: standardDue,
      },
    });

    if (unitsPerBlock && parseInt(unitsPerBlock) > 0) {
      const count = parseInt(unitsPerBlock);
      const unitsToCreate = [];
      for (const block of blocksList) {
        const unitDue = (blockDues && blockDues[block])
          ? parseFloat(blockDues[block])
          : standardDue;

        for (let d = 1; d <= count; d++) {
          const floor = Math.max(1, Math.ceil(d / 4)).toString();
          unitsToCreate.push({
            buildingId: building.id,
            blockName: block,
            doorNo: d.toString(),
            floor: floor,
            ownerName: `${block} D:${d}`,
            residentPhone: '',
            defaultDueAmount: unitDue,
          });
        }
      }
      if (unitsToCreate.length > 0) {
        await prisma.unit.createMany({
          data: unitsToCreate,
        });
      }
    }

    return NextResponse.json(building, { status: 201 });
  } catch (error) {
    console.error('Error creating building:', error);
    return NextResponse.json(
      { error: 'Failed to create building' },
      { status: 500 }
    );
  }
}
