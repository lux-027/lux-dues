import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { parseAccountNumber } from '@/lib/userId';
import { InvitationStatus, UserRole } from '@prisma/client';

// GET /api/invitations - List incoming and outgoing invitations for current user
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch invitations received by this user (e.g. pending admin requests)
    const received = await prisma.adminInvitation.findMany({
      where: {
        receiverId: session.id,
        status: InvitationStatus.PENDING,
      },
      include: {
        sender: {
          select: {
            id: true,
            accountNumber: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
            address: true,
            type: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If user is SUPER_ADMIN, also fetch sent invitations
    let sent: any[] = [];
    if (session.role === UserRole.SUPER_ADMIN) {
      sent = await prisma.adminInvitation.findMany({
        where: {
          senderId: session.id,
        },
        include: {
          receiver: {
            select: {
              id: true,
              accountNumber: true,
              name: true,
              email: true,
              phone: true,
              avatarUrl: true,
            },
          },
          building: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return NextResponse.json({ received, sent });
  } catch (error) {
    console.error('Error fetching invitations:', error);
    return NextResponse.json({ error: 'Davetler alınamadı' }, { status: 500 });
  }
}

// POST /api/invitations - Send an admin invite request by User ID (SUPER_ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    const body = await request.json();
    const { receiverAccountNumber, buildingId, blockName, replaceExisting, existingInvitationId } = body;

    if (!receiverAccountNumber || !buildingId) {
      return NextResponse.json({ error: 'Kullanıcı ID ve Bina seçilmelidir' }, { status: 400 });
    }

    const parsedAccNumber = parseAccountNumber(String(receiverAccountNumber));
    if (!parsedAccNumber) {
      return NextResponse.json({ error: 'Geçersiz Kullanıcı ID' }, { status: 400 });
    }

    const receiver = await prisma.user.findFirst({
      where: {
        OR: [
          { accountNumber: parsedAccNumber },
          { adminAccountNumber: parsedAccNumber },
          { residentAccountNumber: parsedAccNumber },
        ],
      },
    });

    if (!receiver) {
      return NextResponse.json({ error: 'Belirtilen ID ile kullanıcı bulunamadı' }, { status: 404 });
    }

    if (receiver.id === session.id) {
      return NextResponse.json({ error: 'Kendinize davet gönderemezsiniz' }, { status: 400 });
    }

    // Check if building exists
    const building = await prisma.building.findUnique({
      where: { id: buildingId },
    });
    if (!building) {
      return NextResponse.json({ error: 'Bina bulunamadı' }, { status: 404 });
    }

    // Prevent inviting a user who is already an active admin of this building/block.
    if (receiver.buildingId === buildingId && receiver.blockName === (blockName || null) &&
        (receiver.role === UserRole.BLOCK_ADMIN || receiver.role === UserRole.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Bu kullanıcı zaten bu bina/blok için yöneticidir' }, { status: 400 });
    }

    // Check if this building/block already has an active accepted admin.
    const activeAdmin = await prisma.user.findFirst({
      where: {
        buildingId,
        blockName: blockName || null,
        role: { in: [UserRole.BLOCK_ADMIN, UserRole.SUPER_ADMIN] },
      },
      select: {
        id: true,
        name: true,
        accountNumber: true,
        email: true,
        role: true,
      },
    });

    if (activeAdmin && activeAdmin.id !== receiver.id) {
      return NextResponse.json(
        {
          error: 'Bu bina/blokta zaten aktif bir yönetici var. Yeni yönetici daveti göndermeden önce mevcut yöneticinin yetkisini kaldırın.',
          activeAdminExists: true,
          activeAdmin,
        },
        { status: 409 }
      );
    }

    // Check if there is already a pending invitation for this building/block (any receiver).
    const existingPending = await prisma.adminInvitation.findFirst({
      where: {
        buildingId,
        blockName: blockName || null,
        status: InvitationStatus.PENDING,
      },
      include: {
        receiver: {
          select: {
            id: true,
            accountNumber: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (existingPending) {
      if (existingPending.receiverId === receiver.id) {
        return NextResponse.json(
          { error: 'Bu kullanıcıya zaten bekleyen bir davet gönderilmiş' },
          { status: 409 }
        );
      }

      if (replaceExisting && existingInvitationId && existingPending.id === existingInvitationId) {
        await prisma.adminInvitation.update({
          where: { id: existingPending.id },
          data: { status: InvitationStatus.CANCELLED },
        });
      } else {
        return NextResponse.json(
          {
            error: 'Bu bina/bloka zaten başka bir kullanıcıya gönderilmiş bekleyen bir yönetici daveti var.',
            pendingExists: true,
            existingInvitation: {
              id: existingPending.id,
              receiver: existingPending.receiver,
              createdAt: existingPending.createdAt,
            },
          },
          { status: 409 }
        );
      }
    }

    const invitation = await prisma.adminInvitation.create({
      data: {
        senderId: session.id,
        receiverId: receiver.id,
        buildingId,
        blockName: blockName || null,
        status: InvitationStatus.PENDING,
      },
      include: {
        receiver: {
          select: {
            id: true,
            accountNumber: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        building: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({ invitation, message: 'Yönetici talebi başarıyla iletildi' }, { status: 201 });
  } catch (error) {
    console.error('Error creating invitation:', error);
    return NextResponse.json({ error: 'Talep oluşturulurken bir hata oluştu' }, { status: 500 });
  }
}
