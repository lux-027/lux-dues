import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { generateUniqueAccountNumber } from '@/lib/accountNumber';

// GET /api/auth/portals - Get user's available portals and distinct IDs
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let user = await (prisma as any).user.findUnique({
      where: { id: session.id },
      include: {
        building: { select: { name: true } },
        units: { select: { id: true, blockName: true, doorNo: true, building: { select: { name: true } } } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    let updated = false;
    const updateData: any = {};

    // Ensure distinct adminAccountNumber if user has admin role
    const hasAdminRole = user.role === 'SUPER_ADMIN' || user.role === 'BLOCK_ADMIN' || Boolean(user.adminAccountNumber);
    if (hasAdminRole && !user.adminAccountNumber) {
      updateData.adminAccountNumber = await generateUniqueAccountNumber();
      updated = true;
    }

    // Ensure distinct residentAccountNumber if user has resident role or units
    const hasResidentRole = user.role === 'RESIDENT' || user.units.length > 0 || Boolean(user.residentAccountNumber);
    if (hasResidentRole && !user.residentAccountNumber) {
      updateData.residentAccountNumber = await generateUniqueAccountNumber();
      updated = true;
    }

    if (updated) {
      user = await (prisma as any).user.update({
        where: { id: user.id },
        data: updateData,
        include: {
          building: { select: { name: true } },
          units: { select: { id: true, blockName: true, doorNo: true, building: { select: { name: true } } } },
        },
      });
    }

    return NextResponse.json({
      email: user.email,
      name: user.name,
      role: user.role,
      hasAdminRole: Boolean(user.adminAccountNumber || user.role === 'SUPER_ADMIN' || user.role === 'BLOCK_ADMIN'),
      hasResidentRole: Boolean(user.residentAccountNumber || user.role === 'RESIDENT' || user.units.length > 0),
      adminAccountNumber: user.adminAccountNumber || user.accountNumber,
      residentAccountNumber: user.residentAccountNumber || user.accountNumber,
      units: user.units,
      buildingName: user.building?.name || null,
      accountNumber: user.accountNumber,
    });
  } catch (error) {
    console.error('Error fetching portals:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

