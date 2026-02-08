/**
 * Email service utility using Resend API
 * Alternative: You can use Nodemailer, SendGrid, or other email services
 */

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<boolean> {
  // Check if email service is configured
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured. Email will not be sent.');
    console.log('Email would be sent to:', to);
    console.log('Subject:', subject);
    return false;
  }

  try {
    // Using Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: from || process.env.EMAIL_FROM || 'Teezee <onboarding@resend.dev>',
        to: [to],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, code: string): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Teezee</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #050b2c 0%, #0a1538 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #ffa509; margin: 0; font-size: 28px;">Teezee</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #050b2c; margin-top: 0;">Verify Your Email Address</h2>
          <p>Thank you for signing up with Teezee! To complete your registration, please verify your email address using the code below:</p>
          <div style="background: #f5f5f5; border: 2px dashed #ffa509; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #050b2c; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">This verification code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #666; font-size: 14px;">If you didn't create an account with Teezee, please ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Teezee. All rights reserved.</p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">Victoria, British Columbia, Canada</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail({
    to: email,
    subject: 'Verify Your Email - Teezee',
    html,
  });
}
