import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { parseAccountNumber } from '@/lib/userId';
import { InvitationStatus, UserRole } from '@prisma/client';

const ADMIN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.BLOCK_ADMIN];

// GET /api/admin-friendships - List my friend requests and accepted friends
export async function GET() {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role as UserRole)) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    const userId = session.id;

    const received = await prisma.adminFriendship.findMany({
      where: { addresseeId: userId, status: InvitationStatus.PENDING },
      include: {
        requester: {
          select: { id: true, accountNumber: true, name: true, email: true, phone: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sent = await prisma.adminFriendship.findMany({
      where: { requesterId: userId, status: InvitationStatus.PENDING },
      include: {
        addressee: {
          select: { id: true, accountNumber: true, name: true, email: true, phone: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const friendships = await prisma.adminFriendship.findMany({
      where: {
        status: InvitationStatus.ACCEPTED,
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: {
          select: { id: true, accountNumber: true, name: true, email: true, phone: true, role: true },
        },
        addressee: {
          select: { id: true, accountNumber: true, name: true, email: true, phone: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const friends = friendships.map((f) => (f.requesterId === userId ? f.addressee : f.requester));

    return NextResponse.json({ received, sent, friends });
  } catch (error) {
    console.error('Error fetching admin friendships:', error);
    return NextResponse.json({ error: 'Arkadaşlık bilgileri alınamadı' }, { status: 500 });
  }
}

// POST /api/admin-friendships - Send a friend request by User ID
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !ADMIN_ROLES.includes(session.role as UserRole)) {
      return NextResponse.json({ error: 'Yetkisiz işlem' }, { status: 403 });
    }

    const body = await request.json();
    const { accountNumber } = body;

    if (!accountNumber) {
      return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 });
    }

    const parsed = parseAccountNumber(String(accountNumber));
    if (!parsed) {
      return NextResponse.json({ error: 'Geçersiz Kullanıcı ID' }, { status: 400 });
    }

    const addressee = await prisma.user.findUnique({
      where: { accountNumber: parsed },
    });

    if (!addressee) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (addressee.id === session.id) {
      return NextResponse.json({ error: 'Kendinize istek gönderemezsiniz' }, { status: 400 });
    }

    if (!ADMIN_ROLES.includes(addressee.role)) {
      return NextResponse.json({ error: 'Yalnızca yöneticilere istek gönderilebilir' }, { status: 400 });
    }

    // Check for an existing friendship in any direction/status
    const existing = await prisma.adminFriendship.findFirst({
      where: {
        OR: [
          { requesterId: session.id, addresseeId: addressee.id },
          { requesterId: addressee.id, addresseeId: session.id },
        ],
      },
    });

    if (existing) {
      if (existing.status === InvitationStatus.ACCEPTED) {
        return NextResponse.json({ error: 'Bu kullanıcı ile zaten arkadaşsınız' }, { status: 409 });
      }
      if (existing.requesterId === session.id) {
        return NextResponse.json({ error: 'Bu kullanıcıya zaten bekleyen istek gönderilmiş' }, { status: 409 });
      }
      if (existing.addresseeId === session.id) {
        return NextResponse.json(
          { error: 'Bu kullanıcıdan size bekleyen istek var. Kabul edebilirsiniz.' },
          { status: 409 }
        );
      }
    }

    const friendship = await prisma.adminFriendship.create({
      data: {
        requesterId: session.id,
        addresseeId: addressee.id,
        status: InvitationStatus.PENDING,
      },
      include: {
        addressee: {
          select: { id: true, accountNumber: true, name: true, email: true, phone: true, role: true },
        },
      },
    });

    return NextResponse.json({ friendship, message: 'Yönetici arkadaşlık isteği gönderildi' }, { status: 201 });
  } catch (error) {
    console.error('Error creating admin friendship:', error);
    return NextResponse.json({ error: 'Arkadaşlık isteği oluşturulurken bir hata oluştu' }, { status: 500 });
  }
}
