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
      // Accept invitation, assign user as admin, and ensure sender/receiver become friends.
      const [updatedInvite, updatedUser] = await prisma.$transaction(async (tx) => {
        const invite = await tx.adminInvitation.update({
          where: { id },
          data: { status: InvitationStatus.ACCEPTED },
        });

        const user = await tx.user.update({
          where: { id: session.id },
          data: {
            role: session.role === UserRole.SUPER_ADMIN ? UserRole.SUPER_ADMIN : UserRole.BLOCK_ADMIN,
            buildingId: invitation.buildingId,
            blockName: invitation.blockName || null,
          },
        });

        const existingFriendship = await tx.adminFriendship.findFirst({
          where: {
            OR: [
              { requesterId: invitation.senderId, addresseeId: session.id },
              { requesterId: session.id, addresseeId: invitation.senderId },
            ],
          },
        });

        if (!existingFriendship) {
          await tx.adminFriendship.create({
            data: {
              requesterId: invitation.senderId,
              addresseeId: session.id,
              status: InvitationStatus.ACCEPTED,
            },
          });
        } else if (existingFriendship.status !== InvitationStatus.ACCEPTED) {
          await tx.adminFriendship.update({
            where: { id: existingFriendship.id },
            data: { status: InvitationStatus.ACCEPTED },
          });
        }

        return [invite, user];
      });

      return NextResponse.json({
        invitation: updatedInvite,
        user: updatedUser,
        message: 'Yöneticilik daveti kabul edildi ve arkadaş olarak eklendi',
      });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error('Error updating invitation:', error);
    return NextResponse.json({ error: 'İşlem sırasında bir hata oluştu' }, { status: 500 });
  }
}
