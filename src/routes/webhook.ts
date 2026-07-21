import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import dotenv from 'dotenv';
import { db, Session } from '../services/db';
import { sendTextMessage, sendButtonMessage, sendListMessage, sendCTAUrlMessage, sendFlowMessage, sendCarouselMessage } from '../services/whatsapp';
import { generateWebsiteConfig, modifyWebsiteConfig } from '../services/ai';
import { createDomainPaymentLink, createSubscriptionLink, createCustomDomainSubscriptionLink, processPaymentWebhook } from '../services/billing';
import { checkDomainAvailability, suggestAlternativeDomains } from '../services/domains';
import crypto from 'crypto';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

dotenv.config();

const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'GrayArcWebsites2026';
const PORT = process.env.PORT || 3000;
const BASE_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
const WHATSAPP_FLOW_ID = process.env.WHATSAPP_FLOW_ID || '1732929764793467';

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

function isOffTopic(text: string): boolean {
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

function needsHumanHelp(text: string): boolean {
  const lower = text.toLowerCase();
  return HUMAN_HELP_KEYWORDS.some(kw => lower.includes(kw));
}

// ────────────────────────────────────────────────────────
// EXTRACT USER INPUT FROM ANY MESSAGE TYPE
// ────────────────────────────────────────────────────────
interface UserInput {
  from: string;
  text: string;
  type: 'text' | 'button_reply' | 'list_reply' | 'flow_reply';
  buttonId?: string;  // e.g. "btn_create_website"
  flowData?: any;     // Decoded form submission payload
  recipientPhone?: string;
}

function extractUserInput(value: any): UserInput | null {
  const message = value?.messages?.[0];
  if (!message) return null;

  const from = message.from;
  if (!from) return null;

  const recipientPhone = value?.metadata?.display_phone_number || '';

  // 1. Plain text message
  if (message.type === 'text' && message.text?.body?.trim()) {
    return {
      from,
      text: message.text.body.trim(),
      type: 'text',
      recipientPhone
    };
  }

  // 2. Button reply (user tapped a quick reply button)
  if (message.type === 'interactive' && message.interactive?.type === 'button_reply') {
    return {
      from,
      text: message.interactive.button_reply.title,
      type: 'button_reply',
      buttonId: message.interactive.button_reply.id,
      recipientPhone
    };
  }

  // 3. List reply (user selected an item from a list menu)
  if (message.type === 'interactive' && message.interactive?.type === 'list_reply') {
    return {
      from,
      text: message.interactive.list_reply.title,
      type: 'list_reply',
      buttonId: message.interactive.list_reply.id,
      recipientPhone
    };
  }

  // 4. Flow reply (user submitted a native Flow form)
  if (message.type === 'interactive' && message.interactive?.type === 'nfm_reply') {
    let flowData: any = null;
    try {
      const responseJsonStr = message.interactive.nfm_reply.response_json;
      if (responseJsonStr) {
        flowData = JSON.parse(responseJsonStr);
      }
    } catch (e) {
      console.error('[Webhook] Error parsing nfm_reply response_json:', e);
    }
    return {
      from,
      text: 'Flow submitted',
      type: 'flow_reply',
      flowData,
      recipientPhone
    };
  }

  return null;
}

// ────────────────────────────────────────────────────────
// INTERACTIVE MESSAGE HELPERS
// ────────────────────────────────────────────────────────

async function sendWelcomeMenu(to: string) {
  await sendButtonMessage(
    to,
    `Hi! Welcome to *Gray Arc* - AI Website Builder 🚀\n\nCreate a stunning business website in just 5 minutes — right here on WhatsApp!\n\nWhat would you like to do?`,
    [
      { id: 'btn_create_website', title: 'Create Website' },
      { id: 'btn_edit_website', title: 'Edit Website' }
    ],
    'Gray Arc',
    'Powered by AI • Free to start'
  );
}

async function sendCategoryList(to: string) {
  await sendListMessage(
    to,
    `Great! Let's get started.\n\nPlease select the category that best describes your business:`,
    'Choose Category',
    [{
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
    }],
    'Step 1 of 5'
  );
}

async function sendTemplateSelector(to: string, session?: any) {
  const baseUrl = process.env.PUBLIC_URL || 'https://ai.thegrayarc.com';
  const businessName = session?.answers?.businessName || 'Your Business';
  const botPhone = session?.answers?.botPhone || '919693186322';
  const catalogUrl = `${baseUrl}/catalog?phone=${to}&name=${encodeURIComponent(businessName)}&botPhone=${botPhone}`;

  await sendCTAUrlMessage(
    to,
    `Almost done! Tap the button below to browse our template catalog, custom-branded for *${businessName}*. Select your favorite design to initiate the AI build:`,
    'Browse Designs',
    catalogUrl,
    'Choose Website Design',
    'Catalog includes 10+ layouts'
  );
}

async function sendSiteReadyMenu(to: string, siteUrl: string) {
  await sendCTAUrlMessage(
    to,
    `🎉 *Congratulations! Your website is live!*\n\n🎁 Your *30-Day Free Trial* is now active!\n\nTap below to view your website:`,
    'View Live Site',
    siteUrl
  );
  await sendButtonMessage(
    to,
    `Need to make changes?`,
    [
      { id: 'btn_edit_details', title: 'Edit Details' }
    ]
  );
}

async function sendEditMenu(to: string) {
  await sendListMessage(
    to,
    `What would you like to edit on your website?`,
    'Edit Options',
    [{
      title: 'Edit Sections',
      rows: [
        { id: 'edit_name', title: 'Business Name', description: 'Change your business name' },
        { id: 'edit_about', title: 'About / Description', description: 'Update your story text' },
        { id: 'edit_services', title: 'Services / Products', description: 'Add, remove, or change items' },
        { id: 'edit_contact', title: 'Contact Details', description: 'Phone, address, hours' },
        { id: 'edit_domain', title: 'Add Custom Domain', description: 'Link your own .com / .in' }
      ]
    }]
  );
}

// Category ID → human-readable category name
function categoryFromId(id: string): string {
  const map: Record<string, string> = {
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

export default async function webhookRoutes(fastify: FastifyInstance) {
  
  // 1. Webhook Verification for Meta (GET)
  fastify.get('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const query = request.query as Record<string, string>;
    const mode = query['hub.mode'];
    const token = query['hub.verify_token'];
    const challenge = query['hub.challenge'];

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Webhook Verification] Webhook verified successfully!');
      return reply.code(200).send(challenge);
    } else {
      console.error('[Webhook Verification] Verification failed. Token mismatch.');
      return reply.code(403).send('Forbidden');
    }
  });

  // 2. Incoming Messages Webhook (POST)
  fastify.post('/webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;

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
    } catch (error) {
      console.error('[Webhook Error] Error handling chat flow:', error);
    }

    return reply.code(200).send('EVENT_RECEIVED');
  });

  // 3. Razorpay Webhook (POST)
  fastify.post('/razorpay-webhook', async (request: FastifyRequest, reply: FastifyReply) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = request.headers['x-razorpay-signature'] as string;
    
    if (!secret || !signature) {
      return reply.code(400).send('Missing secret or signature');
    }

    try {
      const bodyString = JSON.stringify(request.body);
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(bodyString)
        .digest('hex');

      if (expectedSignature !== signature) {
        return reply.code(400).send('Invalid signature');
      }

      // Valid webhook
      const payload = request.body as any;
      processPaymentWebhook(payload);

      return reply.code(200).send({ status: 'ok' });
    } catch (error) {
      console.error('[Razorpay Webhook Error]', error);
      return reply.code(500).send('Internal Server Error');
    }
  });
}

// ────────────────────────────────────────────────────────
// CORE CHAT FLOW — Interactive Menus + Text Input
// ────────────────────────────────────────────────────────

async function handleChatFlow(input: UserInput) {
  const { from, text, type, buttonId, flowData } = input;
  let session = await db.getSession(from);
  const existingSite = await db.getSiteByPhone(from);

  // ─── HANDLE FLOW FORM SUBMISSION ───
  if (type === 'flow_reply') {
    if (!session || session.step !== 'AWAITING_FLOW_DATA') {
      await sendTextMessage(from, `Something went wrong. Type *'reset'* to start over.`);
      return;
    }

    if (!flowData) {
      await sendTextMessage(from, `Failed to read form submission. Type *'reset'* to try again.`);
      return;
    }

    // Save all form responses directly to the session answers!
    session.answers.category = flowData.category || 'Professional Services';
    session.answers.businessName = flowData.business_name || 'My Business';
    session.answers.about = flowData.about || 'A premium local business.';
    session.answers.services = flowData.services || '';
    session.answers.email = flowData.email || '';
    session.answers.phone = flowData.phone || from;
    session.answers.contact = `📍 Address: ${flowData.address || 'Global'}\n📞 Phone: ${flowData.phone || from}\n📧 Email: ${flowData.email || ''}`;
    
    session.answers.botPhone = input.recipientPhone || '919693186322';
    
    // Skip template selection — AI auto-selects the best design based on industry
    session.step = 'AWAITING_DOMAIN_CHOICE';
    session.lastActive = new Date().toISOString();
    await db.saveSession(session);

    // Go directly to hosting options
    await sendButtonMessage(
      from,
      `✅ *Details received!*\n\nThe AI will automatically design the best layout for *${session.answers.businessName}* based on your industry.\n\nHow would you like to host your website?`,
      [
        { id: 'host_buy_custom', title: 'Buy New Domain' },
        { id: 'host_point_custom', title: 'Connect My Domain' },
        { id: 'host_free', title: 'Free Subdomain' }
      ],
      'Hosting Option',
      'Buy new domain: ₹500 one-time'
    );
    return;
  }

  // ─── HUMAN / DEVELOPER FALLBACK ───
  if (type === 'text' && needsHumanHelp(text)) {
    await sendTextMessage(
      from,
      `It looks like you might need help building your website, or you are looking for a fully custom website!\n\nYou can talk directly to our developer:\n\n👤 *Kapil*\n📞 +91 9693186322\n🌐 www.thegrayarc.com\n\nThey will be happy to assist you with a custom website development! 😊`
    );
    return;
  }

  // ─── HANDLE BUTTON / LIST REPLIES BY ID ───
  if (type === 'button_reply' || type === 'list_reply') {

    // Welcome menu: Create Website
    if (buttonId === 'btn_create_website') {
      if (existingSite) {
        await sendTextMessage(from, `You already have a website! Type *'reset'* first to delete it and start fresh.`);
        return;
      }
      const newSession: Session = {
        phoneNumber: from,
        step: 'AWAITING_FLOW_DATA',
        answers: {},
        lastActive: new Date().toISOString()
      };
      await db.saveSession(newSession);
      
      try {
        await sendFlowMessage(
          from,
          `Let's build your website! Tap the button below to fill out your business details in one go:`,
          'Submit Details',
          WHATSAPP_FLOW_ID,
          `flow_token_${Date.now()}`,
          'WELCOME_SCREEN',
          'Website Builder'
        );
      } catch (flowError: any) {
        console.error('[Flow Error] Failed to send Flow message, falling back to step-by-step chat flow:', flowError);
        const errorData = flowError.response?.data || { message: flowError.message };
        
        // Update session back to category list step
        newSession.step = 'AWAITING_CATEGORY';
        await db.saveSession(newSession);
        
        await sendTextMessage(
          from, 
          `⚠️ *WhatsApp Form error:*\n\n*Error details from Meta:* \`\`\`${JSON.stringify(errorData, null, 2)}\`\`\`\n\nNo worries! Let's set up your website step-by-step instead:`
        );
        await sendCategoryList(from);
      }
      return;
    }

    // Welcome menu: Edit Website
    if (buttonId === 'btn_edit_website') {
      if (!existingSite) {
        await sendTextMessage(from, `You don't have a website yet. Let's create one first!`);
        await sendWelcomeMenu(from);
        return;
      }
      await sendEditMenu(from);
      return;
    }

    // Alternative domain button selection
    if (buttonId?.startsWith('alt_dom:')) {
      if (!session) return;
      const selectedDomain = buttonId.replace('alt_dom:', '');
      
      await sendTextMessage(from, `🔍 Checking availability for *${selectedDomain}*...`);
      const checkResult = await checkDomainAvailability(selectedDomain);
      if (checkResult.available) {
        session.answers.customDomainRequested = selectedDomain;
        session.answers.domainPrice = checkResult.price || 500;
        await sendTextMessage(from, `✅ *${selectedDomain}* is available for *₹${checkResult.price || 500}*!`);
        await buildAndPublishSite(from, session, true);
      } else {
        await sendTextMessage(from, `❌ Sorry, *${selectedDomain}* is no longer available. Please type another domain name to search:`);
      }
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
      await db.saveSession(session);
      await sendTextMessage(from, `Got it: *${categoryName}* ✅\n\nNow, *what is the name of your business?*\n\n(e.g., Sweet Treats Bakery)`);
      return;
    }

    // Legacy template selection — auto-redirect to hosting (template step removed)
    if (buttonId && buttonId.startsWith('tpl_')) {
      if (!session) {
        await sendTextMessage(from, `Something went wrong. Type *'reset'* to start over.`);
        return;
      }
      // Skip template, go directly to domain choice
      session.step = 'AWAITING_DOMAIN_CHOICE';
      session.lastActive = new Date().toISOString();
      await db.saveSession(session);

      await sendButtonMessage(
        from,
        `✅ *Great!* The AI will auto-design the best layout for *${session.answers.businessName || 'your business'}*.\n\nHow would you like to host your website?`,
        [
          { id: 'host_buy_custom', title: 'Buy New Domain' },
          { id: 'host_point_custom', title: 'Connect My Domain' },
          { id: 'host_free', title: 'Free Subdomain' }
        ],
        'Hosting Option',
        'Buy new domain: ₹500 one-time'
      );
      return;
    }

    // Hosting choice - Buy new custom domain
    if (buttonId === 'host_buy_custom' || buttonId === 'host_custom') {
      if (!session) return;
      session.answers.domainType = 'buy';
      session.step = 'AWAITING_DOMAIN_NAME';
      session.lastActive = new Date().toISOString();
      await db.saveSession(session);
      await sendTextMessage(from, `Please type the *exact custom domain name* you want to buy (e.g., mybakery.in or fitnessclub.com):`);
      return;
    }

    // Hosting choice - Connect existing owned domain
    if (buttonId === 'host_point_custom') {
      if (!session) return;
      session.answers.domainType = 'point';
      session.step = 'AWAITING_DOMAIN_NAME';
      session.lastActive = new Date().toISOString();
      await db.saveSession(session);
      await sendTextMessage(from, `Please type the *exact domain name* you already own that you want to connect (e.g., mybakery.com):`);
      return;
    }

    if (buttonId === 'host_free') {
      if (!session) return;
      await buildAndPublishSite(from, session, false);
      return;
    }

    // Post-publish: View Site
    if (buttonId === 'btn_view_site') {
      if (existingSite) {
        const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
        await sendCTAUrlMessage(from, `Tap below to open your website:`, 'View Live Site', siteUrl);
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
      await sendTextMessage(from, `ℹ️ *Nature Portfolio* is currently the only active design style to guarantee top-tier aesthetic and mobile optimization.`);
      return;
    }

    // Edit menu selections
    if (buttonId === 'edit_name') {
      const editSession: Session = { phoneNumber: from, step: 'EDIT_NAME', answers: {}, lastActive: new Date().toISOString() };
      await db.saveSession(editSession);
      await sendTextMessage(from, `Type your new business name:`);
      return;
    }
    if (buttonId === 'edit_about') {
      const editSession: Session = { phoneNumber: from, step: 'EDIT_ABOUT', answers: {}, lastActive: new Date().toISOString() };
      await db.saveSession(editSession);
      await sendTextMessage(from, `Type your updated business description:`);
      return;
    }
    if (buttonId === 'edit_services') {
      const editSession: Session = { phoneNumber: from, step: 'EDIT_SERVICES', answers: {}, lastActive: new Date().toISOString() };
      await db.saveSession(editSession);
      await sendTextMessage(from, `List your updated services/products with prices (one per line):\n\ne.g.\nChocolate Cake - ₹499\nCroissant - ₹99`);
      return;
    }
    if (buttonId === 'edit_contact') {
      const editSession: Session = { phoneNumber: from, step: 'EDIT_CONTACT', answers: {}, lastActive: new Date().toISOString() };
      await db.saveSession(editSession);
      await sendTextMessage(from, `Type your updated contact details (address, phone, hours):`);
      return;
    }
    if (buttonId === 'edit_domain') {
      const editSession: Session = { phoneNumber: from, step: 'AWAITING_DOMAIN_NAME', answers: {}, lastActive: new Date().toISOString() };
      await db.saveSession(editSession);
      await sendTextMessage(from, `Please type the domain name you want (e.g., mybakery.in):`);
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
        const newSession: Session = {
          phoneNumber: from,
          step: 'AWAITING_DOMAIN_NAME',
          answers: {},
          lastActive: new Date().toISOString()
        };
        await db.saveSession(newSession);
        await sendTextMessage(from, `Great! Let's link a custom domain to your website.\n\nPlease type the domain name you want (e.g., mybakery.in or fitnessclub.com):`);
        return;
      }

      // Shortcut: Reset
      if (text.toLowerCase() === 'reset') {
        await db.deleteSite(existingSite.id);
        await sendTextMessage(from, `🗑️ Your website has been deleted. Send *Hi* to create a new one!`);
        return;
      }
      
      // Generic greeting → show interactive welcome back menu
      const greetings = ['hi', 'hello', 'hey', 'help', 'menu'];
      if (greetings.includes(text.toLowerCase().trim())) {
        const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
        await sendCTAUrlMessage(
          from,
          `Welcome back to *Gray Arc*! 🌟\n\nYour website is live. Tap below to view it:`,
          'View Live Site',
          siteUrl
        );
        await sendButtonMessage(
          from,
          `Need to make changes?`,
          [
            { id: 'btn_edit_details', title: 'Edit Details' }
          ]
        );
        return;
      }

      // ❌ Off-topic detection
      if (isOffTopic(text)) {
        await sendTextMessage(
          from,
          `I can only assist you with modifying your website (e.g., changing text, adding products, updating contact details). Please tell me what you'd like to change.`
        );
        return;
      }

      // 🤖 AI-POWERED EDITING (free-text edits)
      await sendTextMessage(from, '🔄 Processing your edit request...');
      
      try {
        const editResult = await modifyWebsiteConfig(existingSite, text);
        
        if (editResult.success && Object.keys(editResult.updatedConfig).length > 0) {
          const updatedSite = { ...existingSite, ...editResult.updatedConfig };
          await db.saveSite(updatedSite);
          
          const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
          await sendTextMessage(
            from,
            `${editResult.summary}\n\n🔗 See the changes live: ${siteUrl}\n\n_Send another edit or type *'Help'* for more options._`
          );
        } else {
          await sendTextMessage(from, editResult.summary);
        }
      } catch (error) {
        console.error('[Webhook] Edit error:', error);
        await sendTextMessage(from, '❌ Sorry, something went wrong while processing your edit. Please try again.');
      }
      return;
    }

    // Reset keyword for users with no site
    if (text.toLowerCase() === 'reset') {
      await db.deleteSession(from);
      await sendTextMessage(from, `Session has been reset. Type anything to start again!`);
      return;
    }

    // ─── NEW USER: Show interactive welcome menu ───
    await sendWelcomeMenu(from);
    return;
  }

  // Handle session reset during onboarding
  if (text.toLowerCase() === 'reset') {
    await db.deleteSession(from);
    await sendTextMessage(from, `We have reset your onboarding process. Type anything to start a fresh build!`);
    return;
  }

  session.lastActive = new Date().toISOString();

  // ─── ONBOARDING STEPS (Text input responses) ───
  switch (session.step) {
    
    case 'AWAITING_FLOW_DATA':
      await sendFlowMessage(
        from,
        `Please use the form to enter your details at once. Tap the button below to open the form:`,
        'Submit Details',
        WHATSAPP_FLOW_ID,
        `flow_token_${Date.now()}`,
        'WELCOME_SCREEN',
        'Website Builder'
      );
      break;
    
    case 'AWAITING_CATEGORY':
      // User typed category as text instead of using the list menu
      session.answers.category = text;
      session.step = 'AWAITING_NAME';
      await db.saveSession(session);
      await sendTextMessage(from, `Got it: *${text}* ✅\n\nNow, *what is the name of your business?*\n\n(e.g., Sweet Treats Bakery)`);
      break;

    case 'AWAITING_NAME':
      session.answers.businessName = text;
      session.step = 'AWAITING_ABOUT';
      await db.saveSession(session);
      await sendTextMessage(
        from,
        `Nice name: *${text}* ✅\n\nPlease provide a *short description of your business*. Tell us what makes you unique!\n\n(e.g., 'We bake fresh organic sourdough bread, birthday cakes, and pastries daily since 2018.')`
      );
      break;

    case 'AWAITING_ABOUT':
      session.answers.about = text;
      session.step = 'AWAITING_SERVICES';
      await db.saveSession(session);
      await sendTextMessage(
        from,
        `Perfect ✅\n\nNext, *list your top 3 to 5 services or products with their prices*. Write each in a new line like this:\n\nChocolate Cake - ₹499\nCroissant - ₹99\nApple Pie - ₹299`
      );
      break;

    case 'AWAITING_SERVICES':
      session.answers.services = text;
      session.step = 'AWAITING_CONTACT';
      await db.saveSession(session);
      await sendTextMessage(
        from,
        `Got the services ✅\n\nNext, please type your *business contact details* (such as your address, phone number, and operating hours).\n\n(e.g., '123 Bakers Street, Mumbai\n📞 +91 98765 43210\n🕐 Monday - Saturday: 10 AM - 8 PM')`
      );
      break;

    case 'AWAITING_CONTACT':
      session.answers.contact = text;
      // Skip template selection — AI auto-selects the best design
      session.step = 'AWAITING_DOMAIN_CHOICE';
      await db.saveSession(session);
      await sendButtonMessage(
        from,
        `✅ *Details received!*\n\nThe AI will automatically design the best layout for *${session.answers.businessName || 'your business'}*.\n\nHow would you like to host your website?`,
        [
          { id: 'host_buy_custom', title: 'Buy New Domain' },
          { id: 'host_point_custom', title: 'Connect My Domain' },
          { id: 'host_free', title: 'Free Subdomain' }
        ],
        'Hosting Option',
        'Buy new domain: ₹500 one-time'
      );
      break;

    case 'AWAITING_TEMPLATE':
      // Legacy fallback — users with stuck sessions skip straight to hosting
      session.step = 'AWAITING_DOMAIN_CHOICE';
      await db.saveSession(session);
      await sendButtonMessage(
        from,
        `✅ *No need to choose a template!* The AI will auto-design the best layout for *${session.answers.businessName || 'your business'}*.\n\nHow would you like to host your website?`,
        [
          { id: 'host_buy_custom', title: 'Buy New Domain' },
          { id: 'host_point_custom', title: 'Connect My Domain' },
          { id: 'host_free', title: 'Free Subdomain' }
        ],
        'Hosting Option',
        'Buy new domain: ₹500 one-time'
      );
      break;

    case 'AWAITING_DOMAIN_CHOICE':
      if (text === '1' || text.toLowerCase().includes('custom')) {
        session.step = 'AWAITING_DOMAIN_NAME';
        await db.saveSession(session);
        await sendTextMessage(
          from,
          `Excellent choice! Please type the *exact custom domain name* you want to purchase (e.g., sweet-treats.in or mybakery.com):`
        );
      } else if (text === '2' || text.toLowerCase().includes('free')) {
        await buildAndPublishSite(from, session, false);
      } else {
        await sendButtonMessage(
          from,
          `Please choose a hosting option:`,
          [
            { id: 'host_custom', title: 'Custom Domain' },
            { id: 'host_free', title: 'Free Subdomain' }
          ]
        );
      }
      break;

    case 'AWAITING_DOMAIN_NAME':
      // Clean domain input (strip protocol, www., and trailing paths)
      const cleanedDomain = text.toLowerCase().trim()
        .replace(/^https?:\/\//i, '')
        .replace(/^www\./i, '')
        .split('/')[0];
      
      const domainRegex = /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}$/i;
      if (!domainRegex.test(cleanedDomain)) {
        await sendTextMessage(from, `❌ Invalid domain format. Please type a valid domain name (e.g. mybakery.com or fitnessclub.in):`);
        break;
      }

      const isPointed = session.answers.domainType === 'point';
      if (isPointed) {
        session.answers.customDomainRequested = cleanedDomain;
        session.answers.domainPrice = 0;
        await sendTextMessage(from, `✅ Domain *${cleanedDomain}* registered for connection!`);
        await buildAndPublishSite(from, session, true);
        break;
      }

      await sendTextMessage(from, `🔍 Checking availability for *${cleanedDomain}*...`);
      const checkResult = await checkDomainAvailability(cleanedDomain);
      if (!checkResult.available) {
        const alternatives = await suggestAlternativeDomains(cleanedDomain);
        const buttonAlts = alternatives.filter(d => d.length <= 20).slice(0, 3);
        
        if (buttonAlts.length > 0) {
          const buttons = buttonAlts.map(d => ({ id: `alt_dom:${d}`, title: d }));
          await sendButtonMessage(
            from,
            `❌ *${cleanedDomain}* is already taken.\nReason: *${checkResult.reason || 'Not available'}*\n\n💡 Tap one of these available alternatives to choose it instantly, or type a new domain to search:`,
            buttons,
            'Domain Options'
          );
        } else {
          let altMsg = '';
          if (alternatives.length > 0) {
            altMsg = `\n\n💡 *Available Alternatives:*\n` + alternatives.map(d => `👉 *${d}*`).join('\n');
          }
          await sendTextMessage(
            from,
            `❌ *${cleanedDomain}* is already taken or invalid.\nReason: *${checkResult.reason || 'Not available'}*${altMsg}\n\nPlease type another domain name to search:`
          );
        }
        break;
      }
      
      const price = checkResult.price || 500;
      session.answers.customDomainRequested = cleanedDomain;
      session.answers.domainPrice = price;
      await sendTextMessage(from, `✅ *${cleanedDomain}* is available for *₹${price}*!`);
      await buildAndPublishSite(from, session, true);
      break;

    // ─── EDIT STEPS (for existing sites) ───
    case 'EDIT_NAME':
      if (existingSite) {
        existingSite.businessName = text;
        await db.saveSite(existingSite);
        await db.deleteSession(from);
        const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
        await sendTextMessage(from, `✅ Business name updated to *${text}*!\n\n🔗 ${siteUrl}`);
      }
      break;

    case 'EDIT_ABOUT':
      if (existingSite) {
        existingSite.aboutText = text;
        existingSite.storyContent = text;
        await db.saveSite(existingSite);
        await db.deleteSession(from);
        const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
        await sendTextMessage(from, `✅ Description updated!\n\n🔗 ${siteUrl}`);
      }
      break;

    case 'EDIT_SERVICES':
      if (existingSite) {
        // Use AI to parse service text into structured format, or do simple fallback
        await sendTextMessage(from, '🔄 Updating your services...');
        try {
          const editResult = await modifyWebsiteConfig(existingSite, `Update my services to: ${text}`);
          if (editResult.success && Object.keys(editResult.updatedConfig).length > 0) {
            const updatedSite = { ...existingSite, ...editResult.updatedConfig };
            await db.saveSite(updatedSite);
            const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
            await sendTextMessage(from, `✅ Services updated!\n\n🔗 ${siteUrl}`);
          } else {
            await sendTextMessage(from, editResult.summary);
          }
        } catch (error) {
          await sendTextMessage(from, '❌ Failed to update services. Please try again.');
        }
        await db.deleteSession(from);
      }
      break;

    case 'EDIT_CONTACT':
      if (existingSite) {
        // Direct parsing — no AI needed for contact details
        const lines = text.split('\n').map((l: string) => l.trim()).filter((l: string) => l.length > 0);
        
        // Extract phone number (digits with optional + prefix)
        const phoneMatch = text.match(/[\+]?[\d\s\-]{7,15}/);
        if (phoneMatch) {
          existingSite.contactDetails.phone = phoneMatch[0].trim();
        }

        // Remaining lines → address and hours
        const nonPhoneLines = lines.filter((l: string) => !l.match(/^[\+]?[\d\s\-]{7,15}$/));
        if (nonPhoneLines.length >= 2) {
          existingSite.contactDetails.address = nonPhoneLines[0];
          existingSite.contactDetails.hours = nonPhoneLines.slice(1).join(', ');
        } else if (nonPhoneLines.length === 1) {
          existingSite.contactDetails.address = nonPhoneLines[0];
        }

        await db.saveSite(existingSite);
        await db.deleteSession(from);
        const siteUrl = `${BASE_URL}/site/${existingSite.id}`;
        await sendTextMessage(from, `✅ Contact details updated!\n\n📞 ${existingSite.contactDetails.phone}\n📍 ${existingSite.contactDetails.address}\n🕐 ${existingSite.contactDetails.hours}\n\n🔗 ${siteUrl}`);
      }
      break;

    default:
      await db.deleteSession(from);
      await sendTextMessage(from, `Oops, something went wrong. Let's start fresh.`);
      await sendWelcomeMenu(from);
      break;
  }
}

// ────────────────────────────────────────────────────────
// BUILD & PUBLISH WEBSITE
// ────────────────────────────────────────────────────────

async function buildAndPublishSite(from: string, session: Session, isCustomDomain: boolean) {
  await sendTextMessage(from, `🛠️ *AI is now designing your website...*\nThis takes about 45-60 seconds to ensure a verified, flawless build. Please wait.`);

  try {
    const siteConfig = await generateWebsiteConfig(
      session.answers.phone || from,
      session.answers.businessName || 'My Business',
      session.answers.category || 'Local Shop',
      session.answers.about || 'A premium local business.',
      session.answers.services || '',
      session.answers.contact || ''
    );
    
    // Pre-generate and cache the logo image using Pollinations AI so it loads instantly for the user
    const logoPrompt = `minimalist professional logo icon for ${session.answers.businessName || 'Business'} ${session.answers.category || ''} business, clean vector style, transparent background, no text, single icon`;
    const logoUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(logoPrompt)}?width=512&height=512&nologo=true`;
    console.log(`[Logo Generator] Generating logo at: ${logoUrl}`);
    try {
      await axios.get(logoUrl, { timeout: 15000 });
      console.log(`[Logo Generator] Logo successfully generated and cached!`);
    } catch (e: any) {
      console.warn(`[Logo Generator] Warning: logo generation timed out or failed, but continuing:`, e.message);
    }

    // Apply selected template or auto-match it using metadata.json suitability mapping
    let selectedTemplate = session.answers.template;
    if (!selectedTemplate) {
      try {
        const templatesDir = path.join(__dirname, '../../templates');
        if (fs.existsSync(templatesDir)) {
          const folders = fs.readdirSync(templatesDir).filter(f => fs.statSync(path.join(templatesDir, f)).isDirectory());
          const categoryLower = (session.answers.category || '').toLowerCase();
          
          for (const folder of folders) {
            const metaPath = path.join(templatesDir, folder, 'metadata.json');
            if (fs.existsSync(metaPath)) {
              const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
              const industries = meta.industries || meta.suitable_business_categories;
              if (Array.isArray(industries)) {
                const match = industries.some((ind: string) => categoryLower.includes(ind.toLowerCase()));
                if (match) {
                  selectedTemplate = folder;
                  console.log(`[Auto-Match] Category "${session.answers.category}" matched template "${folder}" via metadata.`);
                  break;
                }
              }
            }
          }
        }
      } catch (err: any) {
        console.error(`[Auto-Match] Failed to match template via metadata:`, err.message);
      }
    }

    siteConfig.template = selectedTemplate || 'GA001';

    await db.saveSite(siteConfig);
    await db.deleteSession(from);

    const subdomainUrl = `${BASE_URL}/site/${siteConfig.id}`;

    if (isCustomDomain && session.answers.customDomainRequested) {
      const targetDomain = session.answers.customDomainRequested;
      const domainPrice = session.answers.domainPrice || 500;
      const payment = await createCustomDomainSubscriptionLink(siteConfig.id, targetDomain, domainPrice);
      
      siteConfig.customDomain = targetDomain;
      siteConfig.domainStatus = 'pending_payment';
      await db.saveSite(siteConfig);

      // Send Preview Link CTA
      await sendCTAUrlMessage(
        from,
        `🎉 *Congratulations! Your website preview is ready!*\n\n🎁 Your *30-Day Free Trial* is now active on the preview link.\n\nTap below to view it:`,
        'View Preview Site',
        subdomainUrl
      );

      // Send Domain Purchase & AutoPay Subscription CTA
      const billingSummary = domainPrice > 0
        ? `To link your custom domain (*${targetDomain}*), tap below to activate:\n\n💰 *Billing Summary (1-Time Auth):*\n• Today's Payment: *₹${399 + domainPrice}* (₹${domainPrice} domain + ₹399 subscription)\n• Future Months: *₹399/month* auto-debit.`
        : `To connect your custom domain (*${targetDomain}*), tap below to activate:\n\n💰 *Billing Summary (1-Time Auth):*\n• Today's Payment: *₹399* (₹399 monthly subscription)\n• Future Months: *₹399/month* auto-debit.\n\n*(No domain registration fee since you already own it)*`;

      await sendCTAUrlMessage(
        from,
        billingSummary,
        'Pay & Activate',
        payment.paymentUrl
      );
    } else {
      const subscription = await createSubscriptionLink(siteConfig.id);

      await sendSiteReadyMenu(from, subdomainUrl);
    }

  } catch (error: any) {
    console.error('[Webhook publish error]', error);
    await sendTextMessage(from, `❌ Sorry, we encountered an error while generating your website. Please type 'reset' to start over.`);
  }
}
