"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[DB] Missing Supabase credentials in .env file!');
}
const supabase = (0, supabase_js_1.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
exports.db = {
    // ──────────────────────────────────────────────────
    // SESSION METHODS
    // ──────────────────────────────────────────────────
    async getSession(phoneNumber) {
        const { data, error } = await supabase
            .from('sessions')
            .select('data')
            .eq('phone_number', phoneNumber)
            .single();
        if (error || !data)
            return null;
        return data.data;
    },
    async saveSession(session) {
        const { error } = await supabase
            .from('sessions')
            .upsert({
            phone_number: session.phoneNumber,
            data: session,
            updated_at: new Date().toISOString()
        }, { onConflict: 'phone_number' });
        if (error)
            console.error('[DB] Error saving session:', error);
    },
    async deleteSession(phoneNumber) {
        const { error } = await supabase
            .from('sessions')
            .delete()
            .eq('phone_number', phoneNumber);
        if (error)
            console.error('[DB] Error deleting session:', error);
    },
    // ──────────────────────────────────────────────────
    // SITE METHODS
    // ──────────────────────────────────────────────────
    async getSite(id) {
        const { data, error } = await supabase
            .from('sites')
            .select('data')
            .eq('id', id)
            .single();
        if (error || !data)
            return null;
        return data.data;
    },
    async getSiteByPhone(phoneNumber) {
        const { data, error } = await supabase
            .from('sites')
            .select('data')
            .eq('phone_number', phoneNumber)
            .single();
        if (error || !data)
            return null;
        return data.data;
    },
    async getSiteByDomain(domain) {
        const { data, error } = await supabase
            .from('sites')
            .select('data')
            .eq('custom_domain', domain)
            .single();
        if (data)
            return data.data;
        // Fallback: check if it matches a subdomain (e.g. site-id.localhost)
        // We have to scan all sites for this fallback since it's not indexed nicely,
        // or just assume standard formatting. For production, we'd query better.
        const { data: allSites, error: errAll } = await supabase.from('sites').select('id, data');
        if (!errAll && allSites) {
            for (const site of allSites) {
                if (`${site.id}.localhost:3000` === domain || `${site.id}.localhost` === domain) {
                    return site.data;
                }
            }
        }
        return null;
    },
    async saveSite(site) {
        const { error } = await supabase
            .from('sites')
            .upsert({
            id: site.id,
            phone_number: site.phoneNumber,
            custom_domain: site.customDomain,
            data: site
        }, { onConflict: 'id' });
        if (error)
            console.error('[DB] Error saving site:', error);
    },
    async deleteSite(id) {
        const { error } = await supabase
            .from('sites')
            .delete()
            .eq('id', id);
        if (error)
            console.error('[DB] Error deleting site:', error);
    }
};
