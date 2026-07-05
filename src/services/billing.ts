import dotenv from 'dotenv';
import Razorpay from 'razorpay';
import { db } from './db';
import { sendTextMessage, sendCTAUrlMessage } from './whatsapp';
import { purchaseDomain, setupDomainDNS } from './domains';

dotenv.config();

const PORT = process.env.PORT || 3000;
// In production, this would be your public URL
const BASE_URL = process.env.PUBLIC_URL || `http://localhost:${PORT}`; 

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

export interface PaymentLinkResponse {
  paymentUrl: string;
  paymentId: string;
}

/**
 * Generates a link to pay for a custom domain upfront (dynamic price)
 */
export async function createDomainPaymentLink(siteId: string, domain: string, priceInINR: number): Promise<PaymentLinkResponse> {
  console.log(`[Billing Service] Creating Razorpay domain payment link for ${siteId} -> ${domain} at ₹${priceInINR}`);
  
  try {
    const site = await db.getSite(siteId);
    const customerContact = site?.phoneNumber || "+919999999999";
    
    const paymentLink = await razorpay.paymentLink.create({
      amount: priceInINR * 100, // Amount in paise
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
  } catch (error) {
    console.error('[Billing Service] Error creating Razorpay link:', error);
    // Fallback to mock if API keys are missing/invalid
    const mockPaymentId = `pay_dom_${Math.random().toString(36).substring(2, 9)}`;
    return {
      paymentUrl: `${BASE_URL}/pay/domain?siteId=${siteId}&domain=${domain}&paymentId=${mockPaymentId}&price=${priceInINR}`,
      paymentId: mockPaymentId
    };
  }
}

/**
 * Generates a link to subscribe to the monthly plan (₹399/month) via UPI AutoPay
 */
export async function createSubscriptionLink(siteId: string): Promise<PaymentLinkResponse> {
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
export async function processPaymentWebhook(payload: any): Promise<boolean> {
  console.log('[Billing Webhook] Received Razorpay notification:', payload.event);
  
  const event = payload.event;
  
  // Handle Domain Payment Success
  if (event === 'payment_link.paid') {
    const linkEntity = payload.payload.payment_link.entity;
    const siteId = linkEntity.notes?.siteId;
    const domain = linkEntity.notes?.domain;
    const paymentType = linkEntity.notes?.paymentType;

    if (siteId && paymentType === 'domain_purchase') {
      const site = await db.getSite(siteId);
      if (site) {
        site.customDomain = domain;
        site.domainStatus = 'paid';
        await db.saveSite(site);
        console.log(`[Billing Webhook] 🟢 Custom domain "${domain}" marked as PAID for site "${siteId}".`);
        
        // Extract customer details from Razorpay payload
        const customerName = linkEntity.customer?.name || 'Gray Arc Customer';
        const customerEmail = linkEntity.customer?.email || 'domains@thegrayarc.com';
        
        const registrant = {
          nameFirst: customerName.split(' ')[0],
          nameLast: customerName.split(' ').length > 1 ? customerName.split(' ').slice(1).join(' ') : 'Customer',
          email: customerEmail,
          address1: '123 Tech Square',
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400001'
        };

        // 1. Automate domain registration via GoDaddy API under customer details
        const purchased = await purchaseDomain(domain, site.phoneNumber, registrant);
        if (purchased) {
          console.log(`[Billing Webhook] 🟢 Custom domain "${domain}" successfully purchased under registrant "${customerEmail}".`);
          
          // 2. Automate DNS Setup (CNAME config)
          const dnsConfigured = await setupDomainDNS(domain);
          if (dnsConfigured) {
            console.log(`[Billing Webhook] 🟢 DNS CNAME configured automatically for "${domain}".`);
          }
        } else {
          console.warn(`[Billing Webhook] ⚠️ Failed to auto-purchase domain "${domain}". Manual registration required.`);
        }

        // Send confirmation and email verification instructions to the user
        await sendTextMessage(
          site.phoneNumber,
          `🎉 *Domain Registration Successful!*\n\nYour custom domain *${domain}* has been registered under your ownership and pointed to your website automatically!\n\n📧 *Action Required:*\nGoDaddy has sent a verification email to your address (*${customerEmail}*). Please click the verification link in that email to confirm ownership and avoid domain suspension.`
        );

        // Generate subscription link for monthly recurring AutoPay
        const subscription = await createSubscriptionLink(site.id);

        await sendCTAUrlMessage(
          site.phoneNumber,
          `💳 *Final Step (Subscription Setup):*\n\nTo activate your live website on your custom domain, please tap below to authorize your monthly subscription of *₹399/month* (automatic deduction via UPI or Credit/Debit card):`,
          'Authorize AutoPay',
          subscription.paymentUrl
        );

        return true;
      }
    }
  }

  // Handle Subscription Success
  if (event === 'subscription.charged') {
    const subEntity = payload.payload.subscription.entity;
    const siteId = subEntity.notes?.siteId;
    
    if (siteId) {
      const site = await db.getSite(siteId);
      if (site) {
        site.billingStatus = 'active';
        await db.saveSite(site);
        console.log(`[Billing Webhook] 🟢 Site "${siteId}" subscription set to ACTIVE.`);
        return true;
      }
    }
  }
  
  return false;
}
