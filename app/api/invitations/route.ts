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
    const { receiverAccountNumber, buildingId, blockName } = body;

    if (!receiverAccountNumber || !buildingId) {
      return NextResponse.json({ error: 'Kullanıcı ID ve Bina seçilmelidir' }, { status: 400 });
    }

    const parsedAccNumber = parseAccountNumber(String(receiverAccountNumber));
    if (!parsedAccNumber) {
      return NextResponse.json({ error: 'Geçersiz Kullanıcı ID' }, { status: 400 });
    }

    const receiver = await prisma.user.findUnique({
      where: { accountNumber: parsedAccNumber },
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

    // Check if user is already admin of this block/building
    if (receiver.role === UserRole.BLOCK_ADMIN && receiver.buildingId === buildingId && receiver.blockName === (blockName || null)) {
      return NextResponse.json({ error: 'Bu kullanıcı zaten bu bloğun yöneticisidir' }, { status: 400 });
    }

    // Check if there is already an active pending invitation
    const existing = await prisma.adminInvitation.findFirst({
      where: {
        receiverId: receiver.id,
        buildingId,
        blockName: blockName || null,
        status: InvitationStatus.PENDING,
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Bu kullanıcıya zaten bekleyen bir davet gönderilmiş' }, { status: 409 });
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
