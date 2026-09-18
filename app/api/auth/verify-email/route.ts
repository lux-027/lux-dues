import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isTokenExpired } from '@/lib/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Doğrulama kodu gereklidir' },
        { status: 400 }
      );
    }

    // Find the verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Geçersiz doğrulama kodu' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (isTokenExpired(verificationToken.expiresAt)) {
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: 'Doğrulama kodunun süresi dolmuş. Lütfen yeni bir kod isteyin.' },
        { status: 400 }
      );
    }

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Return success with email
    return NextResponse.json(
      { 
        success: true,
        email: verificationToken.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
