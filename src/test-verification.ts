import dotenv from 'dotenv';
import { generateWebsiteConfig } from './services/ai';

dotenv.config();

async function runVerificationTest() {
  console.log('🏁 Starting Double-Check Verification & Image Auditing Pipeline Test...\n');

  const businessName = 'Elite Voyage Travel';
  const category = 'Travel Agency';
  const about = 'We architect ultra-luxury customized travel itineraries, private villa bookings, yacht charters, and VIP global concierges for discerning individuals.';
  const services = 'Amalfi Coast Yacht Tour, private Swiss Chalet Retreat, Helicopter Glacier Tour';
  const contact = '12 Parliament St, London, UK';

  try {
    const config = await generateWebsiteConfig(
      '447777777777',
      businessName,
      category,
      about,
      services,
      contact
    );

    console.log('\n======================================================');
    console.log('✅ WEBSITE CONFIGURATION GENERATED & VERIFIED SUCCESSFULLY');
    console.log('======================================================');
    console.log(`\n• Business Name: ${config.businessName}`);
    console.log(`• Category:      ${config.category}`);
    console.log(`• Hero Title:    "${config.heroTitle}"`);
    console.log(`• Hero Subtitle: "${config.heroSubtitle}"`);
    console.log(`• Story Title:   "${config.storyTitle}"`);
    console.log(`• Story Content (Length: ${config.storyContent.split(/\s+/).length} words):\n  "${config.storyContent}"`);
    
    console.log('\n------------------------------------------------------');
    console.log('🖼️ AUDITED IMAGE LINKS');
    console.log('------------------------------------------------------');
    console.log(`• Hero Image:  ${config.heroImage}`);
    console.log(`• About Image: ${config.aboutImage}`);
    console.log('• Gallery Images:');
    config.galleryImages?.forEach((img, i) => {
      console.log(`  - [${i+1}]: ${img}`);
    });
    
    console.log('\n------------------------------------------------------');
    console.log('🛠️ SERVICES & CORRESPONDING IMAGES');
    console.log('------------------------------------------------------');
    config.services.forEach((s, i) => {
      console.log(`\n[Service ${i+1}] ${s.name} (${s.price})`);
      console.log(`  - Description: "${s.description}"`);
      console.log(`  - Image:       ${s.image}`);
    });

  } catch (error: any) {
    console.error('❌ Test failed with error:', error.message);
  }
}

runVerificationTest();
