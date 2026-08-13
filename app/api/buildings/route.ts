import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BuildingType } from '@prisma/client';

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
    const { name, type, totalBlocks, address } = body;

    // Validation
    if (!name || !type || !totalBlocks || !address) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!Object.values(BuildingType).includes(type)) {
      return NextResponse.json(
        { error: 'Invalid building type' },
        { status: 400 }
      );
    }

    const building = await prisma.building.create({
      data: {
        name,
        type: type as BuildingType,
        totalBlocks: parseInt(totalBlocks),
        address,
      },
    });

    return NextResponse.json(building, { status: 201 });
  } catch (error) {
    console.error('Error creating building:', error);
    return NextResponse.json(
      { error: 'Failed to create building' },
      { status: 500 }
    );
  }
}
