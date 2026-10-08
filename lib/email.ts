import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  if (!resend) {
    console.warn('Resend API key not configured. Email not sent.');
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'LuxDues <onboarding@resend.dev>',
      to,
      subject,
      html,
      text,
    });

    if (error) {
      console.error('Email sending error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

export function generateVerificationEmail(name: string, verificationUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #18181b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #18181b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>LuxDues</h1>
          </div>
          <div class="content">
            <p>Merhaba ${name},</p>
            <p>Hesabınızı doğrulamak için aşağıdaki butona tıklayın:</p>
            <a href="${verificationUrl}" class="button">E-posta Doğrula</a>
            <p style="margin-top: 20px;">Veya bu bağlantıyı tarayıcınıza kopyalayın:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p style="margin-top: 20px;">Bu bağlantı 24 saat geçerlidir.</p>
          </div>
          <div class="footer">
            <p>Bu e-postayı siz istemediyseniz, lütfen dikkate almayın.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
    Merhaba ${name},

    Hesabınızı doğrulamak için aşağıdaki bağlantıya tıklayın:
    ${verificationUrl}

    Bu bağlantı 24 saat geçerlidir.

    Bu e-postayı siz istemediyseniz, lütfen dikkate almayın.
  `;

  return { html, text };
}
