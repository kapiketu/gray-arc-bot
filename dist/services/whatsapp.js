"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendTextMessage = sendTextMessage;
exports.sendButtonMessage = sendButtonMessage;
exports.sendListMessage = sendListMessage;
exports.sendCTAUrlMessage = sendCTAUrlMessage;
exports.sendFlowMessage = sendFlowMessage;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const API_URL = `https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
function getHeaders() {
    return {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
    };
}
function isMock() {
    return !WHATSAPP_TOKEN || WHATSAPP_TOKEN.includes('YOUR_') || !WHATSAPP_PHONE_NUMBER_ID;
}
// ────────────────────────────────────────────────────────
// 1. SEND PLAIN TEXT MESSAGE
// ────────────────────────────────────────────────────────
async function sendTextMessage(toPhoneNumber, messageBody) {
    console.log(`[WhatsApp Outbound] Sending text to ${toPhoneNumber}: "${messageBody}"`);
    if (isMock()) {
        console.warn('[WhatsApp Outbound] Mock mode — logging only.');
        return;
    }
    try {
        const response = await axios_1.default.post(API_URL, {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: toPhoneNumber,
            type: 'text',
            text: {
                preview_url: true,
                body: messageBody
            }
        }, { headers: getHeaders() });
        console.log('[WhatsApp Outbound] Text sent. ID:', response.data.messages?.[0]?.id);
    }
    catch (error) {
        console.error('[WhatsApp Outbound] Error sending text:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp message');
    }
}
async function sendButtonMessage(toPhoneNumber, bodyText, buttons, headerText, footerText) {
    console.log(`[WhatsApp Outbound] Sending buttons to ${toPhoneNumber}: [${buttons.map(b => b.title).join(', ')}]`);
    if (isMock()) {
        console.warn('[WhatsApp Outbound] Mock mode — logging only.');
        return;
    }
    const payload = {
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
        const response = await axios_1.default.post(API_URL, payload, { headers: getHeaders() });
        console.log('[WhatsApp Outbound] Buttons sent. ID:', response.data.messages?.[0]?.id);
    }
    catch (error) {
        console.error('[WhatsApp Outbound] Error sending buttons:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp button message');
    }
}
async function sendListMessage(toPhoneNumber, bodyText, buttonLabel, sections, headerText, footerText) {
    console.log(`[WhatsApp Outbound] Sending list to ${toPhoneNumber}: "${buttonLabel}" with ${sections.reduce((a, s) => a + s.rows.length, 0)} rows`);
    if (isMock()) {
        console.warn('[WhatsApp Outbound] Mock mode — logging only.');
        return;
    }
    const payload = {
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
        const response = await axios_1.default.post(API_URL, payload, { headers: getHeaders() });
        console.log('[WhatsApp Outbound] List sent. ID:', response.data.messages?.[0]?.id);
    }
    catch (error) {
        console.error('[WhatsApp Outbound] Error sending list:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp list message');
    }
}
// ────────────────────────────────────────────────────────
// 4. SEND CTA URL BUTTON (opens link directly in browser)
// ────────────────────────────────────────────────────────
async function sendCTAUrlMessage(toPhoneNumber, bodyText, buttonLabel, url, headerText, footerText) {
    console.log(`[WhatsApp Outbound] Sending CTA URL to ${toPhoneNumber}: "${buttonLabel}" -> ${url}`);
    if (isMock()) {
        console.warn('[WhatsApp Outbound] Mock mode — logging only.');
        return;
    }
    const payload = {
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
        const response = await axios_1.default.post(API_URL, payload, { headers: getHeaders() });
        console.log('[WhatsApp Outbound] CTA URL sent. ID:', response.data.messages?.[0]?.id);
    }
    catch (error) {
        console.error('[WhatsApp Outbound] Error sending CTA URL:', error.response?.data || error.message);
        throw new Error('Failed to send WhatsApp CTA URL message');
    }
}
// ────────────────────────────────────────────────────────
// 6. SEND FLOW MESSAGE (native forms)
// ────────────────────────────────────────────────────────
async function sendFlowMessage(toPhoneNumber, bodyText, buttonLabel, flowId, flowToken, screenName, headerText, footerText) {
    console.log(`[WhatsApp Outbound] Sending Flow to ${toPhoneNumber}: Flow ID: ${flowId}, Screen: ${screenName}`);
    if (isMock()) {
        console.warn('[WhatsApp Outbound] Mock mode — logging only.');
        return;
    }
    const payload = {
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
        const response = await axios_1.default.post(API_URL, payload, { headers: getHeaders() });
        console.log('[WhatsApp Outbound] Flow sent. ID:', response.data.messages?.[0]?.id);
    }
    catch (error) {
        console.error('[WhatsApp Outbound] Error sending Flow:', error.response?.data || error.message);
        throw error;
    }
}
