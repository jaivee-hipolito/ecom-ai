/**
 * SMS service utility using Twilio API
 * TWILIO_PHONE_NUMBER must be a number you own in the Twilio console (Phone Numbers → Manage → Buy a number),
 * not your personal phone. See https://www.twilio.com/docs/errors/21659
 * Alternative: You can use AWS SNS, Vonage, or other SMS services
 */

export type SendSMSResult = { success: true } | { success: false; error: string };

interface SendSMSOptions {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SendSMSOptions): Promise<SendSMSResult> {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    const msg = 'Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER.';
    console.warn(msg);
    return { success: false, error: msg };
  }

  try {
    const formattedPhone = to.replace(/[^\d+]/g, '');
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER,
          To: formattedPhone,
          Body: message,
        }),
      }
    );

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errMsg = data.message || data.error || `Twilio error (${response.status})`;
      console.error('Twilio API error:', data);
      return { success: false, error: errMsg };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message || 'Failed to send SMS' };
  }
}

/**
 * Send verification SMS
 */
export async function sendVerificationSMS(phoneNumber: string, code: string): Promise<SendSMSResult> {
  const message = `Your Teezee verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`;
  return sendSMS({ to: phoneNumber, message });
}
