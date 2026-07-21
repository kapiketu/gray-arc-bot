require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('sites').select('id, phone_number, created_at');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sites:', data);
  }
}

main().catch(console.error);
