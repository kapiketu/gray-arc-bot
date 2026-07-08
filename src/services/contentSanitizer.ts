import { SiteConfig } from './db';

const VALID_LUCIDE_ICONS = new Set([
  'utensils', 'coffee', 'cake', 'cookie', 'glass-water', 'shopping-bag',
  'sparkles', 'scissors', 'gem', 'flower', 'heart', 'smile',
  'dumbbell', 'flame', 'trophy', 'target', 'activity',
  'compass', 'map', 'plane', 'globe', 'luggage', 'camera',
  'stethoscope', 'shield', 'award', 'zap', 'star', 'users', 'rocket',
  'briefcase', 'code', 'laptop', 'smartphone', 'database', 'cpu', 'terminal',
  'cloud', 'activity', 'chef-hat', 'smile-plus', 'store', 'phone', 'mail',
  'map-pin', 'clock', 'check-circle-2', 'check', 'arrow-right', 'instagram',
  'facebook', 'twitter', 'youtube', 'linkedin', 'chevron-right', 'chevron-left',
  'quote', 'message-circle', 'chevron-down', 'shield-check'
]);

function truncateToWords(text: string | undefined, maxWords: number): string {
  if (!text) return '';
  const cleanText = text.trim().replace(/\s+/g, ' ');
  const words = cleanText.split(' ');
  if (words.length <= maxWords) {
    return cleanText;
  }
  let truncated = words.slice(0, maxWords).join(' ');
  // Ensure it ends clean
  truncated = truncated.replace(/[,;:\-\s]+$/, '');
  if (!truncated.endsWith('.')) {
    truncated += '.';
  }
  return truncated;
}

function getCategoryFallbackIcon(category: string): string {
  const cat = (category || '').toLowerCase();
  if (cat.includes('food') || cat.includes('restaurant') || cat.includes('cafe') || cat.includes('bake') || cat.includes('kitchen')) {
    return 'utensils';
  }
  if (cat.includes('salon') || cat.includes('hair') || cat.includes('spa') || cat.includes('beauty') || cat.includes('nail')) {
    return 'scissors';
  }
  if (cat.includes('gym') || cat.includes('fitness') || cat.includes('workout') || cat.includes('train')) {
    return 'dumbbell';
  }
  if (cat.includes('health') || cat.includes('doctor') || cat.includes('medical') || cat.includes('dentist') || cat.includes('clinic')) {
    return 'stethoscope';
  }
  if (cat.includes('travel') || cat.includes('tour') || cat.includes('hotel') || cat.includes('resort')) {
    return 'compass';
  }
  if (cat.includes('agency') || cat.includes('tech') || cat.includes('dev') || cat.includes('software') || cat.includes('marketing')) {
    return 'laptop';
  }
  return 'star';
}

export function sanitizeIcon(icon: string | undefined, category: string): string {
  const clean = (icon || '').trim().toLowerCase();
  return VALID_LUCIDE_ICONS.has(clean) ? clean : getCategoryFallbackIcon(category);
}

export function sanitizeSiteConfig(config: SiteConfig, category: string): SiteConfig {
  console.log(`[Sanitizer] Enforcing Stage 5 word limits and icon checks...`);

  // 1. Hero Subtitle Limit (max 25 words)
  if (config.heroSubtitle) {
    config.heroSubtitle = truncateToWords(config.heroSubtitle, 25);
  }

  // 2. Story Content Limit (max 80 words)
  if (config.storyContent) {
    config.storyContent = truncateToWords(config.storyContent, 80);
  }

  // 3. Services (description max 20 words, icon check)
  if (config.services) {
    config.services = config.services.map(s => ({
      ...s,
      description: truncateToWords(s.description, 20),
      icon: sanitizeIcon(s.icon, category)
    }));
  }

  // 4. Features (description max 30 words)
  if (config.features) {
    config.features = config.features.map(f => ({
      ...f,
      description: truncateToWords(f.description, 30)
    }));
  }

  // 5. FAQs (answer max 35 words)
  if (config.faqs) {
    config.faqs = config.faqs.map(faq => ({
      ...faq,
      answer: truncateToWords(faq.answer, 35)
    }));
  }

  // 6. Testimonials (content max 35 words)
  if (config.testimonials) {
    config.testimonials = config.testimonials.map(t => ({
      ...t,
      content: truncateToWords(t.content, 35)
    }));
  }

  return config;
}
