require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('sessions').select('*').eq('phone_number', '31637438681').single();
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Session Data:', data);
  }
}

main().catch(console.error);
