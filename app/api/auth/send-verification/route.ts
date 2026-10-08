import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateVerificationToken, generateVerificationTokenExpiry } from '@/lib/verification';
import { sendEmail, generateVerificationEmail } from '@/lib/email';
import { rateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  try {
    if (rateLimit(request, 'send-verification', 3, 60_000)) {
      return NextResponse.json(
        { error: 'Çok fazla istek. Lütfen bir dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, name } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'E-posta ve ad gereklidir' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser && existingUser.emailVerified) {
      return NextResponse.json(
        { error: 'Bu e-posta zaten doğrulanmış' },
        { status: 400 }
      );
    }

    // Generate verification token
    const token = generateVerificationToken();
    const expiresAt = generateVerificationTokenExpiry();

    // Delete any existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email },
    });

    // Create new verification token
    await prisma.verificationToken.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Generate verification URL
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    // Send email
    const { html, text } = generateVerificationEmail(name, verificationUrl);
    const emailResult = await sendEmail({
      to: email,
      subject: 'LuxDues - E-posta Doğrulama',
      html,
      text,
    });

    if (!emailResult.success) {
      console.error('Email sending failed:', emailResult.error);
      return NextResponse.json(
        { error: 'E-posta gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Doğrulama e-postası gönderildi' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Send verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
