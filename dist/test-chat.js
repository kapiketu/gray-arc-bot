"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Set environment overrides at the very beginning to force mock mode before any imports cache the values!
process.env.WHATSAPP_TOKEN = '';
process.env.WHATSAPP_PHONE_NUMBER_ID = '';
const fastify_1 = __importDefault(require("fastify"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const webhook_1 = __importDefault(require("./routes/webhook"));
const viewer_1 = __importDefault(require("./routes/viewer"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
const MOCK_PHONE = '917777777777';
// Initialize Fastify server in-memory for testing
const server = (0, fastify_1.default)({ logger: false });
server.register(formbody_1.default);
server.register(webhook_1.default);
server.register(viewer_1.default);
async function sendUserMessage(text) {
    console.log(`\n🟢 [USER]: ${text}`);
    await server.inject({
        method: 'POST',
        url: '/webhook',
        payload: {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: '1004220015559448',
                    changes: [
                        {
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: '15555555555',
                                    phone_number_id: '1105323199341702'
                                },
                                contacts: [{ profile: { name: 'Test User' }, wa_id: MOCK_PHONE }],
                                messages: [
                                    {
                                        from: MOCK_PHONE,
                                        id: `wamid.MOCK_${Math.random().toString(36).substring(7)}`,
                                        timestamp: Math.floor(Date.now() / 1000).toString(),
                                        text: { body: text },
                                        type: 'text'
                                    }
                                ]
                            },
                            field: 'messages'
                        }
                    ]
                }
            ]
        }
    });
}
async function sendUserButton(buttonId, buttonTitle) {
    console.log(`\n🟢 [USER clicks button]: "${buttonTitle}"`);
    await server.inject({
        method: 'POST',
        url: '/webhook',
        payload: {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: '1004220015559448',
                    changes: [
                        {
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: '15555555555',
                                    phone_number_id: '1105323199341702'
                                },
                                contacts: [{ profile: { name: 'Test User' }, wa_id: MOCK_PHONE }],
                                messages: [
                                    {
                                        from: MOCK_PHONE,
                                        id: `wamid.MOCK_${Math.random().toString(36).substring(7)}`,
                                        timestamp: Math.floor(Date.now() / 1000).toString(),
                                        type: 'interactive',
                                        interactive: {
                                            type: 'button_reply',
                                            button_reply: { id: buttonId, title: buttonTitle }
                                        }
                                    }
                                ]
                            },
                            field: 'messages'
                        }
                    ]
                }
            ]
        }
    });
}
async function sendUserListSelection(listId, listTitle) {
    console.log(`\n🟢 [USER selects item]: "${listTitle}"`);
    await server.inject({
        method: 'POST',
        url: '/webhook',
        payload: {
            object: 'whatsapp_business_account',
            entry: [
                {
                    id: '1004220015559448',
                    changes: [
                        {
                            value: {
                                messaging_product: 'whatsapp',
                                metadata: {
                                    display_phone_number: '15555555555',
                                    phone_number_id: '1105323199341702'
                                },
                                contacts: [{ profile: { name: 'Test User' }, wa_id: MOCK_PHONE }],
                                messages: [
                                    {
                                        from: MOCK_PHONE,
                                        id: `wamid.MOCK_${Math.random().toString(36).substring(7)}`,
                                        timestamp: Math.floor(Date.now() / 1000).toString(),
                                        type: 'interactive',
                                        interactive: {
                                            type: 'list_reply',
                                            list_reply: { id: listId, title: listTitle }
                                        }
                                    }
                                ]
                            },
                            field: 'messages'
                        }
                    ]
                }
            ]
        }
    });
}
// Intercept console.log to print WhatsApp Outbound messages nicely
const originalLog = console.log;
console.log = function (...args) {
    const msg = args.join(' ');
    if (msg.includes('[WhatsApp Outbound]')) {
        const formatted = msg
            .replace('[WhatsApp Outbound] Sending text to 917777777777:', '🤖 [BOT]:')
            .replace('[WhatsApp Outbound] Sending buttons to 917777777777:', '🤖 [BOT Buttons]:')
            .replace('[WhatsApp Outbound] Sending CTA URL to 917777777777:', '🤖 [BOT CTA Link]:')
            .replace('[WhatsApp Outbound] Mock mode — logging only.', '')
            .trim();
        if (formatted) {
            originalLog(`\n${formatted}`);
        }
    }
    else {
        originalLog(...args);
    }
};
async function run() {
    await server.ready();
    originalLog('📱 SIMULATING REAL WHATSAPP CHAT FLOW\n-------------------------------------');
    // Clean test DB records
    await supabase.from('sessions').delete().eq('phoneNumber', MOCK_PHONE);
    await supabase.from('sites').delete().eq('phone_number', MOCK_PHONE);
    // Flow steps
    await sendUserMessage('hello');
    await sendUserListSelection('cat_bakery', 'Bakery / Sweets');
    await sendUserMessage('Automation Bakers');
    await sendUserMessage('We make automated cakes for coding agents.');
    await sendUserMessage('Chocolate Cake: 400\nCupcake: 50');
    await sendUserMessage('Phone: 9999988888\nAddress: Mumbai\nHours: 10am-10pm');
    await sendUserButton('tpl_astro', 'Modern Astro');
    await sendUserButton('host_custom', 'Custom Domain');
    await sendUserMessage('automationbakers.com');
    originalLog('\n⌛ Wait 10 seconds for AI Generation...');
    await new Promise(r => setTimeout(r, 10000));
    // Verify DB
    const { data: sites } = await supabase.from('sites').select('*').eq('phone_number', MOCK_PHONE);
    if (sites && sites.length > 0) {
        originalLog(`\n🎉 Webpage created! Domain: ${sites[0].custom_domain}`);
        // Simulate Combined Checkout Confirmation
        originalLog('\n💳 Simulating Unified AutoPay & Registration Checkout Payment...');
        const confirmRes = await server.inject({
            method: 'POST',
            url: '/pay/confirm',
            payload: {
                type: 'subscription',
                siteId: sites[0].id,
                domain: 'automationbakers.com',
                addon: '500',
                name: 'Auto Tester',
                email: 'tester@grayarc.com',
                address1: '123 Mumbai',
                city: 'Mumbai',
                state: 'Maharashtra',
                postalCode: '400001'
            }
        });
        originalLog(`Payment Confirmation code: ${confirmRes.statusCode}`);
        const { data: updated } = await supabase.from('sites').select('*').eq('id', sites[0].id);
        originalLog(`\n📝 Status: Domain='${updated?.[0]?.data?.domainStatus}' Billing='${updated?.[0]?.data?.billingStatus}'`);
    }
    else {
        originalLog('\n❌ Site generation failed.');
    }
    process.exit(0);
}
run().catch(console.error);
