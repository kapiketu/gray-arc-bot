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
const domains_1 = require("../services/domains");
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
function extractUserInput(value) {
    const message = value?.messages?.[0];
    if (!message)
        return null;
    const from = message.from;
    if (!from)
        return null;
    // 1. Plain text message
    if (message.type === 'text' && message.text?.body?.trim()) {
        return {
            from,
            text: message.text.body.trim(),
            type: 'text'
        };
    }
    // 2. Button reply (user tapped a quick reply button)
    if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
        return {
            from,
            text: message.interactive.button_reply.title,
            type: 'button_reply',
            buttonId: message.interactive.button_reply.id
        };
    }
    // 3. List reply (user selected an item from a list menu)
    if (message.type === 'interactive' && message.interactive?.type === 'list_reply') {
        return {
            from,
            text: message.interactive.list_reply.title,
            type: 'list_reply',
            buttonId: message.interactive.list_reply.id
        };
    }
    return null;
}
// ────────────────────────────────────────────────────────
// INTERACTIVE MESSAGE HELPERS
// ────────────────────────────────────────────────────────
async function sendWelcomeMenu(to) {
    await (0, whatsapp_1.sendButtonMessage)(to, `Hi! Welcome to *Gray Arc* - AI Website Builder 🚀\n\nCreate a stunning business website in just 5 minutes — right here on WhatsApp!\n\nWhat would you like to do?`, [
        { id: 'btn_create_website', title: 'Create Website' },
        { id: 'btn_edit_website', title: 'Edit Website' }
    ], 'Gray Arc', 'Powered by AI • Free to start');
}
async function sendCategoryList(to) {
    await (0, whatsapp_1.sendListMessage)(to, `Great! Let's get started.\n\nPlease select the category that best describes your business:`, 'Choose Category', [{
            title: 'Business Categories',
            rows: [
                { id: 'cat_bakery', title: 'Bakery / Cafe', description: 'Cakes, pastries, coffee shops' },
                { id: 'cat_restaurant', title: 'Restaurant / Kitchen', description: 'Dine-in, delivery, cloud kitchen' },
                { id: 'cat_salon', title: 'Salon / Spa', description: 'Hair, beauty, wellness services' },
                { id: 'cat_clinic', title: 'Clinic / Dental', description: 'Doctors, dentists, health services' },
                { id: 'cat_gym', title: 'Fitness / Gym', description: 'Gym, yoga, personal training' },
                { id: 'cat_lawyer', title: 'Lawyer / Consultant', description: 'Legal, tax, business consulting' },
                { id: 'cat_education', title: 'Education / Coaching', description: 'Tuition, coaching, courses' },
                { id: 'cat_realestate', title: 'Real Estate / Broker', description: 'Property, rentals, agents' },
                { id: 'cat_travel', title: 'Travel / Tourism', description: 'Tours, packages, travel agency' },
                { id: 'cat_other', title: 'Other Business', description: 'Any other category' }
            ]
        }], 'Step 1 of 5');
}
async function sendTemplateSelector(to) {
    await (0, whatsapp_1.sendButtonMessage)(to, `Almost done! Choose a design style for your website:`, [
        { id: 'tpl_astro', title: 'Modern Astro' },
        { id: 'tpl_classic', title: 'Premium Classic' }
    ], 'Step 5 of 5', 'You can change this anytime later');
}
async function sendSiteReadyMenu(to, siteUrl) {
    await (0, whatsapp_1.sendCTAUrlMessage)(to, `🎉 *Congratulations! Your website is live!*\n\n🎁 Your *30-Day Free Trial* is now active!\n\nTap below to view your website:`, 'View Live Site', siteUrl);
    await (0, whatsapp_1.sendButtonMessage)(to, `Need to make changes?`, [
        { id: 'btn_edit_details', title: 'Edit Details' },
        { id: 'btn_change_template', title: 'Change Template' }
    ]);
}
async function sendEditMenu(to) {
    await (0, whatsapp_1.sendListMessage)(to, `What would you like to edit on your website?`, 'Edit Options', [{
            title: 'Edit Sections',
            rows: [
                { id: 'edit_name', title: 'Business Name', description: 'Change your business name' },
                { id: 'edit_about', title: 'About / Description', description: 'Update your story text' },
                { id: 'edit_services', title: 'Services / Products', description: 'Add, remove, or change items' },
                { id: 'edit_contact', title: 'Contact Details', description: 'Phone, address, hours' },
                { id: 'edit_template', title: 'Change Template', description: 'Switch your design style' },
                { id: 'edit_domain', title: 'Add Custom Domain', description: 'Link your own .com / .in' }
            ]
        }]);
}
// Category ID → human-readable category name
function categoryFromId(id) {
    const map = {
        'cat_bakery': 'Bakery / Cafe',
        'cat_restaurant': 'Restaurant / Kitchen',
        'cat_salon': 'Salon / Spa',
        'cat_clinic': 'Clinic / Dental',
        'cat_gym': 'Fitness / Gym',
        'cat_lawyer': 'Lawyer / Consultant',
        'cat_education': 'Education / Coaching',
        'cat_realestate': 'Real Estate / Broker',
        'cat_travel': 'Travel / Tourism',
        'cat_other': 'Other Business'
    };
    return map[id] || id;
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
        // Extract input from text, button reply, or list reply
        const userInput = extractUserInput(value);
        if (!userInput) {
            return reply.code(200).send('EVENT_RECEIVED');
        }
        console.log(`[Webhook Message] Type=${userInput.type} From=${userInput.from}: "${userInput.text}" (id=${userInput.buttonId || 'n/a'})`);
        try {
            await handleChatFlow(userInput);
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
// CORE CHAT FLOW — Interactive Menus + Text Input
// ────────────────────────────────────────────────────────
async function handleChatFlow(input) {
    const { from, text, type, buttonId } = input;
    let session = await db_1.db.getSession(from);
    const existingSite = await db_1.db.getSiteByPhone(from);
    // ─── HUMAN / DEVELOPER FALLBACK ───
    if (type === 'text' && needsHumanHelp(text)) {
        await (0, whatsapp_1.sendTextMessage)(from, `It looks like you might need help building your website, or you are looking for a fully custom website!\n\nYou can talk directly to our developer:\n\n👤 *Kapil*\n📞 +91 9693186322\n🌐 www.thegrayarc.com\n\nThey will be happy to assist you with a custom website development! 😊`);
        return;
    }
    // ─── HANDLE BUTTON / LIST REPLIES BY ID ───
    if (type === 'button_reply' || type === 'list_reply') {
        // Welcome menu: Create Website
        if (buttonId === 'btn_create_website') {
            if (existingSite) {
                await (0, whatsapp_1.sendTextMessage)(from, `You already have a website! Type *'reset'* first to delete it and start fresh.`);
                return;
            }
            const newSession = {
                phoneNumber: from,
                step: 'AWAITING_CATEGORY',
                answers: {},
                lastActive: new Date().toISOString()
            };
            await db_1.db.saveSession(newSession);
            await sendCategoryList(from);
            return;
        }
        // Welcome menu: Edit Website
        if (buttonId === 'btn_edit_website') {
            if (!existingSite) {
                await (0, whatsapp_1.sendTextMessage)(from, `You don't have a website yet. Let's create one first!`);
                await sendWelcomeMenu(from);
                return;
            }
            await sendEditMenu(from);
            return;
        }
        // Category selection from list
        if (buttonId?.startsWith('cat_')) {
            if (!session || session.step !== 'AWAITING_CATEGORY') {
                // Create session if somehow missing
                session = { phoneNumber: from, step: 'AWAITING_CATEGORY', answers: {}, lastActive: new Date().toISOString() };
            }
            const categoryName = categoryFromId(buttonId);
            session.answers.category = categoryName;
            session.step = 'AWAITING_NAME';
            session.lastActive = new Date().toISOString();
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Got it: *${categoryName}* ✅\n\nNow, *what is the name of your business?*\n\n(e.g., Sweet Treats Bakery)`);
            return;
        }
        // Template selection
        if (buttonId === 'tpl_astro' || buttonId === 'tpl_classic') {
            if (!session || session.step !== 'AWAITING_TEMPLATE') {
                await (0, whatsapp_1.sendTextMessage)(from, `Something went wrong. Type *'reset'* to start over.`);
                return;
            }
            session.answers.template = buttonId === 'tpl_astro' ? 'astro' : 'classic';
            session.step = 'AWAITING_DOMAIN_CHOICE';
            session.lastActive = new Date().toISOString();
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendButtonMessage)(from, `Design selected: *${buttonId === 'tpl_astro' ? 'Modern Astro' : 'Premium Classic'}* ✅\n\nHow would you like to host your website?`, [
                { id: 'host_custom', title: 'Custom Domain' },
                { id: 'host_free', title: 'Free Subdomain' }
            ], 'Hosting Option', 'Custom domain: ₹500 one-time');
            return;
        }
        // Hosting choice
        if (buttonId === 'host_custom') {
            if (!session)
                return;
            session.step = 'AWAITING_DOMAIN_NAME';
            session.lastActive = new Date().toISOString();
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Please type the *exact custom domain name* you want (e.g., mybakery.in or fitnessclub.com):`);
            return;
        }
        if (buttonId === 'host_free') {
            if (!session)
                return;
            await buildAndPublishSite(from, session, false);
            return;
        }
        // Post-publish: View Site
        if (buttonId === 'btn_view_site') {
            if (existingSite) {
                const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
                await (0, whatsapp_1.sendCTAUrlMessage)(from, `Tap below to open your website:`, 'View Live Site', siteUrl);
            }
            return;
        }
        // Post-publish: Edit Details
        if (buttonId === 'btn_edit_details') {
            if (existingSite) {
                await sendEditMenu(from);
            }
            return;
        }
        // Post-publish: Change Template
        if (buttonId === 'btn_change_template' || buttonId === 'edit_template') {
            if (existingSite) {
                await (0, whatsapp_1.sendButtonMessage)(from, `Choose a new design style for your website:`, [
                    { id: 'switch_astro', title: 'Modern Astro' },
                    { id: 'switch_classic', title: 'Premium Classic' }
                ]);
            }
            return;
        }
        // Template switch (for existing sites)
        if (buttonId === 'switch_astro' || buttonId === 'switch_classic') {
            if (existingSite) {
                const newTemplate = buttonId === 'switch_astro' ? 'astro' : 'classic';
                existingSite.template = newTemplate;
                await db_1.db.saveSite(existingSite);
                const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
                await (0, whatsapp_1.sendTextMessage)(from, `✅ Template changed to *${newTemplate === 'astro' ? 'Modern Astro' : 'Premium Classic'}*!\n\n🔗 See it live: ${siteUrl}`);
            }
            return;
        }
        // Edit menu selections
        if (buttonId === 'edit_name') {
            const editSession = { phoneNumber: from, step: 'EDIT_NAME', answers: {}, lastActive: new Date().toISOString() };
            await db_1.db.saveSession(editSession);
            await (0, whatsapp_1.sendTextMessage)(from, `Type your new business name:`);
            return;
        }
        if (buttonId === 'edit_about') {
            const editSession = { phoneNumber: from, step: 'EDIT_ABOUT', answers: {}, lastActive: new Date().toISOString() };
            await db_1.db.saveSession(editSession);
            await (0, whatsapp_1.sendTextMessage)(from, `Type your updated business description:`);
            return;
        }
        if (buttonId === 'edit_services') {
            const editSession = { phoneNumber: from, step: 'EDIT_SERVICES', answers: {}, lastActive: new Date().toISOString() };
            await db_1.db.saveSession(editSession);
            await (0, whatsapp_1.sendTextMessage)(from, `List your updated services/products with prices (one per line):\n\ne.g.\nChocolate Cake - ₹499\nCroissant - ₹99`);
            return;
        }
        if (buttonId === 'edit_contact') {
            const editSession = { phoneNumber: from, step: 'EDIT_CONTACT', answers: {}, lastActive: new Date().toISOString() };
            await db_1.db.saveSession(editSession);
            await (0, whatsapp_1.sendTextMessage)(from, `Type your updated contact details (address, phone, hours):`);
            return;
        }
        if (buttonId === 'edit_domain') {
            const editSession = { phoneNumber: from, step: 'AWAITING_DOMAIN_NAME', answers: {}, lastActive: new Date().toISOString() };
            await db_1.db.saveSession(editSession);
            await (0, whatsapp_1.sendTextMessage)(from, `Please type the domain name you want (e.g., mybakery.in):`);
            return;
        }
        // Unknown button — ignore gracefully
        return;
    }
    // ─── TEXT MESSAGE HANDLING ───
    // ─── RETURNING USER (already has a website, no active session) ───
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
            // Generic greeting → show interactive welcome back menu
            const greetings = ['hi', 'hello', 'hey', 'help', 'menu'];
            if (greetings.includes(text.toLowerCase().trim())) {
                const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
                await (0, whatsapp_1.sendCTAUrlMessage)(from, `Welcome back to *Gray Arc*! 🌟\n\nYour website is live. Tap below to view it:`, 'View Live Site', siteUrl);
                await (0, whatsapp_1.sendButtonMessage)(from, `Need to make changes?`, [
                    { id: 'btn_edit_details', title: 'Edit Details' },
                    { id: 'btn_change_template', title: 'Change Template' }
                ]);
                return;
            }
            // ❌ Off-topic detection
            if (isOffTopic(text)) {
                await (0, whatsapp_1.sendTextMessage)(from, `I can only assist you with modifying your website (e.g., changing text, adding products, updating contact details). Please tell me what you'd like to change.`);
                return;
            }
            // 🤖 AI-POWERED EDITING (free-text edits)
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
        // ─── NEW USER: Show interactive welcome menu ───
        await sendWelcomeMenu(from);
        return;
    }
    // Handle session reset during onboarding
    if (text.toLowerCase() === 'reset') {
        await db_1.db.deleteSession(from);
        await (0, whatsapp_1.sendTextMessage)(from, `We have reset your onboarding process. Type anything to start a fresh build!`);
        return;
    }
    session.lastActive = new Date().toISOString();
    // ─── ONBOARDING STEPS (Text input responses) ───
    switch (session.step) {
        case 'AWAITING_CATEGORY':
            // User typed category as text instead of using the list menu
            session.answers.category = text;
            session.step = 'AWAITING_NAME';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Got it: *${text}* ✅\n\nNow, *what is the name of your business?*\n\n(e.g., Sweet Treats Bakery)`);
            break;
        case 'AWAITING_NAME':
            session.answers.businessName = text;
            session.step = 'AWAITING_ABOUT';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Nice name: *${text}* ✅\n\nPlease provide a *short description of your business*. Tell us what makes you unique!\n\n(e.g., 'We bake fresh organic sourdough bread, birthday cakes, and pastries daily since 2018.')`);
            break;
        case 'AWAITING_ABOUT':
            session.answers.about = text;
            session.step = 'AWAITING_SERVICES';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Perfect ✅\n\nNext, *list your top 3 to 5 services or products with their prices*. Write each in a new line like this:\n\nChocolate Cake - ₹499\nCroissant - ₹99\nApple Pie - ₹299`);
            break;
        case 'AWAITING_SERVICES':
            session.answers.services = text;
            session.step = 'AWAITING_CONTACT';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendTextMessage)(from, `Got the services ✅\n\nNext, please type your *business contact details* (such as your address, phone number, and operating hours).\n\n(e.g., '123 Bakers Street, Mumbai\n📞 +91 98765 43210\n🕐 Monday - Saturday: 10 AM - 8 PM')`);
            break;
        case 'AWAITING_CONTACT':
            session.answers.contact = text;
            session.step = 'AWAITING_TEMPLATE';
            await db_1.db.saveSession(session);
            await sendTemplateSelector(from);
            break;
        case 'AWAITING_TEMPLATE':
            // User typed template choice as text instead of using buttons
            const templateChoice = text.toLowerCase();
            if (templateChoice.includes('astro') || templateChoice.includes('modern')) {
                session.answers.template = 'astro';
            }
            else {
                session.answers.template = 'classic';
            }
            session.step = 'AWAITING_DOMAIN_CHOICE';
            await db_1.db.saveSession(session);
            await (0, whatsapp_1.sendButtonMessage)(from, `Design selected ✅\n\nHow would you like to host your website?`, [
                { id: 'host_custom', title: 'Custom Domain' },
                { id: 'host_free', title: 'Free Subdomain' }
            ], 'Hosting Option', 'Custom domain: ₹500 one-time');
            break;
        case 'AWAITING_DOMAIN_CHOICE':
            if (text === '1' || text.toLowerCase().includes('custom')) {
                session.step = 'AWAITING_DOMAIN_NAME';
                await db_1.db.saveSession(session);
                await (0, whatsapp_1.sendTextMessage)(from, `Excellent choice! Please type the *exact custom domain name* you want to purchase (e.g., sweet-treats.in or mybakery.com):`);
            }
            else if (text === '2' || text.toLowerCase().includes('free')) {
                await buildAndPublishSite(from, session, false);
            }
            else {
                await (0, whatsapp_1.sendButtonMessage)(from, `Please choose a hosting option:`, [
                    { id: 'host_custom', title: 'Custom Domain' },
                    { id: 'host_free', title: 'Free Subdomain' }
                ]);
            }
            break;
        case 'AWAITING_DOMAIN_NAME':
            // Clean domain input (strip protocol, www., and trailing paths)
            const cleanedDomain = text.toLowerCase().trim()
                .replace(/^https?:\/\//i, '')
                .replace(/^www\./i, '')
                .split('/')[0];
            await (0, whatsapp_1.sendTextMessage)(from, `🔍 Checking availability for *${cleanedDomain}*...`);
            const checkResult = await (0, domains_1.checkDomainAvailability)(cleanedDomain);
            if (!checkResult.available) {
                const alternatives = await (0, domains_1.suggestAlternativeDomains)(cleanedDomain);
                let altMsg = '';
                if (alternatives.length > 0) {
                    altMsg = `\n\n💡 *Available Alternatives:*\n` + alternatives.map(d => `👉 *${d}*`).join('\n');
                }
                await (0, whatsapp_1.sendTextMessage)(from, `❌ *${cleanedDomain}* is already taken or invalid.\nReason: *${checkResult.reason || 'Not available'}*${altMsg}\n\nPlease type another domain name to search:`);
                break;
            }
            const price = checkResult.price || 500;
            session.answers.customDomainRequested = cleanedDomain;
            session.answers.domainPrice = price;
            await (0, whatsapp_1.sendTextMessage)(from, `✅ *${cleanedDomain}* is available for *₹${price}*!`);
            await buildAndPublishSite(from, session, true);
            break;
        // ─── EDIT STEPS (for existing sites) ───
        case 'EDIT_NAME':
            if (existingSite) {
                existingSite.businessName = text;
                await db_1.db.saveSite(existingSite);
                await db_1.db.deleteSession(from);
                const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
                await (0, whatsapp_1.sendTextMessage)(from, `✅ Business name updated to *${text}*!\n\n🔗 ${siteUrl}`);
            }
            break;
        case 'EDIT_ABOUT':
            if (existingSite) {
                existingSite.aboutText = text;
                existingSite.storyContent = text;
                await db_1.db.saveSite(existingSite);
                await db_1.db.deleteSession(from);
                const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
                await (0, whatsapp_1.sendTextMessage)(from, `✅ Description updated!\n\n🔗 ${siteUrl}`);
            }
            break;
        case 'EDIT_SERVICES':
            if (existingSite) {
                // Use AI to parse service text into structured format, or do simple fallback
                await (0, whatsapp_1.sendTextMessage)(from, '🔄 Updating your services...');
                try {
                    const editResult = await (0, ai_1.modifyWebsiteConfig)(existingSite, `Update my services to: ${text}`);
                    if (editResult.success && Object.keys(editResult.updatedConfig).length > 0) {
                        const updatedSite = { ...existingSite, ...editResult.updatedConfig };
                        await db_1.db.saveSite(updatedSite);
                        const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
                        await (0, whatsapp_1.sendTextMessage)(from, `✅ Services updated!\n\n🔗 ${siteUrl}`);
                    }
                    else {
                        await (0, whatsapp_1.sendTextMessage)(from, editResult.summary);
                    }
                }
                catch (error) {
                    await (0, whatsapp_1.sendTextMessage)(from, '❌ Failed to update services. Please try again.');
                }
                await db_1.db.deleteSession(from);
            }
            break;
        case 'EDIT_CONTACT':
            if (existingSite) {
                // Direct parsing — no AI needed for contact details
                const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
                // Extract phone number (digits with optional + prefix)
                const phoneMatch = text.match(/[\+]?[\d\s\-]{7,15}/);
                if (phoneMatch) {
                    existingSite.contactDetails.phone = phoneMatch[0].trim();
                }
                // Remaining lines → address and hours
                const nonPhoneLines = lines.filter((l) => !l.match(/^[\+]?[\d\s\-]{7,15}$/));
                if (nonPhoneLines.length >= 2) {
                    existingSite.contactDetails.address = nonPhoneLines[0];
                    existingSite.contactDetails.hours = nonPhoneLines.slice(1).join(', ');
                }
                else if (nonPhoneLines.length === 1) {
                    existingSite.contactDetails.address = nonPhoneLines[0];
                }
                await db_1.db.saveSite(existingSite);
                await db_1.db.deleteSession(from);
                const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
                await (0, whatsapp_1.sendTextMessage)(from, `✅ Contact details updated!\n\n📞 ${existingSite.contactDetails.phone}\n📍 ${existingSite.contactDetails.address}\n🕐 ${existingSite.contactDetails.hours}\n\n🔗 ${siteUrl}`);
            }
            break;
        default:
            await db_1.db.deleteSession(from);
            await (0, whatsapp_1.sendTextMessage)(from, `Oops, something went wrong. Let's start fresh.`);
            await sendWelcomeMenu(from);
            break;
    }
}
// ────────────────────────────────────────────────────────
// BUILD & PUBLISH WEBSITE
// ────────────────────────────────────────────────────────
async function buildAndPublishSite(from, session, isCustomDomain) {
    await (0, whatsapp_1.sendTextMessage)(from, `🛠️ *AI is now designing your website...*\nThis takes about 10-15 seconds. Please wait.`);
    try {
        const siteConfig = await (0, ai_1.generateWebsiteConfig)(from, session.answers.businessName || 'My Business', session.answers.category || 'Local Shop', session.answers.about || 'A premium local business.', session.answers.services || '', session.answers.contact || '');
        // Apply selected template
        if (session.answers.template) {
            siteConfig.template = session.answers.template;
        }
        await db_1.db.saveSite(siteConfig);
        await db_1.db.deleteSession(from);
        const subdomainUrl = `${BASE_URL}/site/${siteConfig.id}`;
        if (isCustomDomain && session.answers.customDomainRequested) {
            const targetDomain = session.answers.customDomainRequested;
            const domainPrice = session.answers.domainPrice || 500;
            const payment = await (0, billing_1.createDomainPaymentLink)(siteConfig.id, targetDomain, domainPrice);
            siteConfig.customDomain = targetDomain;
            siteConfig.domainStatus = 'pending_payment';
            await db_1.db.saveSite(siteConfig);
            // Send Preview Link CTA
            await (0, whatsapp_1.sendCTAUrlMessage)(from, `🎉 *Congratulations! Your website preview is ready!*\n\n🎁 Your *30-Day Free Trial* is now active on the preview link.\n\nTap below to view it:`, 'View Preview Site', subdomainUrl);
            // Send Domain Purchase Payment CTA
            await (0, whatsapp_1.sendCTAUrlMessage)(from, `To link your custom domain (*${targetDomain}*), tap below to activate:\n\n💰 *Pricing Breakdown:*\n• Custom Domain: *₹${domainPrice}* (one-time)\n• Website Subscription: *₹399/month*\n\n*Note*: Once payment succeeds, your custom domain will activate automatically!`, 'Pay & Link Domain', payment.paymentUrl);
        }
        else {
            const subscription = await (0, billing_1.createSubscriptionLink)(siteConfig.id);
            await sendSiteReadyMenu(from, subdomainUrl);
        }
    }
    catch (error) {
        console.error('[Webhook publish error]', error);
        await (0, whatsapp_1.sendTextMessage)(from, `❌ Sorry, we encountered an error while generating your website. Please type 'reset' to start over.`);
    }
}
