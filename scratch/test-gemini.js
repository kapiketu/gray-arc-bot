require('dotenv').config();
const { generateWebsiteConfig } = require('../dist/services/ai.js');

async function main() {
  console.log('Testing Gemini API key:', process.env.GEMINI_API_KEY);
  try {
    const config = await generateWebsiteConfig(
      '9693186322',
      'Test Biryani',
      'Biryani Restaurant',
      'Best biryani in town',
      'Biryani, kebab',
      'Jodhpur'
    );
    console.log('Gemini Generation SUCCESS!');
    console.log(JSON.stringify(config, null, 2));
  } catch (err) {
    console.error('Gemini Generation FAILED!');
    console.error(err);
  }
}

main().catch(console.error);
