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

export type SendEmailResult = { success: true } | { success: false; error: string };

export async function sendEmail({ to, subject, html, from }: SendEmailOptions): Promise<SendEmailResult> {
  // Check if email service is configured
  if (!process.env.RESEND_API_KEY) {
    const msg = 'RESEND_API_KEY not configured. Email will not be sent.';
    console.warn(msg);
    console.log('Email would be sent to:', to, 'Subject:', subject);
    return { success: false, error: msg };
  }

  try {
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
      let errorMessage = `Resend API error (${response.status})`;
      try {
        const error = await response.json();
        // Log full error for debugging
        console.error('Resend API error:', JSON.stringify(error, null, 2));
        if (error.message) errorMessage = error.message;
        if (error.name) errorMessage = `[${error.name}] ${errorMessage}`;
      } catch {
        const text = await response.text();
        console.error('Resend API non-JSON response:', text);
        if (text) errorMessage = text;
      }
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error sending email:', error);
    return { success: false, error: message };
  }
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email: string, code: string): Promise<SendEmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify Your Email - Teezee</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #F9629F; margin: 0; font-size: 28px;">Teezee</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #000000; margin-top: 0;">Verify Your Email Address</h2>
          <p>Thank you for signing up with Teezee! To complete your registration, please verify your email address using the code below:</p>
          <div style="background: #f5f5f5; border: 2px dashed #F9629F; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
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

  return sendEmail({
    to: email,
    subject: 'Verify Your Email - Teezee',
    html,
  });
}

/**
 * Send password reset code email - same structure as verification email
 */
export async function sendPasswordResetCodeEmail(email: string, code: string): Promise<SendEmailResult> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - Teezee</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: #F9629F; margin: 0; font-size: 28px;">Teezee</h1>
        </div>
        <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <h2 style="color: #000000; margin-top: 0;">Reset Your Password</h2>
          <p>We received a request to reset your password. Use the code below to set a new password:</p>
          <div style="background: #f5f5f5; border: 2px dashed #F9629F; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
            <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #000000; font-family: 'Courier New', monospace;">
              ${code}
            </div>
          </div>
          <p style="color: #666; font-size: 14px;">This code will expire in <strong>10 minutes</strong>.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request a password reset, please ignore this email.</p>
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
            <p style="color: #999; font-size: 12px; margin: 0;">© ${new Date().getFullYear()} Teezee. All rights reserved.</p>
            <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">Victoria, British Columbia, Canada</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: 'Reset Your Password - Teezee',
    html,
  });
}
