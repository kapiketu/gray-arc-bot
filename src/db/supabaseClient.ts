import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key for backend operations (bypasses RLS).
// Falls back to ANON key if service role key is not yet configured.
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key_here'
  ? process.env.SUPABASE_SERVICE_ROLE_KEY
  : process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Check SUPABASE_URL and SUPABASE_ANON_KEY in .env');
}

// Typed Supabase client for the AI Agency V3 backend
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: SupabaseClient<any> = createClient(supabaseUrl, supabaseKey);

