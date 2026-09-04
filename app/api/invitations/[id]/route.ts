import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { InvitationStatus, UserRole } from '@prisma/client';

// PATCH /api/invitations/[id] - Accept or reject an invitation (or cancel by sender)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body; // 'ACCEPT' | 'REJECT' | 'CANCEL'

    const invitation = await prisma.adminInvitation.findUnique({
      where: { id },
      include: {
        receiver: true,
        building: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Davet bulunamadı' }, { status: 404 });
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      return NextResponse.json({ error: 'Bu davet zaten sonuçlandırılmış' }, { status: 400 });
    }

    if (action === 'CANCEL') {
      if (invitation.senderId !== session.id) {
        return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
      }

      const updated = await prisma.adminInvitation.update({
        where: { id },
        data: { status: InvitationStatus.CANCELLED },
      });

      return NextResponse.json({ invitation: updated, message: 'Davet iptal edildi' });
    }

    // Accept / Reject must be done by the receiver
    if (invitation.receiverId !== session.id) {
      return NextResponse.json({ error: 'Bu daveti yalnızca alıcı yanıtlayabilir' }, { status: 403 });
    }

    if (action === 'REJECT') {
      const updated = await prisma.adminInvitation.update({
        where: { id },
        data: { status: InvitationStatus.REJECTED },
      });
      return NextResponse.json({ invitation: updated, message: 'Davet reddedildi' });
    }

    if (action === 'ACCEPT') {
      // Transaction: Accept invitation and assign User as BLOCK_ADMIN for this building/block
      const [updatedInvite, updatedUser] = await prisma.$transaction([
        prisma.adminInvitation.update({
          where: { id },
          data: { status: InvitationStatus.ACCEPTED },
        }),
        prisma.user.update({
          where: { id: session.id },
          data: {
            role: session.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : UserRole.BLOCK_ADMIN,
            buildingId: invitation.buildingId,
            blockName: invitation.blockName || null,
          },
        }),
      ]);

      return NextResponse.json({
        invitation: updatedInvite,
        user: updatedUser,
        message: 'Yöneticilik daveti kabul edildi',
      });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu' }, { status: 500 });
  }
}
