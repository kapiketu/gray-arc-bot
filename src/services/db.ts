import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('[DB] Missing Supabase credentials in .env file!');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export interface Session {
  phoneNumber: string;
  step: 'WELCOME' | 'AWAITING_CATEGORY' | 'AWAITING_NAME' | 'AWAITING_ABOUT' | 'AWAITING_SERVICES' | 'AWAITING_CONTACT' | 'AWAITING_DOMAIN_CHOICE' | 'AWAITING_DOMAIN_NAME' | 'COMPLETED';
  answers: {
    category?: string;
    businessName?: string;
    about?: string;
    services?: string;
    contact?: string;
    customDomainRequested?: string;
  };
  lastActive: string;
}

export interface SiteProduct {
  name: string;
  price: string;
  description: string;
}

export interface SiteConfig {
  id: string; // Subdomain slug, e.g. "sweet-treats"
  phoneNumber: string;
  businessName: string;
  category: string;
  aboutText: string;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    bgColor: string;
    textColor: string;
  };
  services: SiteProduct[];
  contactDetails: {
    phone: string;
    email: string;
    address: string;
    hours: string;
  };
  // Billing & Subscriptions
  billingStatus: 'trial' | 'active' | 'past_due' | 'canceled';
  trialEndsAt: string; // ISO date string (30 days from creation)
  customDomain: string | null;
  domainStatus: 'none' | 'pending_payment' | 'paid' | 'active';
  // Generated Website Content (AI Copywriting)
  heroTitle: string;
  heroSubtitle: string;
  storyTitle: string;
  storyContent: string;
}

export const db = {
  // ──────────────────────────────────────────────────
  // SESSION METHODS
  // ──────────────────────────────────────────────────
  
  async getSession(phoneNumber: string): Promise<Session | null> {
    const { data, error } = await supabase
      .from('sessions')
      .select('data')
      .eq('phone_number', phoneNumber)
      .single();
      
    if (error || !data) return null;
    return data.data as Session;
  },

  async saveSession(session: Session): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .upsert({
        phone_number: session.phoneNumber,
        data: session,
        updated_at: new Date().toISOString()
      }, { onConflict: 'phone_number' });
      
    if (error) console.error('[DB] Error saving session:', error);
  },

  async deleteSession(phoneNumber: string): Promise<void> {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('phone_number', phoneNumber);
      
    if (error) console.error('[DB] Error deleting session:', error);
  },

  // ──────────────────────────────────────────────────
  // SITE METHODS
  // ──────────────────────────────────────────────────
  
  async getSite(id: string): Promise<SiteConfig | null> {
    const { data, error } = await supabase
      .from('sites')
      .select('data')
      .eq('id', id)
      .single();
      
    if (error || !data) return null;
    return data.data as SiteConfig;
  },

  async getSiteByPhone(phoneNumber: string): Promise<SiteConfig | null> {
    const { data, error } = await supabase
      .from('sites')
      .select('data')
      .eq('phone_number', phoneNumber)
      .single();
      
    if (error || !data) return null;
    return data.data as SiteConfig;
  },

  async getSiteByDomain(domain: string): Promise<SiteConfig | null> {
    const { data, error } = await supabase
      .from('sites')
      .select('data')
      .eq('custom_domain', domain)
      .single();
      
    if (data) return data.data as SiteConfig;
    
    // Fallback: check if it matches a subdomain (e.g. site-id.localhost)
    // We have to scan all sites for this fallback since it's not indexed nicely,
    // or just assume standard formatting. For production, we'd query better.
    const { data: allSites, error: errAll } = await supabase.from('sites').select('id, data');
    if (!errAll && allSites) {
       for (const site of allSites) {
         if (`${site.id}.localhost:3000` === domain || `${site.id}.localhost` === domain) {
           return site.data as SiteConfig;
         }
       }
    }
    
    return null;
  },

  async saveSite(site: SiteConfig): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .upsert({
        id: site.id,
        phone_number: site.phoneNumber,
        custom_domain: site.customDomain,
        data: site
      }, { onConflict: 'id' });
      
    if (error) console.error('[DB] Error saving site:', error);
  },

  async deleteSite(id: string): Promise<void> {
    const { error } = await supabase
      .from('sites')
      .delete()
      .eq('id', id);
      
    if (error) console.error('[DB] Error deleting site:', error);
  }
};
