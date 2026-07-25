require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function main() {
  const { data, error } = await supabase.from('sites').select('id, data').eq('id', 'vogue-spa-test').single();
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Site ID:', data.id);
    const hasHtml = !!data.data.generatedHtml;
    console.log('Has generatedHtml property:', hasHtml);
    if (hasHtml) {
      console.log('HTML snippet:\n', data.data.generatedHtml.substring(0, 3000));
    }
  }
}

main().catch(console.error);
