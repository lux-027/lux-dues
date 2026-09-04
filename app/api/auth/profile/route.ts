import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { isValidTurkishPhone, normalizePhoneNumber } from '@/lib/phone';

// PATCH /api/auth/profile - Update the authenticated user's own profile (name, phone, avatarUrl)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, phone, avatarUrl } = await request.json();

    const data: { name?: string; phone?: string; avatarUrl?: string | null } = {};

    if (typeof name === 'string' && name.trim()) {
      data.name = name.trim();
    }

    if (typeof phone === 'string' && phone.trim()) {
      const normalized = normalizePhoneNumber(phone);
      if (!isValidTurkishPhone(normalized)) {
        return NextResponse.json(
          { error: 'Geçerli bir Türkiye cep telefonu numarası girin' },
          { status: 400 }
        );
      }
      const existingUser = await prisma.user.findFirst({
        where: { phone: normalized, NOT: { id: session.id } },
      });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu telefon numarası başka bir hesaba kayıtlı' },
          { status: 409 }
        );
      }
      data.phone = normalized;
    }

    if (avatarUrl !== undefined) {
      if (avatarUrl === null) {
        data.avatarUrl = null;
      } else if (typeof avatarUrl === 'string' && avatarUrl.startsWith('data:image/')) {
        if (avatarUrl.length > 2_000_000) {
          return NextResponse.json(
            { error: 'Görsel çok büyük. Lütfen daha küçük bir görsel seçin.' },
            { status: 400 }
          );
        }
        data.avatarUrl = avatarUrl;
      } else {
        return NextResponse.json({ error: 'Geçersiz görsel formatı' }, { status: 400 });
      }
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Güncellenecek bir alan yok' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data,
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        accountNumber: updatedUser.accountNumber,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Profil güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
