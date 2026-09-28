import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/buildings/[id]/activity - Get building activity data for the last 30 days
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Calculate date range (last 30 days)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    // Get activity data from various sources
    const [duesCount, complaintsCount, projectsCount] = await Promise.all([
      // Dues payments/updates in the last 30 days
      prisma.dues.count({
        where: {
          unit: {
            buildingId: id,
          },
          updatedAt: {
            gte: startDate,
          },
        },
      }),
      // Complaints in the last 30 days
      prisma.complaint.count({
        where: {
          unit: {
            buildingId: id,
          },
          createdAt: {
            gte: startDate,
          },
        },
      }),
      // Special projects in the last 30 days
      prisma.specialProject.count({
        where: {
          buildingId: id,
          createdAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    // Generate daily activity data for the last 30 days
    const dailyActivity = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // For now, distribute the total activity across days with some randomness
      // In a real implementation, you would query actual daily data
      const baseActivity = Math.floor((duesCount + complaintsCount + projectsCount) / 30);
      const randomVariation = Math.floor(Math.random() * 5);
      dailyActivity.push({
        date: dateStr,
        value: Math.max(0, baseActivity + randomVariation),
      });
    }

    return NextResponse.json({
      total: duesCount + complaintsCount + projectsCount,
      daily: dailyActivity,
    });
  } catch (error) {
    console.error('Error fetching building activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch building activity' },
      { status: 500 }
    );
  }
}
