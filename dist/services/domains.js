"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDomainAvailability = checkDomainAvailability;
exports.purchaseDomain = purchaseDomain;
exports.suggestAlternativeDomains = suggestAlternativeDomains;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const dns_1 = __importDefault(require("dns"));
dotenv_1.default.config();
const GODADDY_API_KEY = process.env.GODADDY_API_KEY || '';
const GODADDY_API_SECRET = process.env.GODADDY_API_SECRET || '';
const GODADDY_ENV = process.env.GODADDY_ENV || 'ote'; // 'ote' for sandbox, 'prod' for production
const BASE_URL = GODADDY_ENV === 'prod'
    ? 'https://api.godaddy.com'
    : 'https://api.ote-godaddy.com';
/**
 * Checks if a domain is available for registration.
 * If GoDaddy API keys are not provided, it falls back to DNS resolution check.
 */
async function checkDomainAvailability(domain) {
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
            dns_1.default.resolve(domain, (err, addresses) => {
                if (err) {
                    // If DNS resolve errors with ENOTFOUND or ENODATA, it's highly likely available.
                    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
                        resolve({
                            available: true,
                            price: 500, // standard mock registration price
                            currency: 'INR'
                        });
                    }
                    else {
                        resolve({
                            available: false,
                            reason: `DNS check failed: ${err.message}`
                        });
                    }
                }
                else {
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
        const response = await axios_1.default.get(`${BASE_URL}/v1/domains/available`, {
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
    }
    catch (error) {
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
async function purchaseDomain(domain, phoneNumber) {
    console.log(`[Domain Service] Automating domain purchase for: ${domain}`);
    if (!GODADDY_API_KEY || !GODADDY_API_SECRET) {
        console.log('[Domain Service] No credentials. Mocking domain purchase success.');
        return true;
    }
    try {
        const consent = {
            agreements: ['DNRA'],
            agreementKeys: ['DNRA'],
            ipAddress: '127.0.0.1'
        };
        // Retrieve terms of agreement first
        try {
            const agreementsRes = await axios_1.default.get(`${BASE_URL}/v1/domains/agreements`, {
                params: { tlds: domain.split('.').pop() },
                headers: { Authorization: `sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}` }
            });
            if (agreementsRes.data && agreementsRes.data.length > 0) {
                consent.agreementKeys = agreementsRes.data.map((item) => item.agreementKey);
            }
        }
        catch (e) {
            console.warn('[Domain Service] Could not fetch agreements. Using default agreement keys.');
        }
        const payload = {
            consent,
            domain,
            period: 1, // 1 year
            renewAuto: true,
            // Provide developer or default contact info
            contactAdmin: getContactInfo(phoneNumber),
            contactBilling: getContactInfo(phoneNumber),
            contactRegistrant: getContactInfo(phoneNumber),
            contactTech: getContactInfo(phoneNumber)
        };
        const response = await axios_1.default.post(`${BASE_URL}/v1/domains/purchase`, payload, {
            headers: {
                Authorization: `sso-key ${GODADDY_API_KEY}:${GODADDY_API_SECRET}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('[Domain Service] GoDaddy purchase API response status:', response.status);
        return response.status === 200 || response.status === 201 || response.status === 202;
    }
    catch (error) {
        console.error('[Domain Service] GoDaddy Purchase Error:', error.response?.data || error.message);
        return false;
    }
}
// Contact configuration helper for GoDaddy API schema
function getContactInfo(phone) {
    return {
        addressMailing: {
            address1: '123 Tech Square',
            city: 'Mumbai',
            country: 'IN',
            postalCode: '400001',
            state: 'Maharashtra'
        },
        email: 'domains@thegrayarc.com',
        nameFirst: 'Gray',
        nameLast: 'Arc',
        phone: phone.startsWith('+') ? phone : `+91${phone}`,
        jobTitle: 'Business Owner',
        organization: 'The Gray Arc'
    };
}
/**
 * Suggests available alternative domains (e.g. .in, .co.in, .net) if the primary domain is taken.
 */
async function suggestAlternativeDomains(domain) {
    const parts = domain.split('.');
    const name = parts[0];
    if (!name)
        return [];
    const alternativeTLDs = ['in', 'co.in', 'net', 'co', 'org'];
    const candidates = alternativeTLDs
        .map(ext => `${name}.${ext}`)
        .filter(d => d !== domain);
    // Check availability concurrently
    const checks = await Promise.all(candidates.map(async (candidate) => {
        try {
            const res = await checkDomainAvailability(candidate);
            return { domain: candidate, available: res.available };
        }
        catch {
            return { domain: candidate, available: false };
        }
    }));
    return checks
        .filter(c => c.available)
        .map(c => c.domain)
        .slice(0, 3); // return up to 3 options
}
