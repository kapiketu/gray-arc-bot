import dotenv from 'dotenv';
import { generateWebsiteConfig } from '/Users/kapiketubhagat/development/whatsapp-site-builder/src/services/ai';
import { db } from '/Users/kapiketubhagat/development/whatsapp-site-builder/src/services/db';

dotenv.config();

async function generateLiveTest() {
  console.log('🏁 Generating a live, premium website config using Gemini...');

  const businessName = 'Vogue Salon & Spa';
  const category = 'Beauty Salon & Luxury Spa';
  const about = 'We provide elite hair styling, organic facial therapies, hot stone massage, and premium beauty makeovers in a tranquil, relaxing atmosphere.';
  const services = 'Balayage Hair Styling, Hot Stone Therapy, Hydrafacial Glow Treatment';
  const contact = '45 Mall Road, Dehradun, Uttarakhand, India';

  try {
    const config = await generateWebsiteConfig(
      '919999999999',
      businessName,
      category,
      about,
      services,
      contact
    );

    // Hardcode the ID so it matches the test URL and template to GA004 (Adaptive Engine)
    config.id = 'vogue-spa-test';
    config.template = 'GA004';

    console.log('💾 Saving site config...');
    await db.saveSite(config);

    console.log('\n======================================================');
    console.log('✅ LIVE TEST WEBSITE GENERATED SUCCESSFULLY');
    console.log('======================================================');
    console.log(`\n👉 Open this URL in your browser to inspect quality:`);
    console.log(`   https://ai.thegrayarc.com/site/vogue-spa-test?cb=1`);
    console.log('\n======================================================');

  } catch (err: any) {
    console.error('❌ Failed to generate live test:', err.message);
  }
}

generateLiveTest();
