require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('sites').select('id, data').eq('id', 'kk-biryani').single();
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Site Data:', JSON.stringify(data.data, null, 2));
  }
}

main().catch(console.error);
