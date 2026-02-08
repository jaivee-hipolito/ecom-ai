/**
 * SMS service utility using Twilio API
 * Alternative: You can use AWS SNS, Vonage, or other SMS services
 */

interface SendSMSOptions {
  to: string;
  message: string;
}

export async function sendSMS({ to, message }: SendSMSOptions): Promise<boolean> {
  // Check if SMS service is configured
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
    console.warn('Twilio credentials not configured. SMS will not be sent.');
    console.log('SMS would be sent to:', to);
    console.log('Message:', message);
    return false;
  }

  try {
    // Format phone number (remove any non-digit characters except +)
    const formattedPhone = to.replace(/[^\d+]/g, '');
    
    // Using Twilio API
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: process.env.TWILIO_PHONE_NUMBER!,
          To: formattedPhone,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Twilio API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
}

/**
 * Send verification SMS
 */
export async function sendVerificationSMS(phoneNumber: string, code: string): Promise<boolean> {
  const message = `Your Teezee verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`;
  
  return await sendSMS({
    to: phoneNumber,
    message,
  });
}
