import { assembleBlocks } from './src/services/componentAssembler';
import { getThemeForIndustry } from './src/services/stylingEngine';

async function test() {
  const theme = getThemeForIndustry('Tech/Startup');
  const schema = {
    layout: ['hero_v1', 'services_v2'],
    content: {
      'hero_v1': { headline: 'Test Headline', subheadline: 'Test Sub', cta_text: 'Click' },
      'services_v2': {
        section_title: 'Our Services',
        section_subtitle: 'Sub',
        items: [
          { icon: 'code', title: 'Web Dev', desc: 'We build websites.' },
          { icon: 'smartphone', title: 'App Dev', desc: 'We build apps.' }
        ]
      }
    }
  };
  const html = await assembleBlocks(schema as any, theme);
  console.log('SUCCESS! Extracted items:');
  console.log('Contains Web Dev:', html.includes('Web Dev'));
  console.log('Contains App Dev:', html.includes('App Dev'));
  console.log('Contains Test Headline:', html.includes('Test Headline'));
  console.log(html.substring(0, 300));
}
test().catch(console.error);
