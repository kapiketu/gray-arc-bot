const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function updateSiteTemplate(id, templateId) {
  // Fetch existing
  const { data: row, error: fetchErr } = await supabase
    .from('sites')
    .select('data')
    .eq('id', id)
    .single();
  if (fetchErr || !row) {
    console.error('Error fetching site:', fetchErr);
    return;
  }

  const updatedData = {
    ...row.data,
    template: templateId
  };

  const { error: updateErr } = await supabase
    .from('sites')
    .update({ data: updatedData })
    .eq('id', id);

  if (updateErr) {
    console.error('Error updating site template:', updateErr);
  } else {
    console.log(`Successfully updated site ${id} to use template ${templateId}`);
  }
}

updateSiteTemplate('gray-arc', 'GA003');
