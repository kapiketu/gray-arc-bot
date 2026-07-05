import dotenv from 'dotenv';
import axios from 'axios';
import dns from 'dns';

dotenv.config();

const GODADDY_API_KEY = process.env.GODADDY_API_KEY || '';
const GODADDY_API_SECRET = process.env.GODADDY_API_SECRET || '';
const GODADDY_ENV = process.env.GODADDY_ENV || 'ote'; // 'ote' for sandbox, 'prod' for production

const BASE_URL = GODADDY_ENV === 'prod' 
  ? 'https://api.godaddy.com' 
  : 'https://api.ote-godaddy.com';

export interface DomainCheckResult {
  available: boolean;
  price?: number; // in INR
  currency?: string;
  reason?: string;
}

/**
 * Checks if a domain is available for registration.
 * If GoDaddy API keys are not provided, it falls back to DNS resolution check.
 */
export async function checkDomainAvailability(domain: string): Promise<DomainCheckResult> {
  console.log(`[Domain Service] Checking availability for: ${domain}`);

  // Validation: basic domain regex
  const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domain)) {
    return {
      available: false,
      reason: 'Invalid domain format. Enter a domain name like mybakery.com or shop.in.'
    };
  }

  // Fallback: If GoDaddy credentials are missing, check via native DNS resolution
  if (!GODADDY_API_KEY || !GODADDY_API_SECRET) {
    console.log('[Domain Service] No GoDaddy credentials. Performing DNS Lookup fallback.');
    return new Promise((resolve) => {
      dns.resolve(domain, (err, addresses) => {
        if (err) {
          // If DNS resolve errors with ENOTFOUND or ENODATA, it's highly likely available.
          if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
            resolve({
              available: true,
              price: 500, // standard mock registration price
              currency: 'INR'
            });
          } else {
            resolve({
              available: false,
              reason: `DNS check failed: ${err.message}`
            });
          }
        } else {
          // If DNS resolved addresses, it means someone is already hosting it.
          resolve({
            available: false,
            reason: 'Domain is already registered by someone else.'
          });
        }
      });
    });
  }

  // Real API call to GoDaddy
  try {
    const response = await axios.get(`${BASE_URL}/v1/domains/available`, {
      params: { domain },
      headers: {
        Authorization: `sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}`
      }
    });

    if (response.data) {
      const data = response.data;
      // Convert price from micro-units if present (divide by 1,000,000)
      const rawPrice = data.price ? data.price / 1000000 : 500;
      
      return {
        available: data.available === true,
        price: Math.ceil(rawPrice),
        currency: data.currency || 'INR',
        reason: data.available ? undefined : 'Domain is already taken.'
      };
    }
  } catch (error: any) {
    console.error('[Domain Service] GoDaddy API Error:', error.response?.data || error.message);
  }

  // Final fallback
  return {
    available: true,
    price: 500,
    currency: 'INR'
  };
}

/**
 * Purchases a domain automatically from GoDaddy.
 * In a real production environment, you should fill in the buyer contact details.
 */
export interface RegistrantInfo {
  nameFirst: string;
  nameLast: string;
  email: string;
  address1: string;
  city: string;
  state: string;
  postalCode: string;
}

/**
 * Purchases a domain automatically from GoDaddy using customer credentials.
 */
export async function purchaseDomain(domain: string, phoneNumber: string, registrant: RegistrantInfo): Promise<boolean> {
  console.log(`[Domain Service] Automating domain purchase for: ${domain}`);

  if (!GODADDY_API_KEY || !GODADDY_API_SECRET) {
    console.log('[Domain Service] No credentials. Mocking domain purchase success.');
    return true;
  }

  try {
    const consent = {
      agreedBy: `${registrant.nameFirst} ${registrant.nameLast}`,
      agreedAt: new Date().toISOString(),
      agreementKeys: ['DNRA']
    };

    // Retrieve terms of agreement first
    try {
      const agreementsRes = await axios.get(`${BASE_URL}/v1/domains/agreements`, {
        params: { tlds: domain.split('.').pop() },
        headers: { Authorization: `sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}` }
      });
      if (agreementsRes.data && agreementsRes.data.length > 0) {
        consent.agreementKeys = agreementsRes.data.map((item: any) => item.agreementKey);
      }
    } catch (e) {
      console.warn('[Domain Service] Could not fetch agreements. Using default agreement keys.');
    }

    const contact = getContactInfo(phoneNumber, registrant);

    const payload = {
      consent,
      domain,
      period: 1, // 1 year
      renewAuto: true,
      contactAdmin: contact,
      contactBilling: contact,
      contactRegistrant: contact,
      contactTech: contact
    };

    const response = await axios.post(`${BASE_URL}/v1/domains/purchase`, payload, {
      headers: {
        Authorization: `sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('[Domain Service] GoDaddy purchase API response status:', response.status);
    return response.status === 200 || response.status === 201 || response.status === 202;
  } catch (error: any) {
    console.error('[Domain Service] GoDaddy Purchase Error:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Automatically sets up CNAME records for the domain pointing to our server.
 */
export async function setupDomainDNS(domain: string): Promise<boolean> {
  console.log(`[Domain Service] Automatically setting up CNAME records for: ${domain}`);

  if (!GODADDY_API_KEY || !GODADDY_API_SECRET) {
    console.log('[Domain Service] No credentials. Mocking DNS record updates.');
    return true;
  }

  try {
    // Standard DNS pointing www as CNAME to our app domain
    const records = [
      {
        type: 'CNAME',
        name: 'www',
        data: 'gray-arc-bot-production.up.railway.app',
        ttl: 3600
      }
    ];

    const response = await axios.put(`${BASE_URL}/v1/domains/${domain}/records/CNAME/www`, records, {
      headers: {
        Authorization: `sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('[Domain Service] GoDaddy DNS record updates status:', response.status);
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    console.error('[Domain Service] GoDaddy DNS Config Error:', error.response?.data || error.message);
    return false;
  }
}

// Contact configuration helper for GoDaddy API schema
function getContactInfo(phone: string, registrant: RegistrantInfo) {
  // Format phone to GoDaddy schema standard format: e.g. +91.9999988888
  let cleanDigits = phone.replace(/\D/g, '');
  let formattedPhone = '';
  
  if (cleanDigits.startsWith('91') && cleanDigits.length > 10) {
    formattedPhone = `+91.${cleanDigits.slice(2)}`;
  } else if (cleanDigits.length === 10) {
    formattedPhone = `+91.${cleanDigits}`;
  } else {
    formattedPhone = `+1.${cleanDigits || '9999999999'}`;
  }

  return {
    addressMailing: {
      address1: registrant.address1,
      city: registrant.city,
      country: 'IN',
      postalCode: registrant.postalCode,
      state: registrant.state
    },
    email: registrant.email,
    nameFirst: registrant.nameFirst,
    nameLast: registrant.nameLast,
    phone: formattedPhone,
    jobTitle: 'Registrant',
    organization: `${registrant.nameFirst} ${registrant.nameLast}`
  };
}

/**
 * Suggests available alternative domains (e.g. .in, .co.in, .net) if the primary domain is taken.
 */
export async function suggestAlternativeDomains(domain: string): Promise<string[]> {
  const parts = domain.split('.');
  const name = parts[0];
  if (!name) return [];

  const alternativeTLDs = ['in', 'co.in', 'net', 'co', 'org'];
  const candidates = alternativeTLDs
    .map(ext => `${name}.${ext}`)
    .filter(d => d !== domain);

  // Check availability concurrently
  const checks = await Promise.all(
    candidates.map(async (candidate) => {
      try {
        const res = await checkDomainAvailability(candidate);
        return { domain: candidate, available: res.available };
      } catch {
        return { domain: candidate, available: false };
      }
    })
  );

  return checks
    .filter(c => c.available)
    .map(c => c.domain)
    .slice(0, 3); // return up to 3 options
}
