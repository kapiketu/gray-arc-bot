import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

function getHeaders() {
  return {
    'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
    'Content-Type': 'application/json'
  };
}

function isMock(): boolean {
  return !WHATSAPP_TOKEN || WHATSAPP_TOKEN.includes('YOUR_') || !WHATSAPP_PHONE_NUMBER_ID;
}

// ────────────────────────────────────────────────────────
// 1. SEND PLAIN TEXT MESSAGE
// ────────────────────────────────────────────────────────
export async function sendTextMessage(toPhoneNumber: string, messageBody: string): Promise<void> {
  console.log(`[WhatsApp Outbound] Sending text to ${toPhoneNumber}: "${messageBody}"`);

  if (isMock()) {
    console.warn('[WhatsApp Outbound] Mock mode — logging only.');
    return;
  }

  try {
    const response = await axios.post(
      API_URL,
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
      { headers: getHeaders() }
    );
    console.log('[WhatsApp Outbound] Text sent. ID:', response.data.messages?.[0]?.id);
  } catch (error: any) {
    console.error('[WhatsApp Outbound] Error sending text:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp message');
  }
}

// ────────────────────────────────────────────────────────
// 2. SEND BUTTON MESSAGE (max 3 buttons)
// ────────────────────────────────────────────────────────
export interface ButtonOption {
  id: string;    // unique ID returned when user taps (e.g. "btn_create_website")
  title: string; // button label shown to user (max 20 chars)
}

export async function sendButtonMessage(
  toPhoneNumber: string,
  bodyText: string,
  buttons: ButtonOption[],
  headerText?: string,
  footerText?: string
): Promise<void> {
  console.log(`[WhatsApp Outbound] Sending buttons to ${toPhoneNumber}: [${buttons.map(b => b.title).join(', ')}]`);

  if (isMock()) {
    console.warn('[WhatsApp Outbound] Mock mode — logging only.');
    return;
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhoneNumber,
    type: 'interactive',
    interactive: {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.map(btn => ({
          type: 'reply',
          reply: {
            id: btn.id,
            title: btn.title
          }
        }))
      }
    }
  };

  if (headerText) {
    payload.interactive.header = { type: 'text', text: headerText };
  }
  if (footerText) {
    payload.interactive.footer = { text: footerText };
  }

  try {
    const response = await axios.post(API_URL, payload, { headers: getHeaders() });
    console.log('[WhatsApp Outbound] Buttons sent. ID:', response.data.messages?.[0]?.id);
  } catch (error: any) {
    console.error('[WhatsApp Outbound] Error sending buttons:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp button message');
  }
}

// ────────────────────────────────────────────────────────
// 3. SEND LIST MESSAGE (scrollable list menu, max 10 rows)
// ────────────────────────────────────────────────────────
export interface ListRow {
  id: string;          // unique ID returned on selection (e.g. "cat_bakery")
  title: string;       // row title (max 24 chars)
  description?: string; // optional subtitle under the title (max 72 chars)
}

export interface ListSection {
  title: string;   // section header (max 24 chars)
  rows: ListRow[];
}

export async function sendListMessage(
  toPhoneNumber: string,
  bodyText: string,
  buttonLabel: string,
  sections: ListSection[],
  headerText?: string,
  footerText?: string
): Promise<void> {
  console.log(`[WhatsApp Outbound] Sending list to ${toPhoneNumber}: "${buttonLabel}" with ${sections.reduce((a, s) => a + s.rows.length, 0)} rows`);

  if (isMock()) {
    console.warn('[WhatsApp Outbound] Mock mode — logging only.');
    return;
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhoneNumber,
    type: 'interactive',
    interactive: {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonLabel,
        sections: sections
      }
    }
  };

  if (headerText) {
    payload.interactive.header = { type: 'text', text: headerText };
  }
  if (footerText) {
    payload.interactive.footer = { text: footerText };
  }

  try {
    const response = await axios.post(API_URL, payload, { headers: getHeaders() });
    console.log('[WhatsApp Outbound] List sent. ID:', response.data.messages?.[0]?.id);
  } catch (error: any) {
    console.error('[WhatsApp Outbound] Error sending list:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp list message');
  }
}

// ────────────────────────────────────────────────────────
// 4. SEND CTA URL BUTTON (opens link directly in browser)
// ────────────────────────────────────────────────────────
export async function sendCTAUrlMessage(
  toPhoneNumber: string,
  bodyText: string,
  buttonLabel: string,
  url: string,
  headerText?: string,
  footerText?: string
): Promise<void> {
  console.log(`[WhatsApp Outbound] Sending CTA URL to ${toPhoneNumber}: "${buttonLabel}" -> ${url}`);

  if (isMock()) {
    console.warn('[WhatsApp Outbound] Mock mode — logging only.');
    return;
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhoneNumber,
    type: 'interactive',
    interactive: {
      type: 'cta_url',
      body: { text: bodyText },
      action: {
        name: 'cta_url',
        parameters: {
          display_text: buttonLabel,
          url: url
        }
      }
    }
  };

  if (headerText) {
    payload.interactive.header = { type: 'text', text: headerText };
  }
  if (footerText) {
    payload.interactive.footer = { text: footerText };
  }

  try {
    const response = await axios.post(API_URL, payload, { headers: getHeaders() });
    console.log('[WhatsApp Outbound] CTA URL sent. ID:', response.data.messages?.[0]?.id);
  } catch (error: any) {
    console.error('[WhatsApp Outbound] Error sending CTA URL:', error.response?.data || error.message);
    throw new Error('Failed to send WhatsApp CTA URL message');
  }
}

// ────────────────────────────────────────────────────────
// 6. SEND FLOW MESSAGE (native forms)
// ────────────────────────────────────────────────────────
export async function sendFlowMessage(
  toPhoneNumber: string,
  bodyText: string,
  buttonLabel: string,
  flowId: string,
  flowToken: string,
  screenName: string,
  headerText?: string,
  footerText?: string
): Promise<void> {
  console.log(`[WhatsApp Outbound] Sending Flow to ${toPhoneNumber}: Flow ID: ${flowId}, Screen: ${screenName}`);

  if (isMock()) {
    console.warn('[WhatsApp Outbound] Mock mode — logging only.');
    return;
  }

  const payload: any = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: toPhoneNumber,
    type: 'interactive',
    interactive: {
      type: 'flow',
      body: { text: bodyText },
      action: {
        name: 'flow',
        parameters: {
          flow_token: flowToken,
          flow_id: flowId,
          flow_cta: buttonLabel,
          flow_action: 'navigate',
          flow_action_payload: {
            screen: screenName,
            data: {}
          }
        }
      }
    }
  };

  if (headerText) {
    payload.interactive.header = { type: 'text', text: headerText };
  }
  if (footerText) {
    payload.interactive.footer = { text: footerText };
  }

  try {
    const response = await axios.post(API_URL, payload, { headers: getHeaders() });
    console.log('[WhatsApp Outbound] Flow sent. ID:', response.data.messages?.[0]?.id);
  } catch (error: any) {
    console.error('[WhatsApp Outbound] Error sending Flow:', error.response?.data || error.message);
    throw error;
  }
}
