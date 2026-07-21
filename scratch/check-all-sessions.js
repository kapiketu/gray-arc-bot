require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('sessions').select('*');
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Sessions:', data);
  }
}

main().catch(console.error);
