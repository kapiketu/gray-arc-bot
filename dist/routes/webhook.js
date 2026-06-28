"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = webhookRoutes;
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../services/db");
const whatsapp_1 = require("../services/whatsapp");
const ai_1 = require("../services/ai");
const billing_1 = require("../services/billing");
const crypto_1 = __importDefault(require("crypto"));
dotenv_1.default.config();
const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'GrayArcWebsites2026';
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
// ────────────────────────────────────────────────────────
// OFF-TOPIC DETECTION
// ────────────────────────────────────────────────────────
const OFF_TOPIC_KEYWORDS = [
    'weather', 'cricket', 'movie', 'song', 'joke', 'news', 'stock', 'share market',
    'write a code', 'write code', 'python', 'javascript', 'java', 'coding',
    'recipe', 'poem', 'story tell', 'who is', 'president', 'prime minister',
    'calculate', 'math', 'translate', 'game', 'play', 'download',
    'bitcoin', 'crypto', 'forex', 'trading', 'ipl', 'score',
    'gpt', 'chatgpt', 'claude', 'gemini ai', 'open ai', 'artificial intelligence',
    'homework', 'assignment', 'exam', 'study', 'essay', 'summarize',
];
function isOffTopic(text) {
    const lower = text.toLowerCase();
    // If message is very long and doesn't contain website/business keywords, likely off-topic
    if (lower.length > 100 &&
        !lower.includes('website') && !lower.includes('product') && !lower.includes('business') &&
        !lower.includes('price') && !lower.includes('service') && !lower.includes('phone') &&
        !lower.includes('address') && !lower.includes('domain') && !lower.includes('heading') &&
        !lower.includes('name') && !lower.includes('email') && !lower.includes('add') &&
        !lower.includes('remove') && !lower.includes('change') && !lower.includes('update')) {
        return true;
    }
    return OFF_TOPIC_KEYWORDS.some(kw => lower.includes(kw));
}
// ────────────────────────────────────────────────────────
// HUMAN HELP DETECTION
// ────────────────────────────────────────────────────────
const HUMAN_HELP_KEYWORDS = [
    'human', 'developer', 'talk to', 'contact details', 'help me', 'stuck', 'difficulty', 'hard',
    'custom website', 'developer details', 'real person', 'customer care', 'support', 'custom dev'
];
function needsHumanHelp(text) {
    const lower = text.toLowerCase();
    return HUMAN_HELP_KEYWORDS.some(kw => lower.includes(kw));
}
async function webhookRoutes(fastify) {
    // 1. Webhook Verification for Meta (GET)
    fastify.get('/webhook', async (request, reply) => {
        const query = request.query;
        const mode = query['hub.mode'];
        const token = query['hub.verify_token'];
        const challenge = query['hub.challenge'];
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {
            console.log('[Webhook Verification] Webhook verified successfully!');
            return reply.code(200).send(challenge);
        }
        else {
            console.error('[Webhook Verification] Verification failed. Token mismatch.');
            return reply.code(403).send('Forbidden');
        }
    });
    // 2. Incoming Messages Webhook (POST)
    fastify.post('/webhook', async (request, reply) => {
        const body = request.body;
        if (body.object !== 'whatsapp_business_account') {
            return reply.code(404).send();
        }
        const entry = body.entry?.[0];
        const change = entry?.changes?.[0];
        const value = change?.value;
        const message = value?.messages?.[0];
        if (!message || message.type !== 'text') {
            return reply.code(200).send('EVENT_RECEIVED');
        }
        const from = message.from;
        const text = message.text?.body?.trim();
        if (!from || !text) {
            return reply.code(200).send('EVENT_RECEIVED');
        }
        console.log(`[Webhook Message] Received message from ${from}: "${text}"`);
        try {
            await handleChatFlow(from, text);
        }
        catch (error) {
            console.error('[Webhook Error] Error handling chat flow:', error);
        }
        return reply.code(200).send('EVENT_RECEIVED');
    });
    // 3. Razorpay Webhook (POST)
    fastify.post('/razorpay-webhook', async (request, reply) => {
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
        const signature = request.headers['x-razorpay-signature'];
        if (!secret || !signature) {
            return reply.code(400).send('Missing secret or signature');
        }
        try {
            const bodyString = JSON.stringify(request.body);
            const expectedSignature = crypto_1.default
                .createHmac('sha256', secret)
                .update(bodyString)
                .digest('hex');
            if (expectedSignature !== signature) {
                return reply.code(400).send('Invalid signature');
            }
            // Valid webhook
            const payload = request.body;
            (0, billing_1.processPaymentWebhook)(payload);
            return reply.code(200).send({ status: 'ok' });
        }
        catch (error) {
            console.error('[Razorpay Webhook Error]', error);
            return reply.code(500).send('Internal Server Error');
        }
    });
}
// ────────────────────────────────────────────────────────
// CORE CHAT FLOW — Default Assistant
// ────────────────────────────────────────────────────────
async function handleChatFlow(from, text) {
    let session = await db_1.db.getSession(from);
    const existingSite = await db_1.db.getSiteByPhone(from);
    // ─── HUMAN / DEVELOPER FALLBACK ───
    if (needsHumanHelp(text)) {
        await (0, whatsapp_1.sendTextMessage)(from, `It looks like you might need help building your website, or you are looking for a fully custom website!\n\nYou can talk directly to our developer:\n\n👤 *Kapil*\n📞 +91 9693186322\n🌐 www.thegrayarc.com\n\nThey will be happy to assist you with a custom website development! 😊`);
        return;
    }
    // ─── RETURNING USER (already has a website) ───
    if (!session) {
        if (existingSite) {
            // Shortcut: Add Domain
            if (text.toLowerCase() === 'add domain' || text.toLowerCase() === '1') {
                const newSession = {
                    phoneNumber: from,
                    step: 'AWAITING_DOMAIN_NAME',
                    answers: {},
                    lastActive: new Date().toISOString()
                };
                await db_1.db.saveSession(newSession);
                await (0, whatsapp_1.sendTextMessage)(from, `Great! Let's link a custom domain to your website.\n\nPlease type the domain name you want (e.g., mybakery.in or fitnessclub.com):`);
                return;
            }
            // Shortcut: Reset
            if (text.toLowerCase() === 'reset') {
                await db_1.db.deleteSite(existingSite.id);
                await (0, whatsapp_1.sendTextMessage)(from, `🗑️ Your website has been deleted. Send *Hi* to create a new one!`);
                return;
            }
            // Generic greeting → show menu
            const greetings = ['hi', 'hello', 'hey', 'help', 'menu'];
            if (greetings.includes(text.toLowerCase().trim())) {
                const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
                await (0, whatsapp_1.sendTextMessage)(from, `Welcome back to **Gray Arc**! 🌟\n\nYour website is live at:\n🔗 ${siteUrl}\n\n✏️ *Edit your website* — just tell me what to change! For example:\n• "Change phone number to 9876543210"\n• "Add product: Vanilla Cake - ₹450"\n• "Remove Croissant"\n• "Change heading to Best Bakery in Town"\n• "Update address to MG Road, Bangalore"\n\n🔧 *Other options:*\n• Type *'Add Domain'* to link a custom domain\n• Type *'Reset'* to start fresh`);
                return;
            }
            // ❌ Off-topic detection
            if (isOffTopic(text)) {
                await (0, whatsapp_1.sendTextMessage)(from, `I can only assist you with modifying your website (e.g., changing text, adding products, updating contact details). Please tell me what you'd like to change.`);
                return;
            }
            // 🤖 AI-POWERED EDITING
            await (0, whatsapp_1.sendTextMessage)(from, '🔄 Processing your edit request...');
            try {
                const editResult = await (0, ai_1.modifyWebsiteConfig)(existingSite, text);
                if (editResult.success && Object.keys(editResult.updatedConfig).length > 0) {
                    const updatedSite = { ...existingSite, ...editResult.updatedConfig };
                    await db_1.db.saveSite(updatedSite);
                    const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
                    await (0, whatsapp_1.sendTextMessage)(from, `${editResult.summary}\n\n🔗 See the changes live: ${siteUrl}\n\n_Send another edit or type *'Help'* for more options._`);
                }
                else {
                    await (0, whatsapp_1.sendTextMessage)(from, editResult.summary);
                }
            }
            catch (error) {
                console.error('[Webhook] Edit error:', error);
                await (0, whatsapp_1.sendTextMessage)(from, '❌ Sorry, something went wrong while processing your edit. Please try again.');
            }
            return;
        }
        // Reset keyword for users with no site
        if (text.toLowerCase() === 'reset') {
            await db_1.db.deleteSession(from);
            await (0, whatsapp_1.sendTextMessage)(from, `Session has been reset. Type anything to start again!`);
            return;
        }
        // ─── NEW USER: Start onboarding ───
        const newSession = {
            phoneNumber: from,
            step: 'AWAITING_CATEGORY',
            answers: {},
            lastActive: new Date().toISOString()
        };
        await db_1.db.saveSession(newSession);
        await (0, whatsapp_1.sendTextMessage)(from, `Hi! Welcome to **Gray Arc** - AI Website Builder. 🚀\n\nLet's create a premium business website for you in just 5 minutes!\n\nFirst, **what is your business category?** (e.g., Bakery, Beauty Salon, Dental Clinic, Gym, Travel Agency)`);
        return;
    }
    // Handle session reset during onboarding
    if (text.toLowerCase() === 'reset') {
        await db_1.db.deleteSession(from);
        await (0, whatsapp_1.sendTextMessage)(from, `We have reset your onboarding process. Type anything to start a fresh build!`);
        return;
    }
    session.lastActive = new Date().toISOString();
    // ─── ONBOARDING STEPS ───
    switch (session.step) {
        case 'AWAITING_CATEGORY':
            session.answers.category = text;
            session.step = 'AWAITING_NAME';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Got it: *${text}*.\n\nNow, **what is the name of your business?** (e.g., Sweet Treats Bakery)`);
            break;
        case 'AWAITING_NAME':
            session.answers.businessName = text;
            session.step = 'AWAITING_ABOUT';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Nice name: *${text}*.\n\nPlease provide a **short description of your business**. Tell us what makes you unique! (e.g., 'We bake fresh organic sourdough bread, birthday cakes, and pastries daily since 2018.')`);
            break;
        case 'AWAITING_ABOUT':
            session.answers.about = text;
            session.step = 'AWAITING_SERVICES';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Perfect.\n\nNext, **list your top 3 to 5 services or products with their prices**. Write each in a new line like this:\n\nChocolate Cake - ₹499\nCroissant - ₹99\nApple Pie - ₹299`);
            break;
        case 'AWAITING_SERVICES':
            session.answers.services = text;
            session.step = 'AWAITING_CONTACT';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Understood. Finally, please provide your **Contact Details** (e.g., Address, Phone Number, and Operating Hours). Write them down in one message.`);
            break;
        case 'AWAITING_CONTACT':
            session.answers.contact = text;
            session.step = 'AWAITING_DOMAIN_CHOICE';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `All details collected! 📝\n\nHow would you like to host your website?\n\n*1.* **Custom Domain** (e.g., yourbusiness.in) - One-time domain charge of ₹500.\n*2.* **Free Subdomain** (e.g., yourbusiness.localhost:3000) - Free 30-day trial (then ₹399/month).\n\nReply with *1* or *2*:`);
            break;
        case 'AWAITING_DOMAIN_CHOICE':
            if (text === '1') {
                session.step = 'AWAITING_DOMAIN_NAME';
                await db_1.db.saveSession(session);
                await (0, whatsapp_1.sendTextMessage)(from, `Excellent choice! Please type the **exact custom domain name** you want to purchase (e.g., sweet-treats.in or mybakery.com):`);
            }
            else if (text === '2') {
                await buildAndPublishSite(from, session, false);
            }
            else {
                await (0, whatsapp_1.sendTextMessage)(from, `Invalid choice. Please reply with *1* for Custom Domain or *2* for Free Subdomain.`);
            }
            break;
        case 'AWAITING_DOMAIN_NAME':
            session.answers.customDomainRequested = text.toLowerCase();
            await buildAndPublishSite(from, session, true);
            break;
        default:
            await db_1.db.deleteSession(from);
            await (0, whatsapp_1.sendTextMessage)(from, `Oops, something went wrong. Let's start fresh. Type anything to begin.`);
            break;
    }
}
// ────────────────────────────────────────────────────────
// BUILD & PUBLISH WEBSITE
// ────────────────────────────────────────────────────────
async function buildAndPublishSite(from, session, isCustomDomain) {
    await (0, whatsapp_1.sendTextMessage)(from, `🛠️ **AI is now designing your website...**\nThis takes about 10-15 seconds. Please wait.`);
    try {
        const siteConfig = await (0, ai_1.generateWebsiteConfig)(from, session.answers.businessName || 'My Business', session.answers.category || 'Local Shop', session.answers.about || 'A premium local business.', session.answers.services || '', session.answers.contact || '');
        await db_1.db.saveSite(siteConfig);
        await db_1.db.deleteSession(from);
        const subdomainUrl = `${BASE_URL}/site/${siteConfig.id}`;
        if (isCustomDomain && session.answers.customDomainRequested) {
            const targetDomain = session.answers.customDomainRequested;
            const payment = await (0, billing_1.createDomainPaymentLink)(siteConfig.id, targetDomain);
            siteConfig.customDomain = targetDomain;
            siteConfig.domainStatus = 'pending_payment';
            await db_1.db.saveSite(siteConfig);
            await (0, whatsapp_1.sendTextMessage)(from, `🎉 **Congratulations! Your website preview is ready!**\n\n🔗 View it here: ${subdomainUrl}\n\nTo link your custom domain (*${targetDomain}*), click this secure link to pay the ₹500 upfront domain charge:\n💳 Pay Here: ${payment.paymentUrl}\n\n*Note*: Your 30-day free trial is active on the preview link. Once domain payment succeeds, your custom domain will activate!`);
        }
        else {
            const subscription = await (0, billing_1.createSubscriptionLink)(siteConfig.id);
            await (0, whatsapp_1.sendTextMessage)(from, `🎉 **Congratulations! Your website is live!**\n\n🔗 URL: ${subdomainUrl}\n\n🎁 Your **30-Day Free Trial** is now active!\n\nTo ensure uninterrupted service after your trial ends, please set up your ₹399/month Auto-Debit mandate now (no charges today):\n💳 Setup Subscription: ${subscription.paymentUrl}\n\nIf you want to connect a custom domain later, simply reply *'Add Domain'* in this chat!`);
        }
    }
    catch (error) {
        console.error('[Webhook publish error]', error);
        await (0, whatsapp_1.sendTextMessage)(from, `❌ Sorry, we encountered an error while generating your website. Please type 'reset' to start over.`);
    }
}
