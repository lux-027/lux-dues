import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { PaymentStatus } from '@prisma/client';

// PUT /api/project-payments/[id] - Toggle/update a unit's payment status for a project (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    if (!status || !Object.values(PaymentStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const payment = await prisma.projectPayment.update({
      where: { id },
      data: { status },
      include: {
        unit: {
          select: { blockName: true, doorNo: true, ownerName: true },
        },
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating project payment:', error);
    return NextResponse.json(
      { error: 'Failed to update project payment' },
      { status: 500 }
    );
  }
}
