import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { InvitationStatus, UserRole } from '@prisma/client';

const ADMIN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.BLOCK_ADMIN];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role as UserRole)) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    const { id } = await params;
    const { action } = await request.json();

    const friendship = await prisma.adminFriendship.findUnique({
      where: { id },
    });

    if (!friendship) {
      return NextResponse.json({ error: 'İstek bulunamadı' }, { status: 404 });
    }

    const userId = session.id;
    const isRequester = friendship.requesterId === userId;
    const isAddressee = friendship.addresseeId === userId;

    if (action === 'CANCEL') {
      if (!isRequester) {
        return NextResponse.json({ error: 'Sadece istek gönderen iptal edebilir' }, { status: 403 });
      }
      await prisma.adminFriendship.delete({ where: { id } });
      return NextResponse.json({ message: 'İstek iptal edildi' });
    }

    if (action === 'REJECT') {
      if (!isAddressee) {
        return NextResponse.json({ error: 'Sadece istek alan reddedebilir' }, { status: 403 });
      }
      await prisma.adminFriendship.delete({ where: { id } });
      return NextResponse.json({ message: 'İstek reddedildi' });
    }

    if (action === 'ACCEPT') {
      if (!isAddressee) {
        return NextResponse.json({ error: 'Sadece istek alan kabul edebilir' }, { status: 403 });
      }
      if (friendship.status !== InvitationStatus.PENDING) {
        return NextResponse.json({ error: 'Bu istek zaten işlenmiş' }, { status: 400 });
      }
      const updated = await prisma.adminFriendship.update({
        where: { id },
        data: { status: InvitationStatus.ACCEPTED },
        include: {
          requester: {
            select: { id: true, accountNumber: true, name: true, email: true, phone: true, role: true },
          },
          addressee: {
            select: { id: true, accountNumber: true, name: true, email: true, phone: true, role: true },
          },
        },
      });
      return NextResponse.json({ friendship: updated, message: 'Yönetici arkadaşlık isteği kabul edildi' });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error('Error updating admin friendship:', error);
    return NextResponse.json({ error: 'İstek güncellenirken bir hata oluştu' }, { status: 500 });
  }
}
