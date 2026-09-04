import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { parseAccountNumber } from '@/lib/userId';

// GET /api/users/lookup?accountNumber=... - Lookup user by 9-digit account number (Authenticated only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('accountNumber') || searchParams.get('id');

    if (!query) {
      return NextResponse.json({ error: 'Kullanıcı ID gereklidir' }, { status: 400 });
    }

    const parsedNumber = parseAccountNumber(query);
    if (!parsedNumber) {
      return NextResponse.json({ error: 'Geçersiz Kullanıcı ID formatı' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { accountNumber: parsedNumber },
      select: {
        id: true,
        accountNumber: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error looking up user:', error);
    return NextResponse.json({ error: 'Kullanıcı sorgulanırken bir hata oluştu' }, { status: 500 });
  }
}
