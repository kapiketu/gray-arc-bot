require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  console.log('Cleaning up bad cached site records...');
  const idsToDelete = ['kk-biryani', 'ds-biryani', 'biryani-boss'];
  const { data, error } = await supabase.from('sites').delete().in('id', idsToDelete).select();
  if (error) {
    console.error('Error deleting sites:', error);
  } else {
    console.log('Successfully deleted bad sites:', data);
  }
}

main().catch(console.error);
