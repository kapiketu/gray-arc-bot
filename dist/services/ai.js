"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyImageUrl = verifyImageUrl;
exports.slugify = slugify;
exports.generateWebsiteConfig = generateWebsiteConfig;
exports.modifyWebsiteConfig = modifyWebsiteConfig;
const generative_ai_1 = require("@google/generative-ai");
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
const viewer_1 = require("../routes/viewer");
const contentSanitizer_1 = require("./contentSanitizer");
dotenv_1.default.config();
async function verifyImageUrl(url) {
    try {
        // Using responseType stream to avoid loading entire image payload in memory
        const res = await axios_1.default.get(url, { timeout: 5000, responseType: 'stream' });
        return res.status === 200;
    }
    catch (err) {
        console.warn(`[Image Audit] Verification failed for: ${url} - Error: ${err.message}`);
        return false;
    }
}
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Helper to generate a slug from a business name
function slugify(text) {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-') // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-'); // Replace multiple - with single -
}
// Fallback Mock AI content generator (if API key is missing)
function getMockWebsiteContent(phoneNumber, businessName, category, about, servicesRaw, contactRaw) {
    const slug = slugify(businessName) || `site-${Math.floor(Math.random() * 10000)}`;
    // Parse services — split by newlines, commas, or semicolons
    const services = [];
    // First split by newline, then further split by commas if no newline separation
    let rawItems = servicesRaw.split('\n').map(l => l.trim()).filter(l => l);
    // If only one line, try splitting by commas or semicolons
    if (rawItems.length === 1 && (rawItems[0].includes(',') || rawItems[0].includes(';'))) {
        rawItems = rawItems[0].split(/[,;]/).map(s => s.trim()).filter(s => s);
    }
    const fallbacks = (0, viewer_1.getCategoryImages)(category);
    const fallbackIcons = (0, viewer_1.getDefaultCategoryIcons)(category);
    for (const [idx, item] of rawItems.entries()) {
        if (!item)
            continue;
        const parts = item.split('-');
        const name = parts[0]?.trim() || 'Service / Product';
        const price = parts.length > 1 ? parts[1]?.trim() : 'Contact Us';
        const fallbackProd = fallbacks.products[idx] || fallbacks.products[0] || fallbacks.hero;
        const fallbackIcon = fallbackIcons[idx % fallbackIcons.length];
        services.push({
            name: name.charAt(0).toUpperCase() + name.slice(1),
            price: price || 'Contact Us',
            description: `Premium quality ${name.toLowerCase()} customized to your needs.`,
            image: fallbackProd,
            icon: fallbackIcon
        });
    }
    if (services.length === 0) {
        services.push({
            name: 'Standard Product',
            price: '₹499',
            description: 'Our signature offering.',
            image: fallbacks.products[0] || fallbacks.hero,
            icon: fallbackIcons[0]
        });
    }
    // Determine theme based on category
    let theme = {
        primaryColor: '#3b82f6', // blue
        secondaryColor: '#1d4ed8',
        fontFamily: 'Outfit, sans-serif',
        bgColor: '#ffffff',
        textColor: '#1f2937'
    };
    const catLower = category.toLowerCase();
    if (catLower.includes('bakery') || catLower.includes('cake') || catLower.includes('food')) {
        theme = {
            primaryColor: '#b45309', // amber/warm brown
            secondaryColor: '#78350f',
            fontFamily: 'Playfair Display, serif',
            bgColor: '#fffbeb', // amber 50
            textColor: '#451a03'
        };
    }
    else if (catLower.includes('salon') || catLower.includes('beauty') || catLower.includes('spa')) {
        theme = {
            primaryColor: '#db2777', // pink/rose
            secondaryColor: '#9d174d',
            fontFamily: 'Inter, sans-serif',
            bgColor: '#fff1f2',
            textColor: '#881337'
        };
    }
    else if (catLower.includes('gym') || catLower.includes('fitness') || catLower.includes('sports')) {
        theme = {
            primaryColor: '#ef4444', // red
            secondaryColor: '#b91c1c',
            fontFamily: 'Oswald, sans-serif',
            bgColor: '#111827', // dark mode
            textColor: '#f9fafb'
        };
    }
    // Set default contact details
    const contactDetails = {
        phone: phoneNumber,
        email: `info@${slug}.com`,
        address: contactRaw || 'Local Business, India',
        hours: 'Monday - Saturday: 10:00 AM - 8:00 PM'
    };
    // Generate 30 days trial end date
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 30);
    return {
        id: slug,
        phoneNumber,
        businessName,
        category,
        aboutText: about,
        theme,
        services,
        contactDetails,
        billingStatus: 'trial',
        trialEndsAt: trialEnds.toISOString(),
        customDomain: null,
        domainStatus: 'none',
        heroTitle: `Welcome to ${businessName}`,
        heroSubtitle: about ? `${about.substring(0, 100)}... Discover unparalleled excellence and client-focused solutions tailored to meet your unique needs.` : `Discover unparalleled excellence and client-focused solutions tailored to meet your unique needs. We combine years of specialized experience with a passion for quality to deliver results you can depend on, every single time.`,
        storyTitle: 'Our Story',
        storyContent: about ? `${about}. Our journey began with a simple yet powerful mission: to provide the community with honest, high-quality, and reliable services. Over the years, we have grown into a trusted industry leader by never compromising on our core values. We believe that every client deserves dedicated attention, transparent communication, and exceptional craftsmanship. Whether you are seeking a consultation, a premium product, or a custom solution, our experienced team works tirelessly to ensure your expectations are not just met, but exceeded.` : `Our journey began with a simple yet powerful mission: to provide the community with honest, high-quality, and reliable services. Over the years, we have grown into a trusted industry leader by never compromising on our core values. We believe that every client deserves dedicated attention, transparent communication, and exceptional craftsmanship. Whether you are seeking a consultation, a premium product, or a custom solution, our experienced team works tirelessly to ensure your expectations are not just met, but exceeded. Thank you for trusting us to be your partner; we look forward to serving you with integrity and excellence for years to come.`,
        heroImage: fallbacks.hero,
        aboutImage: fallbacks.about,
        galleryImages: [
            fallbacks.products[0] || fallbacks.hero,
            fallbacks.products[1] || fallbacks.products[0] || fallbacks.hero,
            fallbacks.products[2] || fallbacks.products[0] || fallbacks.hero,
            fallbacks.products[3] || fallbacks.products[0] || fallbacks.hero
        ],
        features: [
            { title: 'Premium Quality Assurance', description: 'We source only the finest materials, leverage advanced techniques, and enforce rigorous quality checks to ensure that every single deliverable meets the absolute highest industry standards of excellence, durability, and safety.' },
            { title: 'Experienced Specialists', description: 'Our crew consists of highly trained, certified, and passionate professionals who bring decades of combined experience, specialized skills, and a committed, problem-solving focus to every single project we undertake.' },
            { title: 'Client Centric Partnership', description: 'Your goals are our priorities. We take the time to understand your exact requirements, provide transparent progress updates, and offer tailored, flexible solutions designed to guarantee your complete satisfaction.' }
        ],
        faqs: [
            { question: 'What are your operating hours?', answer: 'We are fully operational Monday through Saturday from 10:00 AM to 8:00 PM. Our team is available to assist you during these hours, and you can always send us a message via WhatsApp to schedule an appointment outside these times if needed.' },
            { question: 'How do I book a service or order?', answer: 'Booking is incredibly easy and direct. Simply scroll to our services section, select the offering you are interested in, and click the "Order via WhatsApp" button. This will open a chat with us containing the service details so we can finalize your booking instantly.' },
            { question: 'Where are you located and do you offer delivery?', answer: contactRaw || 'We are based in local area, India, serving clients across the region. If you need precise directions, maps, or want to check if we service your specific area, feel free to send us a message on WhatsApp and we will share our location details.' }
        ],
        testimonials: [
            { name: 'Aarav Mehta', role: 'Regular Client', content: 'The level of professionalism and care they brought to the table was simply outstanding. They understood my requirements perfectly, kept me informed at every step, and delivered a result that was far better than I could have imagined. I highly recommend them to anyone seeking top-tier service!' },
            { name: 'Priya Sharma', role: 'Local Customer', content: 'I have been a customer for over a year now, and I can confidently say their consistency is unmatched. From their helpful support to the superb final delivery, every interaction is a pleasant experience. It is rare to find a business that cares this much about its clients.' },
            { name: 'Rohan Gupta', role: 'Business Owner', content: 'They exceeded my expectations in every possible way. The project was completed on time, within budget, and the attention to details was absolutely spectacular. Their team is knowledgeable, responsive, and incredibly dedicated to customer success. Five stars!' }
        ]
    };
}
async function generateWebsiteConfig(phoneNumber, businessName, category, about, servicesRaw, contactRaw) {
    // 1. Data Normalization: Clean formatting, capitalize and trim duplicate spaces
    const cleanName = (businessName || '').trim().replace(/\s+/g, ' ');
    const cleanCategory = (category || '').trim().replace(/\s+/g, ' ');
    const cleanAbout = (about || '').trim().replace(/\s+/g, ' ');
    const cleanServices = (servicesRaw || '').trim().split(/[,\n]+/).map(s => s.trim()).filter(Boolean).join(', ');
    const cleanContact = (contactRaw || '').trim().replace(/\s+/g, ' ');
    console.log(`[AI Engine] Generating site config for normalized "${cleanName}" (${cleanCategory})`);
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_GEMINI')) {
        console.warn('[AI Engine] Gemini API Key is missing. Using local Mock generator.');
        return getMockWebsiteContent(phoneNumber, cleanName, cleanCategory, cleanAbout, cleanServices, cleanContact);
    }
    try {
        const ai = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
        // Using gemini-2.5-flash for speed and structured outputs
        const model = ai.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });
        // ──────────────────────────────────────────────────
        // STAGE 1: RAW GENERATION
        // ──────────────────────────────────────────────────
        const prompt = `
    You are an expert copywriter and premium website landing page architect. Generate a complete, highly professional, and informative website configuration based on the user's inputs.
    
    USER INPUTS:
    - Business Name: ${cleanName}
    - Business Category: ${cleanCategory}
    - Business Description: ${cleanAbout}
    - Services/Products (raw input): ${cleanServices}
    - Contact Details / Address (raw input): ${cleanContact}
    
    CRITICAL COPYWRITING DIRECTIVES FOR LENGTH AND DEPTH (VERY IMPORTANT):
    1. CONCISE MARKETING COPY: Even if the user provided sparse input, expand it into professional, engaging marketing copy. However, you MUST follow the strict word counts specified below to ensure text fits within the styled template sections without overflowing or overlapping.
    2. HERO SUBTITLE: Must be an engaging, punchy statement of exactly 15-25 words (maximum 30 words) explaining the values and commitment of the business.
    3. OUR STORY CONTENT: Must be a compelling, brief brand narrative of exactly 60-80 words (maximum 90 words, split into 1 or 2 small paragraphs) detailing their foundation, quality dedication, and client focus.
    4. SERVICES (EXTREMELY IMPORTANT — READ CAREFULLY):
       - The user may list services as comma-separated words (e.g. "gym, yoga, dance"), newline-separated, or with dashes.
       - You MUST split them into SEPARATE individual service objects. NEVER combine multiple services into one.
       - Each service must have a professional name, a price in Rupees (e.g. "₹499" or "₹1,200"). If the user did not provide a price, set price to "Contact Us" (without any currency symbol).
       - Each service must have a concise, engaging descriptive paragraph of exactly 15-20 words (maximum 25 words) explaining what the service involves.
       - Each service must have a specific "imagePrompt" string that is clean, descriptive, vector/photographic style, with no special characters, quotes, or slashes, suitable for generating a background image (e.g., "premium yoga studio class interior with wooden floor").
       - Each service must have a valid lowercase, hyphenated "icon" name from Lucide library that relates specifically to the service (e.g. 'code', 'laptop', 'plane', 'dumbbell', 'utensils', 'scissors', 'stethoscope', 'briefcase', 'shield').
    5. WHY CHOOSE US (FEATURES): Generate exactly 3 feature cards highlighting why clients trust this business. Each feature card needs a strong title (1-3 words) and a concise description paragraph of exactly 20-30 words (maximum 35 words).
    6. FAQs: Generate exactly 3 frequently asked questions and short, helpful answers of exactly 25-35 words (maximum 40 words) per answer.
    7. TESTIMONIALS: Generate exactly 3 realistic, highly positive client reviews. Each review content must be a concise testimonial paragraph of exactly 25-35 words (maximum 40 words).
    8. IMAGE PROMPTS:
       - You must provide clean, vector/photographic image prompts for:
         - "heroImagePrompt": background image showcasing the category or business space.
         - "aboutImagePrompt": team, storefront, or workspace showcase image.
         - "galleryImagePrompts": exactly 4 distinct prompts highlighting services or products.
    9. Clean the contact details into structured fields: phone, email, address, and operating hours (default: "Monday - Saturday: 10:00 AM - 8:00 PM" if not specified).
    10. STATISTICS (STATS): Generate exactly 4 stat items. Value must be short (e.g. "5000+" or "100%"), label must be a short phrase of 1-2 words (e.g. "Happy Diners"), and a related lowercase Lucide icon name (e.g. "heart", "flame", "leaf", "star", "users").
    11. TYPOS AND GRAMMAR CORRECTION: Correct all spelling mistakes, grammatical issues, and lowercase names in user inputs (e.g. correct 'chickn' to 'chicken', 'dehraudn' to 'Dehradun', 'bakrs' to 'Bakers', 'jodhour' to 'Jodhpur', and capitalize business names) across all generated titles, descriptions, feature blocks, and fields. Typo correction is mandatory.
    12. BRAND STRATEGY: Define a brand style strategy. Generate 'styleKeywords' (3-4 comma-separated visual style keywords like rustic, elegant, modern) and 'colorAesthetic' (image color scheme description matching theme colors like warm golden, clean neon green).
    13. LOCAL SEO SCHEMA: Determine the correct 'businessType' (e.g., Restaurant, HairSalon, Gym, Dentist, LocalBusiness) and 'priceRange' (e.g., ₹₹).
    14. PREMIUM COLORS AND TYPOGRAPHY (CRITICAL):
        - primaryColor: Generate a curated, rich premium hex color (avoid plain red/blue/green). Examples: Emerald (#10b981), Indigo/Blue (#4f46e5 or #3b82f6), Amber/Gold (#d97706 or #f59e0b), Teal (#0d9488), Violet/Lavender (#8b5cf6), Clean Slate (#475569).
        - secondaryColor: Complementary color to primaryColor.
        - bgColor: Either '#ffffff' (light mode) OR '#030712' / '#09090b' (modern dark mode). Dark mode is highly recommended for tech, gym, lounge, bakery, and creative categories; light mode for healthcare, consulting, law.
        - textColor: '#18181b' (zinc-900) for light mode, or '#f4f4f5' (zinc-100) for dark mode.
        - fontFamily: Curated modern font family string. Pick from: 'Outfit, sans-serif' (modern/premium), 'Space Grotesk, sans-serif' (bold/creative), 'Plus Jakarta Sans, sans-serif' (elegant), 'Playfair Display, serif' (classic/luxury), 'Inter, sans-serif' (clean/neutral).
    
    Output the result EXACTLY matching this JSON structure:
    {
      "businessName": "corrected and properly capitalized business name (e.g. Badoal Bakers)",
      "category": "corrected and properly capitalized business category (e.g. Bakery)",
      "theme": {
        "primaryColor": "hex string",
        "secondaryColor": "hex string",
        "fontFamily": "font string",
        "bgColor": "hex string",
        "textColor": "hex string"
      },
      "services": [
        { "name": "service name", "price": "price with currency", "description": "concise description paragraph of exactly 15-20 words", "imagePrompt": "clean photographic prompt", "icon": "lowercase hyphenated Lucide icon name" }
      ],
      "contactDetails": {
        "phone": "phone number",
        "email": "email address",
        "address": "physical address",
        "hours": "business hours"
      },
      "heroTitle": "highly engaging main headline",
      "heroSubtitle": "sub-headline of exactly 15-25 words",
      "storyTitle": "engaging subtitle for our story section",
      "storyContent": "compelling story narrative of exactly 60-80 words",
      "heroImagePrompt": "clean photographic prompt",
      "aboutImagePrompt": "clean photographic prompt",
      "galleryImagePrompts": [
        "prompt 1",
        "prompt 2",
        "prompt 3",
        "prompt 4"
      ],
      "features": [
        { "title": "feature title", "description": "feature description paragraph of exactly 20-30 words" }
      ],
      "faqs": [
        { "question": "faq question", "answer": "faq answer of exactly 25-35 words" }
      ],
      "testimonials": [
        { "name": "client name", "role": "client role", "content": "testimonial paragraph of exactly 25-35 words" }
      ],
      "stats": [
        { "value": "value", "label": "label", "icon": "lowercase hyphenated Lucide icon name" }
      ],
      "brandPersonality": {
        "styleKeywords": "comma-separated design style keywords (e.g. elegant, modern, rustic)",
        "colorAesthetic": "descriptive image color tone matching theme colors (e.g. warm golden, cool neon blue)"
      },
      "schemaOrg": {
        "businessType": "LocalBusiness, Restaurant, HairSalon, Gym, Dentist, etc.",
        "priceRange": "price tier (e.g. ₹₹)"
      }
    }
    `;
        console.log('[AI Engine] Requesting generation from Gemini...');
        const response = await model.generateContent(prompt);
        const resultText = response.response.text();
        const generatedConfig = JSON.parse(resultText);
        // Get unsplash fallback images for this category
        const fallbacks = (0, viewer_1.getCategoryImages)(category);
        // ──────────────────────────────────────────────────
        // STAGE 2: DYNAMIC IMAGE VERIFICATION & HARMONIZATION
        // ──────────────────────────────────────────────────
        console.log('[AI Engine] Auditing generated image prompts...');
        const buildImgUrl = (promptStr, width = 1200, height = 800) => {
            const clean = promptStr.replace(/[/,]/g, '').replace(/\s+/g, ' ').trim();
            const style = (generatedConfig.brandPersonality?.styleKeywords || '').trim();
            const color = (generatedConfig.brandPersonality?.colorAesthetic || '').trim();
            const modifiers = [
                style ? `styled in ${style} design style` : '',
                color ? `matching a ${color} color scheme` : ''
            ].filter(Boolean).join(', ');
            const suffix = modifiers ? ` - ${modifiers}` : '';
            return `https://image.pollinations.ai/prompt/premium%20hd%20photography%20of%20${encodeURIComponent(clean)}%20for%20${encodeURIComponent(cleanCategory)}%20business${encodeURIComponent(suffix)}?width=${width}&height=${height}&nologo=true`;
        };
        // Hero image
        const verifiedHeroImage = buildImgUrl(generatedConfig.heroImagePrompt || 'hero background', 1600, 900);
        // About image
        const verifiedAboutImage = buildImgUrl(generatedConfig.aboutImagePrompt || 'office workspace', 1200, 800);
        const fallbackIcons = (0, viewer_1.getDefaultCategoryIcons)(category);
        const verifiedServices = (generatedConfig.services || []).map((s, idx) => {
            const rawUrl = buildImgUrl(s.imagePrompt || s.name, 1200, 800);
            const fallbackIcon = fallbackIcons[idx % fallbackIcons.length];
            return {
                name: s.name,
                price: s.price,
                description: s.description,
                image: rawUrl,
                icon: s.icon || fallbackIcon
            };
        });
        // Gallery images
        const verifiedGallery = [];
        const galleryPrompts = generatedConfig.galleryImagePrompts || [];
        for (let i = 0; i < 4; i++) {
            const p = galleryPrompts[i] || `gallery item ${i + 1}`;
            const rawUrl = buildImgUrl(p, 1200, 800);
            verifiedGallery.push(rawUrl);
        }
        // Assemble unified configuration payload
        const trialEnds = new Date();
        trialEnds.setDate(trialEnds.getDate() + 30);
        const slug = slugify(businessName) || `site-${Math.floor(Math.random() * 10000)}`;
        const siteConfig = {
            id: slug,
            phoneNumber,
            businessName: (generatedConfig.businessName || cleanName).trim(),
            category: (generatedConfig.category || cleanCategory).trim(),
            aboutText: cleanAbout,
            theme: generatedConfig.theme,
            services: verifiedServices,
            contactDetails: generatedConfig.contactDetails,
            billingStatus: 'trial',
            trialEndsAt: trialEnds.toISOString(),
            customDomain: null,
            domainStatus: 'none',
            heroTitle: generatedConfig.heroTitle,
            heroSubtitle: generatedConfig.heroSubtitle,
            storyTitle: generatedConfig.storyTitle,
            storyContent: generatedConfig.storyContent,
            heroImage: verifiedHeroImage,
            aboutImage: verifiedAboutImage,
            galleryImages: verifiedGallery,
            features: generatedConfig.features,
            faqs: generatedConfig.faqs,
            testimonials: generatedConfig.testimonials,
            stats: generatedConfig.stats,
            brandPersonality: generatedConfig.brandPersonality,
            schemaOrg: generatedConfig.schemaOrg
        };
        // ──────────────────────────────────────────────────
        // STAGE 3: CRITIC AI AUDIT & SELF-HEALING LOOP
        // ──────────────────────────────────────────────────
        console.log('[AI Engine] Initiating Critic AI verification check...');
        const criticPrompt = `
    You are a Quality Control Inspector. Audit the following generated website configuration for a "${category}" business named "${businessName}".
    
    CONFIG TO AUDIT:
    ${JSON.stringify({
            businessName: siteConfig.businessName,
            category: siteConfig.category,
            heroTitle: siteConfig.heroTitle,
            heroSubtitle: siteConfig.heroSubtitle,
            storyTitle: siteConfig.storyTitle,
            storyContent: siteConfig.storyContent,
            services: siteConfig.services.map(s => ({ name: s.name, price: s.price, description: s.description })),
            features: siteConfig.features,
            faqs: siteConfig.faqs,
            testimonials: siteConfig.testimonials
        })}
    
    Verify the config strictly against these rules:
    1. Alignment: Do the text, services, and stories align with the category "${category}"? If there is any content mismatch (e.g. bakery copy in a gym website), flag it.
    2. Placeholders: Are there any unreplaced template placeholders (like "{{about}}", "{{business_name}}", "[Insert Name Here]", "null", "undefined")? If so, flag it.
    3. Structural Completeness: Make sure all text blocks are detailed (storyContent should have at least 120 words).
    
    Output your verification strictly in this JSON format:
    {
      "passed": true/false,
      "issues": ["list of descriptive issues found"],
      "healedConfig": {
        // ONLY provide corrected fields here if passed is false (e.g. storyContent, heroSubtitle, or services if they had placeholders or mismatches).
      }
    }
    `;
        const criticRes = await model.generateContent(criticPrompt);
        const criticText = criticRes.response.text();
        const criticOutput = JSON.parse(criticText);
        if (!criticOutput.passed) {
            console.warn('[AI Engine] Critic AI flagged validation issues:', criticOutput.issues);
            if (criticOutput.healedConfig) {
                console.log('[AI Engine] Self-healing config with Critic corrected fields...');
                const healed = criticOutput.healedConfig;
                if (healed.heroTitle)
                    siteConfig.heroTitle = healed.heroTitle;
                if (healed.heroSubtitle)
                    siteConfig.heroSubtitle = healed.heroSubtitle;
                if (healed.storyTitle)
                    siteConfig.storyTitle = healed.storyTitle;
                if (healed.storyContent)
                    siteConfig.storyContent = healed.storyContent;
                if (healed.features)
                    siteConfig.features = healed.features;
                if (healed.faqs)
                    siteConfig.faqs = healed.faqs;
                if (healed.testimonials)
                    siteConfig.testimonials = healed.testimonials;
                if (healed.services) {
                    // Keep verified images while updating healed service copy
                    siteConfig.services = siteConfig.services.map((orig, i) => {
                        const h = healed.services[i] || orig;
                        return {
                            ...orig,
                            name: h.name || orig.name,
                            price: h.price || orig.price,
                            description: h.description || orig.description
                        };
                    });
                }
            }
        }
        else {
            console.log('[AI Engine] Critic AI successfully approved the configuration!');
        }
        const sanitized = (0, contentSanitizer_1.sanitizeSiteConfig)(siteConfig, category);
        return sanitized;
    }
    catch (error) {
        console.error('[AI Engine] Error generating config with Gemini:', error.message);
        console.warn('[AI Engine] Falling back to local Mock generator.');
        return getMockWebsiteContent(phoneNumber, businessName, category, about, servicesRaw, contactRaw);
    }
}
async function modifyWebsiteConfig(currentConfig, userRequest) {
    console.log(`[AI Editor] Processing edit request for "${currentConfig.businessName}": "${userRequest}"`);
    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_GEMINI')) {
        console.warn('[AI Editor] Gemini API Key is missing. Using local Mock editor.');
        return getMockEditResult(currentConfig, userRequest);
    }
    try {
        const ai = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
        const model = ai.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        });
        const prompt = `
You are a website editor AI. A business owner wants to modify their existing website via a WhatsApp message.

CURRENT WEBSITE CONFIGURATION:
${JSON.stringify({
            businessName: currentConfig.businessName,
            category: currentConfig.category,
            heroTitle: currentConfig.heroTitle,
            heroSubtitle: currentConfig.heroSubtitle,
            storyTitle: currentConfig.storyTitle,
            storyContent: currentConfig.storyContent,
            services: currentConfig.services,
            contactDetails: currentConfig.contactDetails,
            theme: currentConfig.theme
        }, null, 2)}

USER'S EDIT REQUEST:
"${userRequest}"

INSTRUCTIONS:
1. Understand what the user wants to change.
2. Return ONLY the fields that need to be updated (do not return unchanged fields).
3. For services array: if they want to add a product, return the full updated services array. If they want to remove one, return the array without that item. If they want to change a price, update just that item.
4. Be intelligent about interpreting the request. For example "change my number" means update contactDetails.phone.

Return a JSON object with this exact structure:
{
  "success": true,
  "updatedFields": ["list of field names that were changed"],
  "summary": "A short, friendly confirmation message describing what was changed",
  "updatedConfig": {
    // Only include fields that changed. Possible fields:
    // "businessName", "heroTitle", "heroSubtitle", "storyTitle", "storyContent",
    // "services" (full array), "contactDetails" (full object), "theme" (full object), "category"
  }
}

If the request is unclear or impossible, return:
{
  "success": false,
  "updatedFields": [],
  "summary": "A friendly message asking the user to clarify what they want to change",
  "updatedConfig": {}
}
`;
        const response = await model.generateContent(prompt);
        const resultText = response.response.text();
        const editResult = JSON.parse(resultText);
        console.log('[AI Editor] Edit result:', editResult.summary);
        return editResult;
    }
    catch (error) {
        console.error('[AI Editor] Error with Gemini:', error.message);
        return getMockEditResult(currentConfig, userRequest);
    }
}
// Mock editor for when Gemini API is not available
function getMockEditResult(currentConfig, userRequest) {
    const req = userRequest.toLowerCase();
    // Handle phone number changes
    const phoneMatch = userRequest.match(/(?:phone|number|call|mobile)[:\s]*[\+]?(\d[\d\s-]{7,})/i);
    if (phoneMatch) {
        const newPhone = phoneMatch[1].replace(/[\s-]/g, '');
        return {
            success: true,
            updatedFields: ['contactDetails'],
            summary: `✅ Phone number updated to ${newPhone}`,
            updatedConfig: {
                contactDetails: { ...currentConfig.contactDetails, phone: newPhone }
            }
        };
    }
    // Handle email changes
    const emailMatch = userRequest.match(/(?:email|mail)[:\s]*([a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
    if (emailMatch) {
        return {
            success: true,
            updatedFields: ['contactDetails'],
            summary: `✅ Email updated to ${emailMatch[1]}`,
            updatedConfig: {
                contactDetails: { ...currentConfig.contactDetails, email: emailMatch[1] }
            }
        };
    }
    // Handle business name changes
    if (req.includes('change name') || req.includes('rename') || req.includes('business name')) {
        const nameMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
        if (nameMatch) {
            const newName = nameMatch[1].trim();
            return {
                success: true,
                updatedFields: ['businessName', 'heroTitle'],
                summary: `✅ Business name updated to "${newName}"`,
                updatedConfig: {
                    businessName: newName,
                    heroTitle: `Welcome to ${newName}`
                }
            };
        }
    }
    // Handle heading/title changes
    if (req.includes('heading') || req.includes('title') || req.includes('headline')) {
        const titleMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
        if (titleMatch) {
            return {
                success: true,
                updatedFields: ['heroTitle'],
                summary: `✅ Main heading updated to "${titleMatch[1].trim()}"`,
                updatedConfig: { heroTitle: titleMatch[1].trim() }
            };
        }
    }
    // Handle description/about changes
    if (req.includes('description') || req.includes('about') || req.includes('story')) {
        const descMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
        if (descMatch) {
            return {
                success: true,
                updatedFields: ['storyContent'],
                summary: `✅ About section updated.`,
                updatedConfig: { storyContent: descMatch[1].trim() }
            };
        }
    }
    // Handle address changes
    if (req.includes('address') || req.includes('location') || req.includes('area')) {
        const addrMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
        if (addrMatch) {
            return {
                success: true,
                updatedFields: ['contactDetails'],
                summary: `✅ Address updated.`,
                updatedConfig: {
                    contactDetails: { ...currentConfig.contactDetails, address: addrMatch[1].trim() }
                }
            };
        }
    }
    // Handle adding a product
    if (req.includes('add') && (req.includes('product') || req.includes('service') || req.includes('item'))) {
        const productMatch = userRequest.match(/(?:add\s+(?:a\s+)?(?:new\s+)?(?:product|service|item)[:\s]*)?(.+?)\s*[-–]\s*(₹?\d[\d,]*)/i);
        if (productMatch) {
            const newProduct = {
                name: productMatch[1].trim(),
                price: productMatch[2].includes('₹') ? productMatch[2] : `₹${productMatch[2]}`,
                description: `Premium quality ${productMatch[1].trim().toLowerCase()}.`
            };
            return {
                success: true,
                updatedFields: ['services'],
                summary: `✅ Added "${newProduct.name}" (${newProduct.price}) to your menu.`,
                updatedConfig: {
                    services: [...currentConfig.services, newProduct]
                }
            };
        }
    }
    // Handle removing a product
    if (req.includes('remove') || req.includes('delete')) {
        const itemName = userRequest.replace(/(?:remove|delete)\s+/i, '').trim();
        const updatedServices = currentConfig.services.filter(s => !s.name.toLowerCase().includes(itemName.toLowerCase()));
        if (updatedServices.length < currentConfig.services.length) {
            return {
                success: true,
                updatedFields: ['services'],
                summary: `✅ Removed "${itemName}" from your menu.`,
                updatedConfig: { services: updatedServices }
            };
        }
    }
    // Handle price changes
    if (req.includes('price') || req.includes('cost') || req.includes('charge')) {
        const priceMatch = userRequest.match(/(.+?)\s*(?:price|cost|charge)\s*(?:to|as|:)\s*(₹?\d[\d,]*)/i);
        if (priceMatch) {
            const updatedServices = currentConfig.services.map(s => {
                if (s.name.toLowerCase().includes(priceMatch[1].trim().toLowerCase())) {
                    return { ...s, price: priceMatch[2].includes('₹') ? priceMatch[2] : `₹${priceMatch[2]}` };
                }
                return s;
            });
            return {
                success: true,
                updatedFields: ['services'],
                summary: `✅ Price updated for "${priceMatch[1].trim()}" to ${priceMatch[2]}.`,
                updatedConfig: { services: updatedServices }
            };
        }
    }
    // Handle hours changes
    if (req.includes('hours') || req.includes('timing') || req.includes('open') || req.includes('close')) {
        const hoursMatch = userRequest.match(/(?:to|as|:)\s*["']?(.+?)["']?\s*$/i);
        if (hoursMatch) {
            return {
                success: true,
                updatedFields: ['contactDetails'],
                summary: `✅ Business hours updated.`,
                updatedConfig: {
                    contactDetails: { ...currentConfig.contactDetails, hours: hoursMatch[1].trim() }
                }
            };
        }
    }
    // Fallback: unclear request
    return {
        success: false,
        updatedFields: [],
        summary: `I couldn't understand what you'd like to change. Try something like:\n\n• "Change phone number to 9876543210"\n• "Add product: Vanilla Cake - ₹450"\n• "Remove Croissant"\n• "Change heading to Best Bakery in Town"\n• "Update address to MG Road, Bangalore"`,
        updatedConfig: {}
    };
}
