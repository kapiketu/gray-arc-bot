"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createDomainPaymentLink = createDomainPaymentLink;
exports.createSubscriptionLink = createSubscriptionLink;
exports.processPaymentWebhook = processPaymentWebhook;
const dotenv_1 = __importDefault(require("dotenv"));
const razorpay_1 = __importDefault(require("razorpay"));
const db_1 = require("./db");
const whatsapp_1 = require("./whatsapp");
dotenv_1.default.config();
const PORT = process.env.PORT || 3000;
// In production, this would be your public URL
const BASE_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`;
// Initialize Razorpay instance
const razorpay = new razorpay_1.default({
    key_id: process.env.RAZORPAY_KEY_ID || '',
    key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});
/**
 * Generates a link to pay for a custom domain upfront (₹500)
 */
async function createDomainPaymentLink(siteId, domain) {
    console.log(`[Billing Service] Creating Razorpay domain payment link for ${siteId} -> ${domain}`);
    try {
        const site = await db_1.db.getSite(siteId);
        const customerContact = site?.phoneNumber || "+919999999999";
        const paymentLink = await razorpay.paymentLink.create({
            amount: 50000, // Amount in paise (₹500)
            currency: "INR",
            accept_partial: false,
            description: `Domain registration for ${domain} (Site: ${siteId})`,
            customer: {
                name: "Gray Arc Customer",
                contact: customerContact,
            },
            notify: {
                sms: false,
                email: false
            },
            reminder_enable: false,
            notes: {
                siteId: siteId,
                domain: domain,
                paymentType: 'domain_purchase'
            },
            callback_url: `${BASE_URL}/site/${siteId}`,
            callback_method: 'get'
        });
        return {
            paymentUrl: paymentLink.short_url,
            paymentId: paymentLink.id
        };
    }
    catch (error) {
        console.error('[Billing Service] Error creating Razorpay link:', error);
        // Fallback to mock if API keys are missing/invalid
        const mockPaymentId = `pay_dom_${Math.random().toString(36).substring(2, 9)}`;
        return {
            paymentUrl: `${BASE_URL}/pay/domain?siteId=${siteId}&domain=${domain}&paymentId=${mockPaymentId}`,
            paymentId: mockPaymentId
        };
    }
}
/**
 * Generates a link to subscribe to the monthly plan (₹399/month) via UPI AutoPay
 */
async function createSubscriptionLink(siteId) {
    console.log(`[Billing Service] Creating subscription link for ${siteId}`);
    // To create a subscription link in Razorpay, you typically need to create a Plan first.
    // For simplicity, we are returning a mock link until a Plan ID is provided.
    const mockSubscriptionId = `sub_${Math.random().toString(36).substring(2, 9)}`;
    const mockPaymentUrl = `${BASE_URL}/pay/subscribe?siteId=${siteId}&subscriptionId=${mockSubscriptionId}`;
    return {
        paymentUrl: mockPaymentUrl,
        paymentId: mockSubscriptionId
    };
}
/**
 * Handles incoming Razorpay webhook updates to activate subscriptions / domain status
 */
async function processPaymentWebhook(payload) {
    console.log('[Billing Webhook] Received Razorpay notification:', payload.event);
    const event = payload.event;
    // Handle Domain Payment Success
    if (event === 'payment_link.paid') {
        const linkEntity = payload.payload.payment_link.entity;
        const siteId = linkEntity.notes?.siteId;
        const domain = linkEntity.notes?.domain;
        const paymentType = linkEntity.notes?.paymentType;
        if (siteId && paymentType === 'domain_purchase') {
            const site = await db_1.db.getSite(siteId);
            if (site) {
                site.customDomain = domain;
                site.domainStatus = 'paid';
                await db_1.db.saveSite(site);
                console.log(`[Billing Webhook] 🟢 Custom domain "${domain}" marked as PAID for site "${siteId}".`);
                // Send DNS instructions to the user
                await (0, whatsapp_1.sendTextMessage)(site.phoneNumber, `🎉 *Domain Purchase Successful!*\n\nYour custom domain *${domain}* is now unlocked for your website.\n\n*Final Step (DNS Setup):*\nPlease log into your domain provider (GoDaddy, Hostinger, etc.) and add this record to your DNS settings:\n\n*Type:* CNAME\n*Name:* @ (or www)\n*Value:* gray-arc-bot-production.up.railway.app\n\nOnce added, it can take up to 24 hours for your website to appear on your custom domain!`);
                return true;
            }
        }
    }
    // Handle Subscription Success
    if (event === 'subscription.charged') {
        const subEntity = payload.payload.subscription.entity;
        const siteId = subEntity.notes?.siteId;
        if (siteId) {
            const site = await db_1.db.getSite(siteId);
            if (site) {
                site.billingStatus = 'active';
                await db_1.db.saveSite(site);
                console.log(`[Billing Webhook] 🟢 Site "${siteId}" subscription set to ACTIVE.`);
                return true;
            }
        }
    }
    return false;
}
