import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { generateToken } from '@/lib/auth';
import { generateUniqueAccountNumber } from '@/lib/accountNumber';
import { UserRole } from '@prisma/client';

// POST /api/auth/activate-portal - Activate portal/role with the same email
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { portal } = body;

    if (portal !== 'admin' && portal !== 'resident') {
      return NextResponse.json({ error: 'Geçersiz portal tipi' }, { status: 400 });
    }

    const user = await (prisma as any).user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    if (portal === 'admin') {
      const adminAcc = user.adminAccountNumber || (await generateUniqueAccountNumber());

      // If user is currently RESIDENT, upgrade to SUPER_ADMIN and assign distinct adminAccountNumber
      const updatedUser = await (prisma as any).user.update({
        where: { id: user.id },
        data: {
          role: UserRole.SUPER_ADMIN,
          adminAccountNumber: adminAcc,
        },
      });

      // Send notification
      try {
        await (prisma as any).notification.create({
          data: {
            userId: user.id,
            title: 'Yönetici Hesabınız Aktifleştirildi',
            message: 'Aynı e-posta adresinizle yönetici paneli yetkisi başarıyla tanımlandı. Binalarınızı ve aidatlarınızı yönetebilirsiniz.',
            type: 'success',
          },
        });
      } catch (notifyErr) {
        console.error('Error creating activation notification:', notifyErr);
      }

      // Re-issue auth token
      const token = generateToken({
        userId: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        buildingId: updatedUser.buildingId,
      });

      const response = NextResponse.json({
        success: true,
        redirectUrl: '/admin',
        message: 'Yönetici hesabınız başarıyla aktifleştirildi.',
      });

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
      });

      return response;
    }

    if (portal === 'resident') {
      const resAcc = user.residentAccountNumber || (await generateUniqueAccountNumber());

      await (prisma as any).user.update({
        where: { id: user.id },
        data: {
          residentAccountNumber: resAcc,
        },
      });

      const response = NextResponse.json({
        success: true,
        redirectUrl: '/dashboard',
        message: 'Sakin paneli aktif.',
      });

      return response;
    }

    return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 });
  } catch (error) {
    console.error('Error activating portal:', error);
    return NextResponse.json({ error: 'Portal aktifleştirilirken bir hata oluştu' }, { status: 500 });
  }
}
