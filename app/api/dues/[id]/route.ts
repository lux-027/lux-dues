import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// PUT /api/dues/[id] - Update due status (admin only)
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

    const dues = await prisma.dues.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(dues);
  } catch (error) {
    console.error('Error updating due:', error);
    return NextResponse.json(
      { error: 'Failed to update due' },
      { status: 500 }
    );
  }
}

// DELETE /api/dues/[id] - Delete a due (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'BLOCK_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.dues.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting due:', error);
    return NextResponse.json(
      { error: 'Failed to delete due' },
      { status: 500 }
    );
  }
}
