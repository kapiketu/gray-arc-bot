const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSite(id) {
  const { data, error } = await supabase
    .from('sites')
    .select('data')
    .eq('id', id)
    .single();
  if (error || !data) {
    console.error('Error fetching site:', error);
  } else {
    console.log(`Site ${id} data:`, data.data);
  }
}

checkSite('gray-arc');
