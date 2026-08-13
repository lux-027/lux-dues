import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

// GET /api/stats - Public, read-only platform stats used on the landing page.
// Numbers reflect real data and grow automatically as buildings/units/admins
// are added — no hardcoded/fake figures.
export async function GET() {
  try {
    const [totalBuildings, totalUnits, totalAdmins] = await Promise.all([
      prisma.building.count(),
      prisma.unit.count(),
      prisma.user.count({ where: { role: { in: [UserRole.SUPER_ADMIN, UserRole.BLOCK_ADMIN] } } }),
    ]);

    return NextResponse.json({
      totalBuildings,
      totalUnits,
      totalAdmins,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
