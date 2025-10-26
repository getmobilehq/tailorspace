import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// Only initialize Twilio if credentials are provided and valid
const isTwilioConfigured =
  accountSid &&
  authToken &&
  accountSid.startsWith('AC') &&
  accountSid !== 'skip';

export const twilioClient = isTwilioConfigured
  ? twilio(accountSid, authToken)
  : null;

export async function sendWhatsAppMessage(to: string, message: string) {
  // If Twilio is not configured, skip sending but don't error
  if (!twilioClient) {
    console.warn('Twilio not configured - WhatsApp message not sent:', { to, message });
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const result = await twilioClient.messages.create({
      from: whatsappNumber,
      to: `whatsapp:${to}`,
      body: message,
    });
    return { success: true, sid: result.sid };
  } catch (error) {
    console.error('WhatsApp send error:', error);
    return { success: false, error };
  }
}

export const MESSAGE_TEMPLATES = {
  WELCOME: (name: string) =>
    `Welcome to TailorSpace, ${name}! 👋\n\nWe're here to make alterations simple. Use this chat for support anytime.`,

  ORDER_CONFIRMATION: (orderId: string, pickupDate: string) =>
    `Your alteration order #${orderId} is confirmed! ✅\n\nPickup scheduled for: ${pickupDate}\n\nTrack your order at: ${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}`,

  STATUS_UPDATE: (orderId: string, newStatus: string) =>
    `Order #${orderId} update: ${newStatus}\n\nView details: ${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}`,

  DELIVERY_COMPLETE: (orderId: string) =>
    `Your garment has been delivered! 🎉\n\nHow did we do? Leave feedback: ${process.env.NEXT_PUBLIC_SITE_URL}/orders/${orderId}/feedback`,
};
