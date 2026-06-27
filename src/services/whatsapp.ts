import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

export async function sendTextMessage(toPhoneNumber: string, messageBody: string): Promise<void> {
  console.log(`[WhatsApp Outbound] Sending to ${toPhoneNumber}: "${messageBody}"`);

  // Fallback for local testing without API key setup
  if (!WHATSAPP_TOKEN || WHATSAPP_TOKEN.includes('YOUR_') || !WHATSAPP_PHONE_NUMBER_ID) {
    console.warn('[WhatsApp Outbound] WhatsApp credentials missing or mock. Logging to console instead.');
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  
  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: toPhoneNumber,
        type: 'text',
        text: {
          preview_url: true,
          body: messageBody
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    console.log('[WhatsApp Outbound] Successfully sent message. Message ID:', response.data.messages?.[0]?.id);
  } catch (error: any) {
    console.error('[WhatsApp Outbound] Error sending WhatsApp message:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp message');
  }
}
